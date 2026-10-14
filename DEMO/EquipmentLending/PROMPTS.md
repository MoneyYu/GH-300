# 團隊設備借用系統：可複製教學 Prompts

每一段都是獨立可複製的提示。JavaScript P00–P11 主線在學員自己的空白練習 repo 依序執行；不要依賴講師快照、複製父 repo 的依賴或覆寫既有資料。`stages\` 只供講師恢復／對照，`02-buggy` 不是最終版本。L00–L10 是語言中立提示，未排練的語言不代表已驗證。

## JavaScript 主線 P00–P11

### P00-Preflight — 確認空白練習 repo

```text
請先檢查目前工作目錄、Node.js 與 pnpm 版本，不要修改檔案、安裝套件或初始化 Git。回報目前路徑、node --version、pnpm --version、目錄是否為空白練習 repo，以及它是否位於 GH-300 repository 之外。若目錄已有程式碼／資料或位於課程 repo 內，先停止並請我另開新目錄；不要清理、覆寫資料或要求我使用講師快照。此時 acceptance fixture 尚未建立；下一步 P00 會建立它。
```

### P00 — 建立 scaffold 與起始 scenario

```text
只在已通過 P00-Preflight 的空白學生 repo 建立起始 scaffold，不讀取或複製 `stages\`。建立 `package.json`（`type: module`，test script 為 `node --test tests/scenario.test.js`）、`fixtures/acceptance.json`、`src/scenario.js` 與 `tests/scenario.test.js`。Fixture 的 `at` 固定為 `2026-01-15T00:00:00.000Z`，operations 依序借 EQ-001 給 DEMO-A 7 天、歸還 loan 1、再借 EQ-001 給 DEMO-B 7 天。測試使用手寫預期：三個結果狀態為 borrowed／returned／borrowed，第一筆到期 `2026-01-22T00:00:00.000Z`，保留兩筆歷史，第一筆歸還時間為 `2026-01-15T00:00:00.000Z`。`src/scenario.js` 只建立 `export function runScenario(operations)` 的明確 TODO stub，不實作規則；執行 `node --test tests/scenario.test.js` 並確認它因 stub 尚未完成而失敗。固定一天為 `86,400,000 ms`，七天為 `604,800,000 ms`。不要加入資料庫、HTTP、網頁、真實個資或外部依賴。
```

### P01 — Inline Code Completion

```text
請勿直接代寫整個檔案。使用編輯器 Inline Completion，從游標所在位置補完單一 `runScenario(operations)` 函式，讓借用、歸還與再借的結果符合 fixtures/acceptance.json。只接受與需求相符的 completion；完成後展示實際由 completion 產生的 diff，執行 `node --test tests/scenario.test.js` 並解釋輸出。若目前工具沒有 Inline Completion，明確記錄未驗證，不要把 Agent 產生程式碼稱為 completion。
```

### P01B — 故障注入（P02 前必做）

```text
在目前學生 repo 的 `src/scenario.js` 暫時注入唯一教學缺陷：把「曾有任何借用紀錄」誤當成「仍借用中」。先確認 P01 的 regression 原本通過，再執行 `node --test tests/scenario.test.js`，確認借→還→再借案例因此失敗。只改該判斷，不改 fixture、期限或其他規則；P02 會在同一 repo 修復它。講師可用 `stages\02-buggy` 示範／恢復，但不可要求學生依賴該快照；不得把故障帶入最終版本。
```

### P02 — Agent 重現並修正 Bug

```text
只在目前學生 repo 工作。讀 `src/scenario.js`、`tests/scenario.test.js` 與 P01B 的 red 輸出；確認失敗是歸還後再借被拒絕，不改 fixture 或其他規則。由 Agent 只修正「設備目前是否有未歸還借用」判斷，再執行 `node --test tests/scenario.test.js`；說明 red／green 分別證明什麼。不要切換到或複製 `02-buggy`／`03-fixed`。
```

### P03 — Refactor，不改行為

```text
在目前已通過 P02 的學生 repo 先執行現有測試並記錄結果，再把流程拆成純借還規則與共用 service。CLI scenario 與 service 必須呼叫相同規則；每個操作只讀取一次 clock。不要新增資料庫、HTTP、網頁或功能。修改後重跑同一 regression，並逐項比較結果欄位、錯誤 code、到期瞬間與歷史筆數。講師可用 `stages\04-refactored` 作為恢復副本，不要求學生切換工作目錄。
```

### P04 — Agent 建立單元測試

