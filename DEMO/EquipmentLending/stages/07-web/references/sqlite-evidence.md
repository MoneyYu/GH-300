# SQLite 與 Browser API 查證記錄

## Node.js SQLite

- **目標版本：**Node.js 24；此專案使用 `node:sqlite` 的同步 `DatabaseSync` API。Node 文件將其標示為 experimental，可能變更；此處是課堂樣本，不表示 production 支援承諾。
- **直接官方文件：**[Node.js v24.0.0 — SQLite](https://nodejs.org/download/release/v24.0.0/docs/api/sqlite.html)。本次查對 `DatabaseSync` 建構／`:memory:`、`readOnly`、`exec`、`prepare`、prepared statement `run/get/all` 與 `close`。
- **SQLite partial unique index：**[SQLite partial indexes](https://www.sqlite.org/partialindex.html)。Schema 以 `CREATE UNIQUE INDEX ... ON loans(equipment_id) WHERE returned_at_ms IS NULL` 表達每台設備最多一筆有效借用。
- **SQLite transaction：**[SQLite transactions](https://www.sqlite.org/lang_transaction.html)。寫入使用同步 `BEGIN IMMEDIATE`／`COMMIT`，例外時回滾；不把 busy／locked 誤當成功。
- **查證方式限制：**此 session 沒有 Context7 MCP 工具。`extensions_manage` 回報沒有已載入的 extensions；不得把以上直接讀取官方文件稱為 Context7 查詢。P05 需要在工具可用的 session 重新實測。

## Playwright

- **測試 runner：**固定 `@playwright/test@1.63.0`。以套件鎖定版本跑 `pnpm test:browser`。
- **MCP package：**固定 `@playwright/mcp@0.0.83`，作為待驗證 MCP 套件；實際 MCP server／browser 沒有在此 session 載入，因此安裝 package 不等同 MCP 操作成功。
- **官方文件：**[Playwright Test fixtures](https://playwright.dev/docs/test-fixtures)、[webServer](https://playwright.dev/docs/test-webserver)、[Browser.newContext options](https://playwright.dev/docs/api/class-browser#browser-new-context)。本次依官方 API 實作隔離 fixture、兩個 browser context 與 `timezoneId`。
- **版本邊界：**Playwright MCP 與 `@playwright/test` 是不同套件／版本路徑，runner 的 Chromium 成功不證明 MCP snapshot 或 tool call 成功。
