# GH-300 版本範圍檢查器 DEMO

這個 DEMO 判定「某個版本是否落在某個版本範圍內」，用來示範 Copilot 的 Completion、Agent 修 BUG／refactor／測試、Context7 MCP、網頁與瀏覽器驗證，以及 Skill。**Inline Code Completion 仍需支援補全的編輯器；Agent、Skill 與已驗證的 Playwright MCP 流程可使用 GitHub Copilot CLI，不必把 VS Code 當成唯一 Agent Host。**

> **這不是升級安全檢查。** `satisfies: true` 只代表版本號落在範圍內，不代表 API 相容、行為不變或可以安全升級；本工具不讀取、不比對、也不升級任何真實專案的相依套件。

教材分工：

- [`PROMPTS.md`](PROMPTS.md)：可複製的完整 Prompt（JavaScript 主線 P00–P11、語言中立 L00–L10）。
- [`RUNBOOK.md`](RUNBOOK.md)：講師逐段腳本（低等待快照路徑、學員從零路徑、備案、停止條件與恢復點）。
- 本檔：專案規則、環境、命令、參考來源、備案與已知限制。

## 目錄

| 路徑 | 內容 |
|---|---|
| `src\core.js` | 唯一的判定核心，匯出 `checkCompatibility(version, range)` 與 `CompatibilityInputError`（code：`INVALID_VERSION`／`INVALID_RANGE`） |
| `src\cli.js` | Console 入口，只處理參數、繁體中文輸出與 exit code |
| `src\server.js`、`web\` | 本機 HTTP API 與原生網頁；API 直接呼叫同一個 `core.js` |
| `tests\` | `node:test`（core、semver 輸入政策、CLI、server）與 Playwright 瀏覽器測試 `browser.spec.js` |
| `fixtures\cases.json` | 人工固定的預期案例，不在執行期計算 |
| `references\semver-evidence.md` | semver 查詢證據與來源（官方文件備案，**不是** MCP 查詢結果） |
| `stages\00-starter` … `stages\05-web` | 講師課前快照，每個都是獨立專案；見 RUNBOOK |
| `..\..\.github\skills\version-compatibility-check\SKILL.md` | 本 DEMO 的 Skill（儲存庫根目錄） |
| `..\..\.vscode\mcp.json` | 非機密的 Context7 設定；Playwright MCP 使用 Copilot CLI 單次設定，不寫入 workspace MCP 設定 |

## 版本規則

最終專案（`src\core.js`，以 semver 7.8.5 為後端，但先套用本專案的輸入白名單）：

- 命令：`node src\cli.js <version> <range>`，剛好兩個引數；其他數量印出用法並 exit 1。
- version：完整 SemVer（`x.y.z`，可含 pre-release 與 build metadata）。外圍空白會 trim。
- range：**單一**條件 `=`、`>`、`>=`、`<`、`<=`、`^`、`~` 加完整版本；無符號視為 `=`；運算子與版本之間不可有空白（`>= 1.2.3` 是輸入錯誤）。
- 拒絕：前導零、負數、超過 `9007199254740991` 的數字片段、縮寫（`1.2`）、`v` 前綴、`AND`、`OR`、`||`、萬用字元（`1.x`、`*`）、hyphen range。即使 semver 套件本身接受這些語法，本專案也先擋下（`tests\semver-allowlist.test.js` 驗證）。不使用 loose、`includePrerelease`、`coerce`。
- 結果語意：有效但不符合 → stdout `版本 … 不符合範圍 …`、exit 0；輸入錯誤 → stderr `輸入錯誤 [CODE]：…`、exit 1，**不是** false。
- pre-release 採 npm 範圍語意：`1.2.4-beta.1 ^1.2.3` 為 false；`1.2.3-alpha` 也不滿足 `<1.2.3`，與 semver.org 純 precedence 的結果不同。build metadata 不參與比較（`1.2.3+build.1 =1.2.3` 為 true）。

教學快照 `stages\00-starter`–`04-tested` 保留教學版政策：只接受完整穩定 `x.y.z` 與 `=`、`>`、`>=`、`<`、`<=`，不支援 `^`、`~`、pre-release、metadata。`01-buggy` 刻意含有字串字典序比較的 BUG，只存在於該快照。

## 環境與來源

- Node.js 24（`.nvmrc` 為 `24`；已用 v24.14.0 驗證）。pnpm 10.33.2（`packageManager`）；專案使用 `pnpm-lock.yaml`，不使用 `npm install`、`npm run` 或 `npx`。
- 地端（工作站、本機容器、WSL）的 npm 查詢與安裝明示 `--registry=https://packagefeedproxy.microsoft.io/npm/`，不改全域設定；託管雲端執行機器改用官方來源。
- 依賴（精確版）：`semver 7.8.5`；開發依賴 `@playwright/test 1.63.0`、`@playwright/mcp 0.0.83`。
- Playwright 的 Chromium 是官方發行資源，不來自 npm registry，需課前以 `pnpm exec playwright install chromium` 準備。
- 注意：`pnpm-lock.yaml` 的套件 tarball 指向內部 feed（`pkgs.visualstudio.com`）。外部或雲端機器執行 `pnpm install --frozen-lockfile` 可能解析不到，此時需改用學員從零路徑重新 `pnpm add`（會產生自己的 lockfile），或由維護者重新產生 lockfile。

