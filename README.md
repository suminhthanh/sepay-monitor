# SePay Monitor

<p align="center">
  <img src="src/assets/logo.svg" width="96" height="96" alt="SePay Monitor Logo" />
</p>

<p align="center">
  Ứng dụng desktop theo dõi giao dịch ngân hàng realtime, tự động thông báo bằng giọng nói khi có tiền vào tài khoản.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Tauri-2.x-blue" alt="Tauri" />
  <img src="https://img.shields.io/badge/React-19-61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-Apache%202.0-green" alt="License" />
</p>

---

## Tính năng

- **Realtime polling** — Tự động kiểm tra giao dịch mới mỗi 5 giây qua SePay API
- **Thông báo giọng nói** — Đọc số tiền và nội dung giao dịch bằng Web Speech API
- **Desktop notification** — Hiển thị popup thông báo native khi có tiền vào
- **Lịch sử giao dịch** — Lưu toàn bộ lịch sử vào SQLite, xem lại bất cứ lúc nào
- **Xuất Excel** — Export lịch sử giao dịch ra file `.xlsx`
- **Lọc giao dịch** — Mặc định chỉ thông báo tiền vào, có thể bật thêm tiền ra
- **System tray** — Chạy nền, minimize to tray, không chiếm taskbar
- **Auto-start** — Tự động khởi động cùng máy tính

## Yêu cầu hệ thống

| Hệ điều hành | Phiên bản tối thiểu |
|---|---|
| macOS | 10.15 (Catalina) trở lên |
| Windows | Windows 10 trở lên |
| Linux | Ubuntu 22.04 / Debian 11 trở lên |

---

## Hướng dẫn sử dụng

### 1. Cài đặt

Tải file cài đặt phù hợp với hệ điều hành từ [Releases](../../releases):

- **macOS**: `.dmg`
- **Windows**: `.msi` hoặc `.exe`
- **Linux**: `.deb` hoặc `.AppImage`

### 2. Cấu hình API Token

1. Mở app → vào tab **Cài đặt**
2. Nhập **SePay API Token** vào ô tương ứng
3. Nhấn **Lưu**
4. Nhấn **Kiểm tra kết nối** để xác nhận token hợp lệ

> Lấy API token tại: [my.sepay.vn](https://my.sepay.vn) → Tài khoản → API

### 3. Cài đặt thông báo

| Tùy chọn | Mô tả | Mặc định |
|---|---|---|
| Thông báo giọng nói | Đọc giao dịch bằng TTS | Bật |
| Giọng đọc | Chọn giọng từ danh sách hệ thống | Mặc định |
| Thông báo desktop | Hiển thị popup native | Bật |
| Chỉ thông báo tiền vào | Bỏ qua giao dịch tiền ra | Bật |
| Khởi động cùng máy | Auto-start khi đăng nhập | Tắt |

### 4. Xem lịch sử & Xuất Excel

- Tab **Lịch sử** hiển thị toàn bộ giao dịch đã nhận
- Nhấn **Xuất Excel** để lưu ra file `.xlsx`

---

## Hướng dẫn phát triển

### Yêu cầu

- [Node.js](https://nodejs.org) 20+
- [Rust](https://rustup.rs) 1.77.2+
- [Tauri prerequisites](https://tauri.app/start/prerequisites/) cho hệ điều hành của bạn

### Cài đặt môi trường

```bash
# Clone repo
git clone https://github.com/suminhthanh/sepay-monitor.git
cd sepay-monitor

# Cài dependencies
npm install
```

### Chạy development

```bash
npm run tauri dev
```

Vite dev server khởi động tại `http://localhost:1420`, Tauri window mở tự động.

### Build production

```bash
npm run tauri build
```

Output tại `src-tauri/target/release/bundle/`.

### Cấu trúc project

```
sepay-monitor/
  src/                    # React frontend
    components/ui/        # shadcn/ui components
    db/                   # Drizzle ORM schema + queries
    hooks/                # React hooks
    lib/                  # TTS, format, export utilities
    pages/                # Dashboard, History, Settings
    stores/               # Zustand state stores
  src-tauri/              # Rust backend
    src/
      lib.rs              # Tauri setup, plugins, tray
      sepay/              # SePay API client
      polling/            # 5s polling engine
  .github/workflows/      # CI/CD (release on tag)
  process/                # Development context & plans
```

### Tech stack

| Layer | Technology |
|---|---|
| Desktop shell | Tauri 2.x |
| Frontend | React 19 + TypeScript 5 + Vite 7 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| State | Zustand |
| Database | SQLite + Drizzle ORM + tauri-plugin-sql |
| TTS | Web Speech API |
| Backend | Rust + reqwest + tokio |

### Release

Tạo tag để trigger GitHub Actions build tự động:

```bash
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions sẽ build installer cho macOS, Windows, và Linux.

---

## Disclaimer

> **SePay Monitor là dự án độc lập, không có bất kỳ liên kết, hợp tác, hay quan hệ chính thức nào với SePay (Công ty Cổ phần Công nghệ SePay).**

Ứng dụng này sử dụng SePay Public API theo đúng tài liệu công khai tại [docs.sepay.vn](https://docs.sepay.vn). Mọi thương hiệu, tên gọi, và logo của SePay là tài sản của Công ty Cổ phần Công nghệ SePay.

Tác giả không chịu trách nhiệm về bất kỳ tổn thất tài chính, mất dữ liệu, hoặc sự cố nào phát sinh từ việc sử dụng ứng dụng này. **Sử dụng hoàn toàn theo rủi ro của người dùng.**

---

## License

```
Copyright 2026 suminhthanh & Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

---

## Built with vibecode-pro-max-kit

Dự án này được phát triển với sự hỗ trợ của [vibecode-pro-max-kit](https://github.com/withkynam/vibecode-pro-max-kit) — một bộ agent harness cho Claude Code theo phương pháp RIPER-5 (Research → Innovate → Plan → Execute → Update Process).

Bộ kit cung cấp:
- **12 specialized agents** — research, plan, execute, debug, review, simplify, và nhiều hơn
- **31 workflow skills** — từ context generation đến security audit
- **RIPER-5 methodology** — quy trình phát triển có kiểm soát, tránh implement sai hướng
- **Shared `process/` directory** — context, plans, và protocols dùng chung giữa Claude Code và Codex

Toàn bộ MVP của SePay Monitor (9 phases, ~2000 dòng code) được implement trong một session duy nhất với zero manual coding.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