```text
在目前學生 repo 先看領域契約，再以 node:test/assert 撰寫行為測試：設備不存在、重複借用、錯誤借用人代號、天數 1／14 與無效天數、到期前 1 ms／到期當下、歸還後不再逾期、重複歸還、借→還→再借。每個測試需有明確 Arrange／Act／Assert，測真正邏輯而非 mock 呼叫次數。先確認新案例會在適當缺陷下失敗，再完成實作；更新 `package.json` 的 `test` script 以執行全部單元測試，執行 `pnpm test`。此階段不增加依賴，也不以安裝或升級工具鏈掩蓋故意不完整的 baseline。
```

### P05-Setup — 查文件前確認 MCP

```text
請檢查目前 session 是否真的提供 Context7 MCP，以及它是否能查詢 Node.js SQLite 文件。只回報可見工具與必要的授權限制；不要猜測 MCP server 名稱、CLI 設定格式或登入方式。若不可用，停止此 MCP 步驟，改查課程 repo `DEMO\EquipmentLending\references\sqlite-evidence.md` 列出的 Node.js v24 官方文件，並把「Context7 未驗證」保留在結果中。
```

### P05 — Context7 查 Node SQLite

```text
若目前真的可用，請用 Context7 查 Node.js v24 `node:sqlite` 的 `DatabaseSync`、同步 prepared statement、`readOnly` 開啟、關閉、transaction／錯誤處理及版本限制。回報實際 library ID、查詢內容、文件版本與結果；不要將 SQLite 官方網站或 Playwright runner 說成 Context7。若 MCP 不可用，明確停止並改讀 README 所列 Node 官方文件；保留缺口，不臆造結果。
```

### P06 — 加入 SQLite 持久化

```text
以文件查證後的版本契約實作本機 SQLite：equipment／loans、foreign key、`returned_at_ms IS NULL` 的 partial unique index、schema version、prepared statements 與同步 transaction。`init` 只對不存在路徑排他建立；既有 DB、缺失 DB、錯誤 schema 都明確失敗，不 reset、不刪除、不 migration。正式 borrow／return 使用 server clock；report 使用唯讀連線。先為持久化與保留歷史新增測試，再實作；使用新的明確 DB 路徑，禁止觸碰其他資料。
```

### P07 — HTTP 契約

```text
以同一個 lending service 建立 loopback HTTP server，只監聽 127.0.0.1。提供 GET /api/health、GET /api/state、POST /api/loans、POST /api/loans/:loanId/return。保留 400／404／409／413／415／405／503／500 狀態及 `{error:{code,message}}`；未知例外必須記錄，回應不可洩漏內部錯誤。固定靜態路由白名單，不開 CORS，mutation 驗證 Origin／Host。同時新增契約測試，不讓 API 重新實作借還規則。
```

### P08 — 原生網頁與時區

```text
以原生 HTML／CSS／JavaScript 接上真實 HTTP API，不使用假資料。顯示三台設備、可借／借用中／逾期、統計、借用人代號、借出／到期／歸還歷史、狀態篩選、更新時間與錯誤狀態。借用／歸還成功後重讀 API；409 衝突需保留表單輸入並更新畫面。使用 DOM API 與 textContent，不用 innerHTML 注入資料。API 永遠只交換 UTC 瞬間；前端以 browser IANA timezone 及每筆瞬間的 longOffset 顯示，不手動加時差、不改期限或排序。遵循本文件「共同網頁契約」中的完整 theme/token/accessibility 規格，並在學生 repo 建立 `references/ui-style.md` 保存相同規格；不要假定空白 repo 已有此檔。
```

### P09-Setup — Playwright runner