## 啟動與測試

在 `DEMO\VersionCompatibility` 執行：

```powershell
pnpm install --frozen-lockfile --registry=https://packagefeedproxy.microsoft.io/npm/   # 只在需要安裝時
pnpm exec playwright install chromium                                                  # 只在要跑瀏覽器測試時，課前執行
pnpm test                                    # node:test，213 項
pnpm run test:browser                        # Playwright／Chromium，11 項；會自己啟動並關閉專用 port 的 server
node src\cli.js 1.10.0 ">=1.9.0"             # 版本 1.10.0 符合範圍 >=1.9.0（exit 0）
pnpm start                                   # http://127.0.0.1:3000/
```

- `pnpm start` 只監聽 `127.0.0.1`，預設 3000，可用 `$env:PORT = '3100'` 覆寫；連接埠被占用時會明確提示並 exit 1，不會停止其他程序。
- API：`GET /api/health` → `{"status":"ok"}`；`GET /api/check?version=…&range=…` → `{ version, range, satisfies }`（false 也是 200）；缺少或重複參數、非法輸入 → 400 `{ error: { code, message } }`；未知路徑 404；已知路徑非 GET 405。
- 網頁可用 `?scoutTheme=light` 或 `?scoutTheme=dark` 切換主題。
- `pnpm test` 不掃描 `stages\`；`pnpm run test:browser` 只執行 `tests\browser.spec.js`。兩者是不同的驗證，不可互相代替。

## 固定驗收案例

| version | range | 預期 |
|---|---|---|
| `1.10.0` | `>=1.9.0` | 符合（true） |
| `1.9.0` | `>=1.10.0` | 不符合（false） |
| `1.3.0` | `^1.2.3` | 符合 |
| `2.0.0` | `^1.2.3` | 不符合 |
| `1.2.9` | `~1.2.3` | 符合 |
| `1.3.0` | `~1.2.3` | 不符合 |
| `1.02.3` | `>=1.0.0` | 輸入錯誤 `INVALID_VERSION`，exit 1 |
| `1.2.3` | `1.x` | 輸入錯誤 `INVALID_RANGE`，exit 1 |

預期值來自 `fixtures\cases.json` 與 https://semver.org/ ，不由外站決定。

## Skill

- 位置：儲存庫根目錄的 `.github\skills\version-compatibility-check\SKILL.md`（不是 `DEMO\VersionCompatibility` 內）。frontmatter 的 `name` 必須等於資料夾名稱 `version-compatibility-check`。
- 用途：被要求檢查版本是否符合限制、或重跑本 DEMO 回歸時，在 `DEMO\VersionCompatibility` 只執行 `node src\cli.js <version> <range>` 與 `pnpm test`，回報 version／range／satisfies（或輸入錯誤）、命令證據與「非升級安全保證」的限制。它不會安裝或升級套件，也不讀取其他專案的相依清單。
- 使用：在儲存庫根目錄執行 `copilot skill list`，確認列出 `version-compatibility-check`；再以 `copilot -C . --name "GH300 Version Compatibility" -i "<貼上 PROMPTS.md P10 的新 CLI session 觸發 Prompt>"` 開啟新的 Copilot CLI session。若在獨立 `stages\*` 目錄啟動，該目錄沒有此 Skill。
- 狀態：`copilot skill list` 已列出此 Skill；新的命名 Copilot CLI session 已實際載入它並執行指定 CLI 與 `pnpm test`（213／213）。VS Code chat 未驗證，也不再是此 DEMO Skill 的必要驗證路徑。文件存在或清單列出不單獨等於執行成功；仍以新的 CLI session 的實際命令輸出為準。

## 驗證狀態與已知限制

| 項目 | 狀態 |
|---|---|
| 核心、CLI、server 的 `node:test` | 已驗證：`pnpm test` 213／213 |
| 本機網頁真實瀏覽器 | 已驗證：`@playwright/test` 在 Chromium 11／11；**不是** Playwright MCP |
| Inline Code Completion | 仍需編輯器；本次未能取得即時補全文字證據，不宣稱已驗證 |
| Context7 MCP | **未驗證**：未在 VS Code／CLI 載入、未登入、未實際呼叫；`references\semver-evidence.md` 是直接讀官方文件的備案 |
| Playwright MCP | CLI 單次 MCP 設定已啟動，成功導覽 `about:blank`；也對本機頁面呼叫導覽、填表與提交，但回傳快照沒有文字，故無法驗證畫面結果。VS Code MCP 不採用 |
| VS Code Playwright MCP | 不採用；未驗證 VS Code 對此 Server 的工具限制。Playwright 僅走 Copilot CLI 單次設定，逐項核准安全工具並拒絕 `browser_run_code_unsafe` |
| `.vscode\mcp.json` 是否被 VS Code 讀取 | 未驗證；此設定只保留 Context7，Playwright 不寫入 workspace MCP 設定 |
| `@playwright/mcp` 與 `@playwright/test` | 版本並存（MCP 依賴 Playwright 1.64 alpha，測試為 1.63.0），MCP 需要的 browser revision 可能不同，須課前實測 |
| semver.npmjs.com 交叉比對 | 已用 Playwright library 讀過其 UI（欄位 `#package-name`、`#range`，按鈕 `List Versions`，是「套件名 + range → 列出已發布版本」，不是單一版本判定）；結果只證明與 node-semver 生態一致，不是獨立真值 |
| Skill 載入與執行 | 已驗證：`copilot skill list` 發現 Skill；新 Copilot CLI session 載入並執行固定案例與 `pnpm test`（213／213） |
| Copilot CLI 的 MCP | 已以 `--additional-mcp-config` 在單次 session 載入 Playwright，並成功導覽 `about:blank`。P09 命令只自動核准列出的導覽／快照／填表／點擊工具，拒絕 `browser_run_code_unsafe`、shell 與 write；CLI `--allow-url` 不限制 MCP 瀏覽器，因此不宣稱 URL 僅限本機。預設 `copilot mcp list --json` 僅列出內建伺服器；未建立持久 CLI 設定，也未載入 Context7。CLI workspace MCP 設定來源為 `.mcp.json` 或 `.github\mcp.json`，不會沿用 `.vscode\mcp.json` |
| 非 JavaScript 語言路徑（L00–L10） | 已在隔離 Python 3.11.9／uv scratch 走完 CLI、core、測試、套件替換、HTTP 與網站功能流程（55 tests）；新 CLI session 載入 Python Skill 並重跑 55 tests。Inline Completion 是 Agent 模擬；Context7 用官方文件備案；瀏覽器用既有 Chrome CDP 備案，非 Playwright MCP；未操作外站 |

