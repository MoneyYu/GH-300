# GH-300 團隊設備借用 Demo

以一套有狀態的團隊設備借用系統，實際示範從 inline completion、Agent 修正 regression、refactor、測試、查文件、SQLite 持久化，到 HTTP、原生網頁、瀏覽器驗收與 read-only Skill 的完整開發流程。它不是企業資產管理產品，也不只是版本範圍檢查器換皮。

## 功能與邊界

- 三台固定虛構設備：`EQ-001` 示範相機、`EQ-002` 示範投影機、`EQ-003` 示範筆電。
- 借用、阻擋有效借用的重複借出、歸還、再借；所有借用歷史保留。
- 初次初始化會為 `EQ-003` 建立一筆逾期展示資料，無須等待時間跨過期限。
- API／SQLite 儲存 UTC 瞬間；期限是固定經過時間 `days × 86,400,000 ms`。網頁只依瀏覽器 IANA 時區顯示，每筆時間各自包含 UTC offset；時區不改變期限、逾期判定或排序。
- 無登入、身分驗證、真實個資、設備管理、預約、通知、雲端部署、Docker、Azure 或 Terraform。只使用 `DEMO-A`、`DEMO-B` 等虛構借用人代號。
- HTTP server 僅監聽 `127.0.0.1`；請勿透過 port forwarding 或 proxy 對外公開。

## 環境

- Node.js 24、pnpm 10.33.2；專案以 ES modules 與 Node 內建 `node:test` 執行。
- SQLite 使用 Node 24 的 `node:sqlite`，此 API 會顯示 experimental warning；本 Demo 不宣稱適合直接作為 production 資料庫方案。
- Playwright runner 固定 `@playwright/test@1.63.0`；Playwright MCP 固定 `@playwright/mcp@0.0.83`。兩者不是同一 Playwright 版本，也不能互相代替。

## 安裝、測試與啟動

在此目錄執行。地端工作站使用組織的 npm proxy：

```powershell
pnpm install --registry=https://packagefeedproxy.microsoft.io/npm/
pnpm test
pnpm exec playwright install chromium
pnpm test:browser
```

`pnpm test` 只跑 `tests\core.test.js`、`time.test.js`、`service.test.js`、`cli.test.js` 與 `server.test.js`；瀏覽器測試需另外執行 `pnpm test:browser`。Playwright browser binaries 由 Playwright 安裝工具另外取得。

第一次排練請使用一個尚不存在的新資料庫路徑；初始化會採排他建立，既有路徑會拒絕而不覆寫：

```powershell
node src\cli.js init --database data\equipment-demo.sqlite
node src\cli.js report --json --database data\equipment-demo.sqlite
$env:DATABASE_PATH = 'data\equipment-demo.sqlite'
node src\server.js
```

瀏覽器開啟 `http://127.0.0.1:3000`。再次啟動時不要重跑 `init`；server 只開啟已初始化資料庫。`init` 沒有 reset／delete 功能，日常借還及 `report` 不會自動建立、清空或重新 seed DB。

CLI 也可以獨立操作：

```powershell
node src\cli.js borrow EQ-001 DEMO-A 7 --database data\equipment-demo.sqlite
node src\cli.js return 2 --database data\equipment-demo.sqlite
node src\cli.js report --json --database data\equipment-demo.sqlite
```

回傳中的 `loanId` 才是 `return` 要使用的借用編號。不要把上例 `2` 當成每次初始化後都相同的 ID。

## 驗收與教學材料

- [`PROMPTS.md`](PROMPTS.md)：JavaScript P00–P11 與語言中立 L00–L10 可複製提示。
- [`RUNBOOK.md`](RUNBOOK.md)：講師低等待、學員從零、MCP／工具不可用及恢復點。
- [`stages\`](stages)：00 starter 到 07 完整網站的八個獨立快照；只有 `02-buggy` 預期 regression failure。
- [`scripts\verify-stages.ps1`](scripts/verify-stages.ps1)：把快照複製到新的 repository 外目錄並驗證；目的路徑若已存在會拒絕。可先加 `-ValidateOnly` 只檢查路徑，不建立輸出。
- [`references\ui-style.md`](references/ui-style.md)：色彩 token、時區顯示與 accessibility 契約。
- [`references\sqlite-evidence.md`](references/sqlite-evidence.md)：Node／SQLite API 來源及查證界線。
- [`references\verification.md`](references/verification.md)：本次實際執行的命令、結果與未驗證能力。

完整需求與人工 acceptance fixture 在 [`fixtures\acceptance-cases.json`](fixtures/acceptance-cases.json)。自動測試不是三個獨立 oracle：CLI、HTTP 與網頁共用同一個 service，應以 fixture 的手寫預期值核對業務結果。

## 資料保護

預設資料在 `data\equipment-demo.sqlite`；測試資料在 `.test-data\`。兩者都被 Git 忽略。請勿手動刪除 DB、測試資料、錯誤快照或他人檔案；需要不同狀態時建立另一個明確命名的新 DB／快照。`report` 與新 Skill 只讀，不會初始化或修改資料。
