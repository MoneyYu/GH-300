# 06 — SQLite persistence

CLI 與 service 使用 Node.js `node:sqlite`，只可對新 DB 路徑執行 `node src/cli.js init`。預設啟動／report 不會自動建立或重設資料庫；report 是唯讀操作。先安裝 Node 24，不需第三方 runtime 套件。