```text
在目前學生 repo 為 browser runner 明確加入固定的 `@playwright/test@1.63.0` 與 `@playwright/mcp@0.0.83` devDependencies，設定 `test:browser` 只選 `tests/browser.spec.js`，再執行 `pnpm install --registry=https://packagefeedproxy.microsoft.io/npm/` 與 `pnpm exec playwright install chromium`。每個案例使用新且不覆寫的 SQLite 路徑與自己的 server。不要把 MCP 版本當 runner 版本；MCP browser／tool 必須另外確認，不推測 server 設定或操作命令。依賴缺失時停止並記錄，不改全域環境或靜默換 registry。
```

### P09 — 真實瀏覽器驗收

```text
以真實 Chromium 瀏覽器操作 UI，而不是只呼叫 API。按人工 acceptance fixture 驗證初始逾期 seed、借用、雙 context 同台競爭、409 後輸入保留、歸還、再借、歷史、刷新及完整 server 關閉／重啟後的持久化。另以 `Asia/Taipei` 與 `America/Los_Angeles` context 格式化 `2026-03-08T09:30:00.000Z` 及 24 小時後的瞬間，逐字核對 IANA 名稱、offset、狀態相同。只報實際瀏覽器結果；API 和 UI 共用 service，不要聲稱有獨立 oracle。
```

### P10 — 只讀設備報告 Skill

```text
在目前學生 repo 建立 `.github/skills/equipment-lending-report/SKILL.md`，只允許於此 repo 執行 `report --json` 與既有 `pnpm test`。不得執行 init、borrow、return、migration、reset、刪檔、安裝或存取其他專案。資料庫缺失、測試失敗或 Skill 無法載入時明確回報；不要自動補環境或生成成功形狀的空報告。測試前先核對命令、工作目錄、DB 是否存在及唯讀不變量；本 prompt 不宣稱 Skill 已在新 session 載入。
```

### P11 — 講師準備與備案

```text
依 RUNBOOK 逐段核對空白學生 repo 的連續 P00–P11、講師恢復快照、觀眾可見輸出、必要命令及停止條件。逐項區分已驗證的 Node tests、Playwright runner、Context7 MCP、Playwright MCP、Skill 載入及 Inline Completion；沒有實測證據的項目標示未驗證，禁止借用舊 demo 的成功紀錄。保留失敗現場，不 reset；需要恢復時另開副本並明確標示使用的是講師快照。
```

## 語言中立 L00–L10

以下提示保留相同業務與資料契約，讓學員先選自己的語言／工具鏈，再以該語言官方文件實作。Node.js、pnpm、Node 原生 SQLite 或此 repo 的命令只適用於 JavaScript 主線；此處不宣稱 C#、Python、Java 或其他語言已排練。

### L00 — 選定工具鏈與需求

```text
先確認本練習的語言、版本、套件管理工具、測試框架及本機 SQLite driver，再讀固定 acceptance fixture。不可安裝依賴、變更全域環境或假定任何語言已準備好。若工具鏈不存在，先記錄缺口並停止。
```

### L01 — Inline Completion

```text
用目前編輯器的 inline completion 只完成一個程序內的設備借用 scenario，符合固定 fixture 的借→還→再借、UTC 到期與保留歷史。若沒有 inline completion 工具，不要由 Agent 代寫後宣稱通過；只回報未驗證。
```

### L01B — 明示故障副本（可選）

```text
僅在獨立的 buggy 副本刻意注入一個錯誤：把「曾有借用紀錄」誤當作「仍借用中」。執行回歸案例，確認它只因歸還後再借失敗。不要把故障傳遞到其他快照。
```

### L02 — Agent 修正 regression

```text
先新增並執行借出→歸還→再借的失敗測試，再由 Agent 只修正有效借用判斷。保留原錯誤輸出、錯誤 code、UTC deadline、資料與其他使用者檔案；修正後重跑同一測試並說明證據。
```

### L03 — 抽離可重用規則

```text
將借用／歸還規則與 I/O 分開，讓 console／測試／服務共用同一組領域邏輯。每個操作只讀取一次 server clock；不得把 UI 時區字串帶入資料模型，不增加功能。
```

### L04 — 單元測試

```text
使用目前語言的既有 test runner，依 Arrange／Act／Assert 驗證正常借還、重複借用、無效輸入、到期前 1 ms／當下、歸還、重複歸還與再借。先觀察 regression test 因預期行為失敗，再實作；不新增套件或升級工具鏈來掩蓋不相容。
```

### L05 — 官方文件查詢

```text
用本環境實際可用的文件查詢工具，查所選語言／版本的 SQLite driver、同步或非同步 transaction、read-only connection、prepared statement 與版本限制。記錄 library ID、版本、查詢與原始結果；工具不可用時說明並改查廠商官方固定版本文件，不冒稱使用 MCP。
```

### L06 — 持久化與唯讀查詢

```text
新增設備與借用紀錄資料表，使用適合目前資料庫的唯一限制，保證每台設備最多一筆未歸還紀錄。初始化只建立新的明確路徑；不能 reset、覆寫或刪除。所有使用者值採參數化查詢；report 使用唯讀連線，缺檔或 schema 不相容須顯式失敗。
```

### L07 — HTTP API

```text
由單一 service 提供狀態、借用與歸還 API；保持同一錯誤契約：輸入 400、不存在 404、狀態衝突 409、超大 body 413、媒體類型 415、method 不符 405、資料庫忙碌 503、未知錯誤記錄後 500。僅綁定 loopback、同源、不開 CORS、不由請求指定 DB 路徑。
```

### L08 — 操作網頁

```text
以所選語言與既有 web stack 將真實 API 接上介面。提供設備狀態、統計、狀態篩選、借用／歸還、歷史、更新時間及可恢復錯誤；狀態與錯誤不可只靠顏色。時間 API 保持 UTC；顯示採 browser IANA zone 與該筆 instant offset。完整 UI token、無障礙與 XSS 安全契約見本文件共同網頁契約；不要把日期顯示改成業務判斷。
```

### L09 — 瀏覽器驗證

```text
選擇目前語言可支援的真實瀏覽器自動化工具，逐項驗收同一人工 fixture：雙 context 衝突、歸還再借、歷史、錯誤復原、重啟持久化，以及台北／洛杉磯的 DST 前後 offset。逐項註明實際工具、版本、命令與結果；runner 不是 MCP，不能互稱已通過。
```

### L10 — Read-only Skill

```text
新增只讀查詢 Skill／Agent：僅在指定專案執行資料庫 report 與既有測試，拒絕借出、歸還、初始化、遷移、reset、刪除、安裝與外部專案路徑。缺少 DB 或測試失敗時明示，不修復、不清理，也不回傳假成功。
```

## 共同網頁契約（P08／L08 必須完整提供）

Theme script 必須放在 `index.html` 的第一段 `<script>`，且在任何其他 JavaScript 之前：

```html
<script>
  (() => {
    const param = new URLSearchParams(window.location.search).get("scoutTheme");
    const theme =
      param || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  })();