## 備案（外網、MCP 不可用時）

- Context7 不可用：讀 https://github.com/npm/node-semver 官方 README，並明說這是「官方文件備案」，不能說成 MCP 查詢結果。講師可展示已存檔的 `references\semver-evidence.md`，同樣需說明其性質。
- Playwright MCP 無法讀取畫面結果：改跑 `pnpm run test:browser`，並說明這是 Playwright 測試 runner，不是 MCP 操作；展示畫面不能當成現場 MCP 操作成功。CLI 展示可用 `--additional-mcp-config` 提供單次 stdio server 設定，不必建立全域或 workspace 持久設定。
- semver.npmjs.com 不可用：用本機 CLI 與 `fixtures\cases.json` 的結果代替，明說未操作外站。
- npm registry 不可達：只使用課前已在獨立目錄安裝好的快照；不要現場改全域 registry 或靜默改用官方來源。

## 參考來源

- SemVer 2.0.0：https://semver.org/
- node-semver：https://github.com/npm/node-semver
- npm 官方 semver 計算機：https://semver.npmjs.com/
- VS Code MCP servers：https://code.visualstudio.com/docs/agent-customization/mcp-servers
- VS Code Agent Skills：https://code.visualstudio.com/docs/agent-customization/agent-skills
- Context7 各用戶端設定：https://context7.com/docs/resources/all-clients
- Playwright MCP：https://github.com/microsoft/playwright-mcp
