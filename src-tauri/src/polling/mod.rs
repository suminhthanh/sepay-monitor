use std::sync::atomic::{AtomicBool, Ordering};
use std::time::Duration;
use tauri::{AppHandle, Emitter};
use tauri_plugin_store::StoreExt;
use crate::sepay::client::SePayClient;
use crate::sepay::client::SePayTransaction;

static POLLING_ACTIVE: AtomicBool = AtomicBool::new(false);

#[derive(Clone, serde::Serialize)]
pub struct NewTransactionEvent {
    pub id: i64,
    pub transaction_date: String,
    pub amount_in: f64,
    pub amount_out: f64,
    pub transaction_content: String,
    pub account_number: String,
    pub bank_brand_name: String,
}

impl From<SePayTransaction> for NewTransactionEvent {
    fn from(tx: SePayTransaction) -> Self {
        Self {
            id: tx.id,
            transaction_date: tx.transaction_date,
            amount_in: tx.amount_in.unwrap_or(0.0),
            amount_out: tx.amount_out.unwrap_or(0.0),
            transaction_content: tx.transaction_content.unwrap_or_default(),
            account_number: tx.account_number.unwrap_or_default(),
            bank_brand_name: tx.bank_brand_name.unwrap_or_default(),
        }
    }
}

pub fn start_polling(app: AppHandle) {
    if POLLING_ACTIVE.swap(true, Ordering::SeqCst) {
        return; // already running
    }

    tauri::async_runtime::spawn(async move {
        let client = SePayClient::new();
        loop {
            if !POLLING_ACTIVE.load(Ordering::SeqCst) {
                break;
            }

            let token = {
                let store = app.store("settings.json");
                match store {
                    Ok(s) => s
                        .get("api_token")
                        .and_then(|v| v.as_str().map(|s| s.to_string())),
                    Err(_) => None,
                }
            };

            if let Some(token) = token {
                if !token.is_empty() {
                    // Read since_id from DB via frontend (emit request) or use app state
                    // We emit a request to frontend to get since_id, then poll
                    let since_id = get_since_id_from_store(&app);

                    match client.fetch_transactions(&token, since_id, 20).await {
                        Ok(txs) => {
                            let new_txs: Vec<SePayTransaction> = txs
                                .into_iter()
                                .filter(|tx| tx.id > since_id)
                                .collect();

                            if !new_txs.is_empty() {
                                let max_id = new_txs.iter().map(|tx| tx.id).max().unwrap_or(since_id);
                                save_since_id_to_store(&app, max_id);

                                for tx in new_txs {
                                    let event: NewTransactionEvent = tx.into();
                                    let _ = app.emit("new-transaction", event);
                                }
                            }
                        }
                        Err(e) => {
                            eprintln!("Polling error: {}", e);
                        }
                    }
                }
            }

            tokio::time::sleep(Duration::from_secs(5)).await;
        }
    });
}

pub fn stop_polling() {
    POLLING_ACTIVE.store(false, Ordering::SeqCst);
}

fn get_since_id_from_store(app: &AppHandle) -> i64 {
    app.store("settings.json")
        .ok()
        .and_then(|s| s.get("since_id"))
        .and_then(|v| v.as_i64())
        .unwrap_or(0)
}

fn save_since_id_to_store(app: &AppHandle, id: i64) {
    if let Ok(store) = app.store("settings.json") {
        let _ = store.set("since_id", serde_json::json!(id));
        let _ = store.save();
    }
}