</script>
```

Light／dark CSS tokens 如下；元件顏色只可使用 `var(--cp-*)`，不可在元件規則硬編碼 hex／rgb／hsl：

```css
:root {
  color-scheme: light;
  --cp-bg: #f7f4ef;
  --cp-bg-elevated: #fcfbf8;
  --cp-surface: #ffffff;
  --cp-surface-soft: #f5f5f5;
  --cp-border: #dedede;
  --cp-border-strong: #919191;
  --cp-text: #242424;
  --cp-text-muted: #5c5c5c;
  --cp-text-soft: #6f6f6f;
  --cp-accent: #b11f4b;
  --cp-accent-hover: #9a1a41;
  --cp-accent-soft: rgba(177, 31, 75, 0.08);
  --cp-accent-fg: #ffffff;
  --cp-success: #16a34a;
  --cp-danger: #dc2626;
  --cp-warning: #f59e0b;
  --cp-link: #0078d4;
  --cp-shadow: 0 18px 48px rgba(0, 0, 0, 0.12);
  --cp-overlay: rgba(255, 255, 255, 0.8);
  --cp-panel: rgba(255, 255, 255, 0.86);
  --cp-panel-strong: rgba(255, 255, 255, 0.96);
  --cp-sheen: rgba(255, 255, 255, 0.55);
  --cp-highlight: rgba(177, 31, 75, 0.12);
}
html[data-theme="dark"] {
  color-scheme: dark;
  --cp-bg: #3d3b3a;
  --cp-bg-elevated: #343231;
  --cp-surface: #292929;
  --cp-surface-soft: #2e2e2e;
  --cp-border: #474747;
  --cp-border-strong: #5f5f5f;
  --cp-text: #dedede;
  --cp-text-muted: #919191;
  --cp-text-soft: #b0b0b0;
  --cp-accent: #fd8ea1;
  --cp-accent-hover: #fb7b91;
  --cp-accent-soft: rgba(253, 142, 161, 0.14);
  --cp-accent-fg: #1a1a1a;
  --cp-success: #4ade80;
  --cp-danger: #f87171;
  --cp-warning: #fbbf24;
  --cp-link: #4da6ff;
  --cp-shadow: 0 18px 48px rgba(0, 0, 0, 0.32);
  --cp-overlay: rgba(41, 41, 41, 0.88);
  --cp-panel: rgba(41, 41, 41, 0.72);
  --cp-panel-strong: rgba(41, 41, 41, 0.96);
  --cp-sheen: rgba(255, 255, 255, 0.04);
  --cp-highlight: rgba(253, 142, 161, 0.12);
}
```

時間顯示不可省略以下限制：

- 顯示 `Intl.DateTimeFormat().resolvedOptions().timeZone` 的 IANA 名稱；每個 UTC 瞬間分別以 `timeZoneName: 'longOffset'` 格式化。
- 24 小時期限是經過時間 `86,400,000 ms`，不等於 DST 跨日的當地鐘面小時數；畫面時區不得更改資料、狀態、期限或排序。
- 欄位有可見 label，狀態／錯誤有文字和 `role="status"`，鍵盤焦點可見；資料用安全 DOM API 插入，不使用 `innerHTML` 或 inline event handlers。
- 保留使用者輸入與可恢復錯誤；pending 狀態停用相應操作。無 IANA／Intl 能力時明示，不猜 UTC+8。
