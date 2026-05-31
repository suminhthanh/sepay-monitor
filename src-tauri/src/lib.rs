mod sepay;
mod polling;

use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, WindowEvent,
};
use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_store::StoreExt;

#[tauri::command]
fn start_polling(app: tauri::AppHandle) {
    polling::start_polling(app);
}

#[tauri::command]
fn stop_polling() {
    polling::stop_polling();
}

#[tauri::command]
async fn test_connection(token: String) -> Result<String, String> {
    let client = sepay::client::SePayClient::new();
    match client.fetch_transactions(&token, 0, 1).await {
        Ok(_) => Ok("Connection successful".to_string()),
        Err(e) => Err(e),
    }
}

#[tauri::command]
fn set_api_token(app: tauri::AppHandle, token: String) -> Result<(), String> {
    let store = app.store("settings.json").map_err(|e: tauri_plugin_store::Error| e.to_string())?;
    store.set("api_token", serde_json::json!(token));
    store.save().map_err(|e: tauri_plugin_store::Error| e.to_string())?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_sql::Builder::new()
            .add_migrations("sqlite:sepay-monitor.db", vec![
                tauri_plugin_sql::Migration {
                    version: 1,
                    description: "create_initial_tables",
                    sql: "
                        CREATE TABLE IF NOT EXISTS transactions (
                            id INTEGER PRIMARY KEY,
                            account_number TEXT NOT NULL,
                            bank_brand_name TEXT NOT NULL DEFAULT '',
                            amount_in REAL NOT NULL DEFAULT 0,
                            amount_out REAL NOT NULL DEFAULT 0,
                            transaction_content TEXT NOT NULL DEFAULT '',
                            transaction_date TEXT NOT NULL,
                            announced INTEGER NOT NULL DEFAULT 0,
                            created_at TEXT NOT NULL
                        );
                        CREATE TABLE IF NOT EXISTS app_state (
                            key TEXT PRIMARY KEY,
                            value TEXT NOT NULL
                        );
                    ",
                    kind: tauri_plugin_sql::MigrationKind::Up,
                }
            ])
            .build()
        )
        .plugin(
            tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, Some(vec![]))
        )
        .setup(|app| {
            // System tray
            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let show = MenuItem::with_id(app, "show", "Show", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show, &quit])?;

            TrayIconBuilder::new()
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            // Auto-start polling if token exists
            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                tokio::time::sleep(std::time::Duration::from_millis(500)).await;
                polling::start_polling(app_handle);
            });

            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.hide();
            }
        })
        .invoke_handler(tauri::generate_handler![
            start_polling,
            stop_polling,
            test_connection,
            set_api_token,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
