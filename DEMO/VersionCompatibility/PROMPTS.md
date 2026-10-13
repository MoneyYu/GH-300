# GH-300 版本範圍檢查器 DEMO：可複製 Prompt

這份教材收錄「版本範圍檢查器」從零開始的完整 Prompt：Completion、Agent 修 BUG、refactor、單元測試、Context7 MCP、網頁、瀏覽器操作與 Skill。每個階段都有可直接複製貼上的 Prompt，不需要講師私有的預製檔案、快照或網站。

> 此檔只發布教材。Prompt 本身不代表已執行；請依實際輸出判斷每一步是否完成，不要把「Agent 說完成」當成驗證結果。

## 使用方式

- 使用對象：JavaScript／Node.js 學員用 **P00–P11**；選用其他語言的學員用 **L00–L10**，兩條路徑都從空白練習儲存庫開始。
- 執行目錄：除另有說明，所有命令都在練習儲存庫的 `DEMO\VersionCompatibility` 執行；每次開新 Agent chat，都要先定位此目錄。Agent 可使用 VS Code 或 `copilot -C <workspace>` 開啟新的 Copilot CLI session。Context7 設定（`.vscode\mcp.json`）與 Skill（`.github\skills`）放在練習儲存庫根目錄；Playwright MCP 僅用 Copilot CLI 單次 session 設定。
- 編輯器：Completion 階段（P01／L01）需要支援 inline suggestion 的編輯器，只貼程式碼註解、不改成請 Agent 代寫；其他 Agent、Skill 與已驗證的 Playwright MCP 示範可使用 Copilot CLI。
- 帳號登入、API Key 與 MCP 信任核准一律由學員課前手動完成，不交給 Agent，也不寫入教材或專案檔。
- 範圍：只判定版本範圍是否符合，**不等於實際 API 相容或升級安全**。不使用 React、Express、Vite、資料庫、登入、Docker、部署或實際套件升級。
- JavaScript 專案使用 pnpm（10.33.2）與 `pnpm-lock.yaml`，不使用 `npm install`、`npm run` 或 `npx`。地端套件查詢與安裝一律明示 `--registry=https://packagefeedproxy.microsoft.io/npm/`，不改全域設定。
- 每段 Prompt 都有明確驗收與停止條件；完成即停，不附帶美化、架構重寫或新功能。
- 相關文件：專案規則、環境與命令見同目錄 `README.md`；講師逐段腳本、快照恢復點與備案見 `RUNBOOK.md`。

## 目錄

| 階段 | JavaScript 主線 | 語言中立 |
|---|---|---|
| 環境檢查與起始專案 | P00-Preflight、P00 | L00 |
| Code Completion | P01 | L01 |
| 教學 BUG 故障注入（可選） | P01B | L01B |
| Agent 重現、回歸測試與修 BUG | P02 | L02 |
| refactor | P03 | L03 |
| 單元測試 | P04 | L04 |
| Context7 查詢 | P05-Setup、P05 | L05 |
| 成熟 SemVer 套件接替 | P06 | L06 |
| HTTP API 與網站骨架 | P07 | L07 |
| 完整薄型網站 | P08 | L08 |
| 瀏覽器操作與交叉比對 | P09-Setup、P09 | L09-Setup、L09 |
| Skill | P10 | L10 |
| 講師課前快照與腳本 | P11 | — |

---

# 一、JavaScript／Node.js 主線（P00–P11）

## P00：使用 Agent 生成起始專案

前置：Copilot Agent 已指向自己的練習儲存庫或 GH-300 根目錄，Node.js 24 已可執行；不得在其他學員共享目錄操作。可使用 VS Code 或新的 Copilot CLI session。

先執行 P00-Preflight；只檢查，不偷偷安裝環境：

```text
這一步只做 GH-300 DEMO 的環境檢查，不建立或修改專案。
確認目前開啟的是我的練習儲存庫根目錄，執行 node --version 與 pnpm --version；本教材使用 Node.js 24、pnpm 10.33.2。
列出目前 Copilot Agent、inline Code Completion、可用 MCP／瀏覽器工具的實際狀態。inline Code Completion 需由我在編輯器確認；無法從工具查到的狀態列為「需人工確認」，不得猜測。
後續地端 pnpm 套件存取一律明示 --registry=https://packagefeedproxy.microsoft.io/npm/；不改全域 registry、不切換全域 Node、不安裝擴充功能。
若缺 Node 24、Copilot 登入或工具核准，列出阻擋項目與公開官方文件，交由我課前手動準備；不要代登入、處理 API Key 或接受 MCP 信任。
回報實際指令輸出、可進行及待準備項目後停止，不把「未檢查」寫成通過。
```

```text
請在 DEMO\VersionCompatibility 建立 GH-300 的 JavaScript／Node.js 24 Console 教學起始專案，使用 ES modules。若目錄已有內容，先列出衝突並停止，不覆寫。
只建立 package.json、.gitignore、src\cli.js 與 README.md；src\cli.js 先只放稍後撰寫程式的說明註解，不實作版本判定，不建立網頁或測試，不安裝任何套件。
package.json 使用 type=module、packageManager=pnpm@10.33.2；此階段只設定 scripts.demo 為 node src\cli.js。後續使用 pnpm、pnpm-lock.yaml，不產生 package-lock.json，不使用 npm 或 npx。保留後續使用 node:test、node:http 的可能，但不要提前產生未實作的指令。
README 使用繁體中文，說明這是版本範圍判定，不保證真實套件升級安全；記錄 Node 24、下一步使用 Code Completion。
不可修改其他 DEMO、BMI、全域設定，不 commit／push，不新增功能。
執行 node --version 與 node --check src\cli.js，列出實際輸出與建立檔案後停止。
```

## P01：使用 Code Completion 建立單一 function

前置：P00 已完成。貼到 `src\cli.js` 的是以下註解；講師從這裡逐段打字與接受 inline suggestion，不將全文交給 Agent。

```javascript
// Create a Node.js console version-range checker in a single function.
// Read version and range from process.argv, for example:
// node src\cli.js 1.10.0 ">=1.9.0"
// Accept only complete stable x.y.z versions and one comparator:
// =, >, >=, <, <=. No operator means equality.
// Reject leading zeros, unsafe integers and unsupported syntax.
// Keep parsing, comparison, validation and output inside one function.
// Print the result in Traditional Chinese.
// A valid false result exits 0; invalid input prints an error and exits 1.
// This checks range membership, not real API compatibility or upgrade safety.
```

另外執行兩條指令：`node src\cli.js 1.10.0 ">=1.9.0"` 與 `node src\cli.js 1.9.0 ">=1.10.0"`。先觀察生成程式，不保證 Completion 自然產生錯誤；如已正確，明示以 P01B 建立教學錯誤版本。

## P01B：可選，Agent 生成明示的教學 BUG

```text
這是明示的故障注入教材，不是正式產品修正。只修改 DEMO\VersionCompatibility\src\cli.js，保留所有流程在一個 function 與既有輸入政策。
刻意讓版本順序使用原始 x.y.z 字串的字典序比較，造成 1.10.0 >=1.9.0 判定為 false。不要加入其他 BUG，不放寬驗證，不新增套件或功能。
註明這個檔案是教學錯誤版本。執行 node src\cli.js 1.10.0 ">=1.9.0"，展示實際錯誤結果，明確說它不符合 SemVer 數值比較規則；完成後停止。
不可讓這個故障注入進入最終 core、API 或網站。
```

## P02：Agent 重現、回歸測試與修 BUG

```text
只處理 DEMO\VersionCompatibility 的版本字串排序 BUG，不重構或擴充規則。
先執行 node src\cli.js 1.10.0 ">=1.9.0" 及反向案例，說明為何 major／minor／patch 必須逐段做數值比較，參考 https://semver.org/。
先用 node:test 與 node:assert 在 tests\cli.test.js 補一個透過 child_process 執行 CLI 的回歸測試：1.10.0 >=1.9.0 應為符合且 exit 0。在 package.json 設定 scripts.test 指令為 node --test tests\cli.test.js，以 pnpm test 執行。確認測試因結果錯誤失敗，再做最小修正。
目前只接受完整穩定 x.y.z 與 =、>、>=、<、<= 單一條件；無符號視為 =；拒絕前導零、非安全整數及其他語法。所有邏輯仍保留在原單一 function。
有效但不符合仍 exit 0；非法輸入 stderr 且 exit 1。
重跑 pnpm test 與兩個 CLI 案例，列出修改檔案、失敗與成功證據後停止；不可順便建網站、裝套件或 commit／push。
```

## P03：Agent refactor，不改變行為

```text
將 DEMO\VersionCompatibility 的單一 function 重構，先讀程式與既有測試，不擴充語法。
新增 src\core.js，對外只輸出 checkCompatibility(version, range)，回傳 { version, range, satisfies }，以及 CompatibilityInputError；其 code 只使用 INVALID_VERSION 或 INVALID_RANGE。
在 core 內分離穩定版本解析、單條件解析、數值片段比較與條件求值；維持純函式，沒有 process、console 或檔案副作用。core 只接受完整穩定 x.y.z、單條件 =、>、>=、<、<=，外圍空白可 trim；拒絕前導零與不安全整數。
src\cli.js 只負責取得參數、呼叫核心、繁體中文輸出與 exit code；結果 false 是有效計算，exit 0。只將已知輸入錯誤轉為 stderr／exit 1，不用 broad catch 吞掉程式錯誤。
保留原 CLI 命令與使用者可見的結果語意。pnpm test 必須仍通過；執行兩個 1.10.0／1.9.0 回歸案例。
只修改必要程式與對應文件，不建立網站、不加 semver、不新增功能。提供 diff 重點與實際驗證後停止。
```

## P04：Agent 產生單元測試

```text
為 DEMO\VersionCompatibility 的公開核心 checkCompatibility 與 CLI 補測試，使用 node:test 與 node:assert，不安裝 Jest。
在 tests\core.test.js 每個案例用獨立 test，清楚呈現 Arrange、Act、Assert；保留 tests\cli.test.js 的回歸。
核心必測：1.10.0 >=1.9.0 true、反向 false、2.0.0 <10.0.0 true、1.2.3 >=1.2.3 true、1.2.3 >1.2.3 false、無運算子視為相等；trim 外圍空白。
非法版本：空白、1.2、v1.2.3、1.02.3、負數、超過安全整數、pre-release／metadata；非法 range：^、~、AND、OR、萬用字元與錯誤運算子。驗證 CompatibilityInputError 的 code，不把非法輸入當 false。
CLI 必測 stdout 與 exit 0，另測非法輸入 stderr／exit 1。測試公開行為，不鎖定 core 內部解析函式，以便下一段換套件。
package.json 的 scripts.test 明確列出 core.test.js 與 cli.test.js；pnpm test 不掃描 stages。執行並修正這次新增測試發現且直接相關的 BUG；不得放寬需求讓測試通過。
列出實際指令與結果後停止，不建立網站、不擴充 ^／~。
```

## P05：Context7 查詢，先看文件而非直接寫程式

P05-Setup：在課前產生設定；設定產生與真正連線是兩件事。

```text
只在目前練習儲存庫根目錄準備 VS Code extension-host 的 Context7 MCP 設定，不改應用程式。
先讀 https://context7.com/docs/resources/all-clients 與 https://code.visualstudio.com/docs/agent-customization/mcp-servers。
讀取既有 .vscode\mcp.json；不存在才建立。保留其他 Server；context7 同名但不同設定時列出衝突並停止，不覆寫。
使用 VS Code 格式的 servers 物件，新增 context7：type 為 http、url 為 https://mcp.context7.com/mcp/oauth。不要安裝本地 Context7 套件，不同時建立另一份 .mcp.json。
不加入 API Key、token 或帳號資訊，不改全域設定；登入、權限及信任核准全部交由我手動完成。組織若不允許 OAuth，明確停止，依官方文件提出 API Key 方案但不得自行改用或要求我把 Key 貼到 Chat。
列出實際設定、VS Code 啟動與核准步驟；若是 Agent Host 而非 extension-host，先說明 scope 限制並停止，不聲稱目前配置可用。
手動準備完成後，再檢查實際可用工具；只有成功連線與取得工具才算準備完成。不得捏造 MCP 呼叫或文件結果。
```

```text
此步只查文件，不修改程式或安裝套件。使用目前已設定的 Context7 MCP，查詢 npm semver 套件的 valid、validRange、satisfies，特別是 ^、~、0.x、pre-release 預設排除與 build metadata 的比較規則。
先辨識實際可用工具與對應 library，不捏造工具名稱、library ID 或版本；回報實際 MCP 呼叫、來源 URL、適用版本與必要摘錄。
解釋為何單靠 validRange 會接受超出我們單一條件範圍的語法。提出沿用嚴格輸入政策、僅增加 ^／~ 與完整 SemVer suffix 的最小接替方式。
若 MCP 不可用或找不到 semver，明確停止成功聲稱；可讀 https://github.com/npm/node-semver 作為「官方文件備案」，但不可說備案是 MCP 查詢結果。
不得傳送專案程式碼、憑證或真實套件清單；只用合成的版本例子。
```

## P06：依文件用 semver 接替教學核心

```text
在 DEMO\VersionCompatibility 以 semver 7.8.5 取代手刻核心判定；先讀上一段查詢證據與 https://github.com/npm/node-semver。
先補新增行為測試並確認原版不支援的失敗。從零路徑再執行 pnpm add --save-exact semver@7.8.5 --registry=https://packagefeedproxy.microsoft.io/npm/；講師若已課前安裝精確版且 manifest／lockfile 一致，就驗證版本而不重裝。不要改全域 registry。
保留 checkCompatibility、CompatibilityInputError、回傳形狀與 CLI exit code。只擴充單一 ^／~ 條件，以及完整 SemVer 的 pre-release／metadata。
只接受完整版本；仍拒絕 v 前綴、縮寫、AND、OR、萬用字元；先驗證我們的語法政策，再用 valid、validRange、satisfies。不要開 loose／includePrerelease，不用 coerce。
必測：1.3.0 ^1.2.3 true、2.0.0 ^1.2.3 false、1.2.9 ~1.2.3 true、1.3.0 ~1.2.3 false、0.2.9 ^0.2.3 true、0.3.0 ^0.2.3 false、1.2.4-beta.1 ^1.2.3 false、1.2.3+build.1 =1.2.3 true。
原穩定版本結果保持一致；原本拒絕 suffix 的測試改為套件版接受／判定案例，教學版快照仍保留舊政策。不要只刪掉失敗測試。
保存 pnpm-lock.yaml，記錄新增語法與文件來源。執行 pnpm test 及固定案例，提供實際輸出後停止；不建網站，不宣稱可以安全升級。
```

## P07：Agent 從零產生共用核心的 server 與網站骨架

```text
在 DEMO\VersionCompatibility 新增 src\server.js、web\index.html、web\app.js、web\styles.css、tests\server.test.js，使用 Node 24 node:http 與原生網頁，不使用 Express、React、Vite、資料庫或 CDN。
src\server.js 只監聽 127.0.0.1，預設 port 3000，可用 PORT 覆寫；提供可測試啟停的 server 工廠，直接執行才 listen，import 時不啟動。
GET /api/health 回傳 { status: "ok" }。
GET /api/check?version=...&range=... 必須呼叫同一個 src\core.js 的 checkCompatibility，不重寫版本邏輯。成功含 false 回傳 200；缺少、重複、非法參數 400 { error: { code, message } }；未知路徑 404；已知路徑不支援 method 為 405。
靜態路由只允許 /、/index.html、/app.js、/styles.css 與正確 content type，不讀取任意路徑。已知輸入錯誤轉 400，未預期錯誤 stderr 記錄、HTTP 500 不洩漏堆疊。
此階段頁面只要完整且可顯示的基本骨架與標題；正式表單下一步再產生，不能依賴任何預製附件。
先寫 HTTP 契約測試，再實作；測試使用自動 port 並關閉自己的 server。package.json 的 scripts.test 明確列出 core、cli、server 測試檔，並包含 P06 已新增的其他 node:test 檔（例如 tests\semver-allowlist.test.js）；scripts.start 指令為 node src\server.js。執行命令使用 pnpm test 與 pnpm start。
執行 pnpm test，啟動 server 並呼叫 health，列實際結果；port 被佔用時回報或使用另一 port，不停止其他人的程序。停止自己測試用的 server 後結束。
```

## P08：Agent 生成完整薄型網頁

```text
只完成 DEMO\VersionCompatibility\web 的版本範圍檢查介面，不改 core 規則或 API 契約。
使用原生 HTML/CSS/JavaScript；生成可讀的繁體中文單頁，包含 version、range 兩個具 label 的輸入、檢查按鈕、結果、錯誤區及 1.10.0／caret／tilde 範例按鈕。
只呼叫本機 GET /api/check，參數正確 URL encode；不要在瀏覽器另寫 SemVer 判定。畫面分別呈現「符合」「不符合」「輸入錯誤」「網路錯誤」，不要將錯誤當成不符合。
修改輸入時清除舊結果；請求進行中禁用重複提交，失敗時能恢復操作，不讓上一個請求覆蓋新輸入的結果。
明示「只判定版本範圍，不保證實際 API 相容或升級安全」。結果提供 aria-live；保留鍵盤操作與基本窄螢幕可讀性。
CSS 全部在本地，不新增框架、CDN、粒子動畫、登入或儲存功能。不需要講師私人 Skill；直接使用下面公開的主題規範。
index.html 在 app.js 之前放入以下第一個 script：
<script>
  (() => {
    const param = new URLSearchParams(window.location.search).get("scoutTheme");
    const theme =
      param || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  })();
</script>
web\styles.css 包含以下完整 theme tokens，元件顏色只能使用 var(--cp-*)，不得另硬編碼色彩：
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
主要字型："Segoe UI", Aptos, Calibri, -apple-system, BlinkMacSystemFont, sans-serif；版本與 range 使用 Consolas, "Courier New", Courier, monospace。
一般控制項圓角 0.625rem、卡片 16px，間距以 4px 為單位，不使用厚重陰影或玻璃效果。
執行 pnpm test，啟動頁面並確認 API health。只把已實際執行的驗證稱為通過；瀏覽器完整測試在下一段。列出生成檔案後停止。
```

## P09：Copilot 操作瀏覽器與交叉比對

P09-Setup：課前準備，不把工具下載放進 LIVE DEMO。

```text
只準備 Copilot CLI 單次 session 使用的 Playwright MCP，先讀 https://github.com/microsoft/playwright-mcp。
若已有可用的 Playwright MCP，先列出實際版本與工具，不建立同用途的第二個 Server。若設定衝突，停止而非覆寫。
沒有設定時，先在 DEMO\VersionCompatibility 明確加入 devDependency，使用 pnpm add --save-dev --save-exact @playwright/mcp@0.0.83 --registry=https://packagefeedproxy.microsoft.io/npm/，保存 pnpm-lock.yaml。
不得修改 .vscode\mcp.json、全域 pnpm／Copilot CLI 設定，不自行核准信任。依下方指令以 --additional-mcp-config 將 Server 僅加入單次 Copilot CLI session；只個別核准 browser_navigate、browser_snapshot、browser_fill_form、browser_click，明確拒絕 browser_run_code_unsafe、shell、write。若該 CLI 版本不支援這些逐工具選項，停止，不要改用未限制的 VS Code MCP，改採明示的本機 Playwright runner 備案。
工具下載、browser binaries 準備與首次啟動都在課前完成；下載失敗要回報實際原因，不靜默切換 npm registry。Browser binaries 是 Playwright 官方發行資源，不是另一個 npm registry。
使用下方指令時確認 MCP 只在該 session 載入，操作 about:blank 作為不含資料的冒煙檢查，再關閉自己的瀏覽器；沒有工具或無法確認限制時報未完成，不改用 screenshot 假裝成功。
此步不測應用程式、不建立功能，也不把 MCP 準備完成當成 pnpm run test:browser 已通過。
```

Copilot CLI 路徑（已實際驗證單次設定與 `about:blank`；不需建立 `.vscode\mcp.json` 或全域設定）。在 `DEMO\VersionCompatibility` 專案目錄（或獨立 `05-web` 快照目錄）用 PowerShell 準備單次設定並啟動新 Copilot CLI session。此指令不使用 `.vscode\mcp.json`：

```powershell
$project = (Get-Location).Path
if (-not (Test-Path (Join-Path $project "package.json"))) { throw "請先切換到 DEMO\VersionCompatibility 專案目錄。" }
$mcpConfig = @{
  mcpServers = @{
    playwright = @{
      type = "stdio"
      command = "pnpm"
      args = @("--dir", $project, "exec", "playwright-mcp")
    }
  }
} | ConvertTo-Json -Depth 5 -Compress
$prompt = "只使用 Playwright MCP 導覽 about:blank，讀取實際頁面快照後回報工具操作與觀察；不要執行 shell、不要造訪其他 URL、不要修改檔案。"
copilot -C $project --name "GH300 Playwright MCP" --mode autopilot --prompt $prompt --additional-mcp-config $mcpConfig --allow-tool="playwright(browser_navigate)" --allow-tool="playwright(browser_snapshot)" --allow-tool="playwright(browser_fill_form)" --allow-tool="playwright(browser_click)" --deny-tool="playwright(browser_run_code_unsafe)" --deny-tool=shell --deny-tool=write
```

單次 MCP 設定只對該 Copilot CLI session 生效；自動核准僅涵蓋明列的導覽、快照、填表與點擊工具，並明確拒絕 `browser_run_code_unsafe`、shell 與 write。`--allow-url` 只管 shell／web-fetch，不限制 MCP 瀏覽器；Playwright MCP 的 origin allowlist 也不是安全邊界，不能宣稱它限制為本機頁面。課堂只操作明示的本機 DEMO 與 semver.npmjs.com 合成案例；需更強網路隔離時，使用經核准的網路控制，不以 Prompt 代替。工具尚未安裝時先依上方課前步驟完成專案相依與 browser binaries；不要把 `about:blank` 冒煙檢查說成已操作 DEMO 頁面。

```text
驗證 DEMO\VersionCompatibility；若尚未有自己的本機 server，先啟動並確認 health，再使用已準備的 Playwright MCP 操作真實頁面，不只讀原始碼。不停止別人的 server。
建立 tests\browser.spec.js 與 playwright.config.js，指定 testDir="tests"、testMatch="browser.spec.js"；修改 package.json 加入 scripts 欄位 "test:browser": "playwright test"，讓 Playwright 不掃描 node:test 檔案或 stages。
將 @playwright/test@1.63.0 寫入精確 devDependency，再以 pnpm add --save-dev --save-exact @playwright/test@1.63.0 --registry=https://packagefeedproxy.microsoft.io/npm/ 安裝並保存 pnpm-lock.yaml；課前執行 pnpm exec playwright install chromium 準備官方 browser binaries，不變更全域設定、不使用 latest。
Playwright 測試的 server 要能使用專用 port 並在結束後關閉；不要依賴人工留下的 server，不終止其他程序。若測試 runner 與 MCP 不可用，分別回報，不混淆兩種驗證。
執行 pnpm test 與 pnpm run test:browser。親自填入與提交以下案例並讀畫面結果：1.10.0 >=1.9.0 true、2.0.0 ^1.2.3 false、1.3.0 ~1.2.3 false、1.02.3 顯示輸入錯誤；另阻斷 API 驗證網路錯誤及可恢復操作。
再開 https://semver.npmjs.com/，先觀察實際 UI 與支援輸入，再操作 ^1.2.3 與 ~1.2.3，比對邊界版本；不要捏造 selector、操作或結果。
外站與本機同 semver 生態只能交叉確認串接一致；獨立預期值依 https://semver.org/ 與固定人工審核案例，不將外站當獨立真值。
外站或瀏覽器工具不可用要列實際原因；可用本機 semver 命令結果作明示備案，但不可宣稱已操作外站。沒有完成本機真實瀏覽器驗證就報未完成。
只送合成版本，不外傳程式碼或憑證；停止自己啟動的測試服務。報告指令、觀察結果、成功項目與降級限制後停止。
```

## P10：Agent 生成 Skill，再示範載入

```text
為此課程建立 .github\skills\version-compatibility-check\SKILL.md，先核對 https://code.visualstudio.com/docs/agent-customization/agent-skills 的格式。
name 使用 version-compatibility-check，description 明確涵蓋「檢查版本是否符合限制並執行本 DEMO 回歸驗證」。Skill 本身用繁體中文、具可複用步驟。
先定位儲存庫內 DEMO\VersionCompatibility，再執行既有 CLI 與 pnpm test；輸出 version、range、satisfies 或輸入錯誤、實際測試證據，以及非升級安全保證的限制。
不得新增商業功能、安裝或升級其他專案套件、傳送真實相依清單、commit／push。
更新 DEMO\VersionCompatibility\README.md（不是儲存庫根目錄 README）的 Skill 位置與使用方式。不假裝產生文件就等於載入成功；告訴我下一步要開新的 GitHub Copilot CLI session 測試。
完成後停止。
```

新 chat 的實際觸發 Prompt：

```text
請使用 version-compatibility-check skill，檢查 1.10.0 是否符合 >=1.9.0，並執行本 DEMO 的回歸驗證。提供實際載入／工具執行證據及結果；若 Skill 沒有載入或測試不可執行，明確回報，不自行安裝套件或擴充功能。
```

## P11：講師課前以相同 Prompt 生成快照與腳本

```text
為 DEMO\VersionCompatibility 準備講師低等待路徑與學員從零路徑。前置輸入是已公開的 PROMPTS.md 完整 P00–P10（含前置準備與完整主題），以及目前程式。若教材尚未提供，列缺項並停止，不要求從不存在的文件生成該文件。
課前以相同 Prompt 在彼此獨立的練習目錄依序生成並驗證各階段，再保存到 stages\00-starter、01-buggy、02-fixed、03-refactored、04-tested、05-web。04-tested 是 semver 整合前；05-web 是套件整合與網頁完成後。
講師的 04-tested 可明示課前已安裝 semver 與工具依賴，但核心仍是教學手刻版；P06 現場只替換核心、不下載套件。課前依 P07 生成網站骨架，現場使用 P08 做薄 UI 的小增量；完整成果仍保留在 05-web 作恢復點。學員從零路徑不能跳過 P06 安裝與 P07 生成。
不要以最終程式機械刪檔冒充各階段生成成果；原始路徑沒有任一快照也必須能從 P00 跟做。預先準備每個需要的依賴，不共享可寫程式檔或切換全域 Node。
01-buggy 只能有已說明的字串比較錯誤，指定重現測試預期失敗；其他已完成階段按當時規格通過。正式 tests 不掃描 stages。
產生 RUNBOOK.md，逐段列出模式、可複製 Prompt 編號、前置檔案、動作、觀眾可見結果、驗收指令、停止條件與恢復點。切換使用獨立 VS Code folder，不覆寫／restore／reset／刪除目前修改。
核對已發布的 PROMPTS.md 仍包含所有完整 Prompt 文字，不只列編號、摘要或外部連結；保留 Completion 註解與 Agent 指令的差異，只修正排練證實的問題。
各恢復 workspace 必須有自己不含秘密的 MCP 設定且已課前啟動驗證；不要假設父目錄設定可發現。Skill 展示切回含 .github\skills 的練習儲存庫根目錄並開新 chat。
明示 Context7／外站備案與課前成果，不把備案或 screenshot 當即時操作成功。所有學生必要文件與樣式規則隨專案提供，不依賴講師私有 skill。
從不含快照與預製網站的資料夾排練學生路徑，記錄實際銜接與驗證；只修復已證實的教材問題。
更新 DEMO\PROMPT.md 與 DEMO\DEMO.md 的新主線入口，保留 BMI、其他範例與未追蹤檔案。不 commit／push；列出完成狀態、實際驗證與未解限制後停止。
```

---

# 二、語言中立 Prompt（L00–L10）

使用對象：不選 JavaScript 主線的學員。從自己的空白練習儲存庫開始，依 L00–L10 執行；不需要講師快照、BMI 或預製網站。這些是完整教材 Prompt，不是已驗證的多語言成果。

共同驗收：`1.10.0 >=1.9.0 → true`、反向 `false`、`2.0.0 <10.0.0 → true`、`1.2.3 >=1.2.3 → true`、`1.2.3 >1.2.3 → false`、`1.2.3 1.2.3 → true`；非法輸入不可冒充 false。三段整數不超過 `9007199254740991`，拒絕前導零、縮寫、v 前綴與 suffix。這是共通教學限制，不宣稱各生態的套件管理器本來就採相同政策。

## L00：確認語言與環境，再生成起始專案

```text
我要從零跟做 GH-300 的版本範圍檢查器，不能假設我使用 JavaScript。先讀目前儲存庫的公開設定、manifest／lockfile，詢問我這次要使用的程式語言、runtime 與既有工具鏈；不要只因已裝 Node 就選 JavaScript。
語言尚未確認時只詢問並停止。確認後檢查該 runtime、套件管理及測試工具的實際版本；缺少全域工具、帳號登入、MCP 信任或權限時列出課前手動準備項，不自行安裝或核准。
在 DEMO\VersionCompatibility 建立所選語言的最小起始專案：原生 manifest、README.md、DEMO-CONTRACT.md、只有教學註解的 Console 入口。既有同名內容先列衝突並停止，不覆寫。不要實作核心、建立測試或網站。
DEMO-CONTRACT.md 記錄已確認語言、版本、工作目錄、入口路徑、啟動／測試命令及共同規格：完整穩定 x.y.z、單一 =、>、>=、<、<=；無符號等於 =；trim 外圍空白；拒絕前導零、負數、超過 9007199254740991 的片段、縮寫、v 前綴、^、~、AND、OR、萬用字元、pre-release／metadata。
此工具只判定版本範圍，不保證 API 相容或升級安全；有效但不符合仍成功 exit 0，非法輸入 stderr／exit 1。
JavaScript 使用 pnpm 與 pnpm-lock.yaml；Python 使用 uv，若現有 lockfile 指定其他工具先問我；C#、Java 等沿用已確認的原生工具。地端套件查詢／安裝只用專案級或命令列來源：NPM https://packagefeedproxy.microsoft.io/npm/、Python https://packagefeedproxy.microsoft.io/pypi/simple/、NuGet https://packagefeedproxy.microsoft.io/nuget/v3/index.json。實際執行機器屬託管雲端時用官方來源；分類不明或工具無法指定來源先問，不改全域。
執行適用的入口語法檢查或最小 build，列出實際命令／輸出及下一步 Code Completion 的編輯檔案；不要提前寫功能、commit 或 push。
```

## L01：以 Completion 產生單一 function

前置：L00 完成。以下兩個註解區塊內容相同，依語言複製一個到 L00 指定的入口；用 inline suggestion 完成，不交給 Agent 一次生成。

`//` 註解語言：

```text
// Build a console version-range checker using this project's chosen language.
// Read version and range using the native CLI argument interface.
// Accept complete stable x.y.z and one comparator: =, >, >=, <, <=.
// No comparator means equality; trim outer whitespace.
// Reject leading zeros, negative or unsafe components above 9007199254740991.
// Reject shortened versions, v prefixes, suffixes, ^, ~, AND, OR and wildcards.
// Keep parsing, validation, comparison and output in a single function.
// Print Traditional Chinese output; valid false exits 0, invalid input exits 1.
// Check range membership only, not real API compatibility or upgrade safety.
```

`#` 註解語言：

```text
# Build a console version-range checker using this project's chosen language.
# Read version and range using the native CLI argument interface.
# Accept complete stable x.y.z and one comparator: =, >, >=, <, <=.
# No comparator means equality; trim outer whitespace.
# Reject leading zeros, negative or unsafe components above 9007199254740991.
# Reject shortened versions, v prefixes, suffixes, ^, ~, AND, OR and wildcards.
# Keep parsing, validation, comparison and output in a single function.
# Print Traditional Chinese output; valid false exits 0, invalid input exits 1.
# Check range membership only, not real API compatibility or upgrade safety.
```

其他註解形式由 Copilot 只轉換註解語法，不能藉此完成程式。先執行 `DEMO-CONTRACT.md` 記錄的 Console 命令，觀察 `1.10.0` 與 `>=1.9.0`；若補完正確，就明示進入可選故障注入。

## L01B：可選的教學故障注入

```text
先讀 DEMO\VersionCompatibility\DEMO-CONTRACT.md 與 Console 入口，使用已確認語言，不更換工具鏈。
這是明示的故障注入教材：只把版本順序改為原始 x.y.z 字串的字典序比較，讓 1.10.0 >=1.9.0 得到 false。保留單一 function、輸入驗證與其他規格，不注入其他錯誤。
標示是教學錯誤版本，使用該語言原生命令執行並呈現錯誤結果，說明其違反 https://semver.org/ 的數值 precedence。
不安裝套件、不建網站、不放寬輸入、不 commit／push；此錯誤不得留到最終核心或網站。完成後停止。
```

## L02：Agent 修 BUG

```text
只修 DEMO\VersionCompatibility 的字串版本比較 BUG。先讀 DEMO-CONTRACT.md、入口及既有測試，沿用已確認語言、runtime 與工具。
先用實際 Console 命令重現 1.10.0 >=1.9.0 的 false；若目前正確，回報無法重現並停止，不製造新的 BUG。
以所選語言的原生測試框架新增一個透過程序執行 CLI 的回歸案例：結果必須符合且 exit 0。先跑紅測試，確認失敗原因是字串排序而非環境或 build，再做最小修正。
修正為 major、minor、patch 逐片段數值比較；仍保留全部邏輯在一個 function，不重構、不加 ^／~ 或 suffix。
完整穩定 x.y.z 與單一 =、>、>=、<、<=；trim 外圍空白，無符號視為相等；前導零、縮寫、v 前綴、負數、片段超過 9007199254740991、其他語法仍為錯誤。有效 false exit 0，非法輸入 stderr／exit 1。
重跑回歸與反向案例，將實際測試命令補進 DEMO-CONTRACT.md，列出紅／綠證據後停止。不改其他範例，不順便建立網站或 commit／push。
```

## L03：Agent refactor

```text
讀 DEMO\VersionCompatibility\DEMO-CONTRACT.md、程式與既有測試，在同一語言內 refactor，不換成 JavaScript 或新增功能。
把穩定版本解析、單一比較條件解析、數值比較與求值抽成純核心；對外一個檢查入口接收 version、range，回傳含 version、range、satisfies 的原生結構。
採該語言的命名慣例，在 DEMO-CONTRACT.md 寫清楚實際模組／函式名稱與簽章；CLI 與後續 HTTP 都必須用同一入口。核心沒有 console、process、HTTP 或檔案副作用。
核心的已知輸入錯誤有 INVALID_VERSION／INVALID_RANGE code；CLI 只處理參數、輸出、這兩類錯誤與 exit code，不 broad catch 吞未預期錯誤。
保留完整穩定 x.y.z、單一 =、>、>=、<、<= 與原驗證政策，不支援 ^／~ 或 suffix。原測試與 1.10.0／1.9.0 兩個案例都必須通過。
提供實際 build／測試與 diff 重點後停止，不引入版本套件或 Web framework，不 commit／push。
```

## L04：Agent 產生原生單元測試

```text
為 DEMO\VersionCompatibility 的公開核心與 CLI 補測試，先讀 DEMO-CONTRACT.md 的已確認語言／簽章／命令，沿用原生框架；不要把 node:test、Jest、pnpm 指令帶入非 JavaScript 專案。
每案例獨立 test／method／function，清楚 Arrange、Act、Assert；只測公開行為，不鎖內部 helper。
必測：1.10.0 >=1.9.0 true、1.9.0 >=1.10.0 false、2.0.0 <10.0.0 true、1.2.3 >=1.2.3 true、1.2.3 >1.2.3 false、1.2.3 與無符號 1.2.3 true；trim 外圍空白。
非法版本：空白、1.2、v1.2.3、1.02.3、負數、片段 9007199254740992、pre-release／metadata。非法 range：空白、^、~、AND、OR、萬用字元、錯誤運算子與非完整版本。驗證錯誤 code，不能當 false。
CLI 測 stdout／exit 0 與非法輸入 stderr／exit 1。把固定輸入與人工預期值保存為 fixtures\cases.json，不由程式執行期自行產生真值。
測試 runner 不掃描故障快照或瀏覽器測試；依已確認工具鏈執行並記錄命令與輸出。只修此次測試證實的直接相關 BUG，不能放寬需求；完成後停止，不建網站。
```

## L05：Context7 查所選語言的版本套件

前置：由本人完成 Context7 啟動、登入與核准。可用 P05-Setup 的 HTTP／OAuth 設定，這與應用程式語言無關。

```text
只查文件，不修改或安裝應用程式。先讀 DEMO\VersionCompatibility\DEMO-CONTRACT.md 的已選語言與版本。
使用實際可用的 Context7 MCP，尋找適合該語言的成熟 SemVer 套件，查嚴格版本解析與 major／minor／patch 數值比較 API；不要套用 JavaScript semver 的函式名稱。
確認是 SemVer 2.0.0，不因叫 version 就採用 Python PEP 440、NuGet 或 Maven 比較規則。共同輸入仍為完整穩定 x.y.z 與單一比較條件，不需要 npm ^／~、suffix 或完整 range parser。
先辨識可用工具與 library ID，列真正呼叫、來源完整 URL、套件與 runtime 適用版本、API 及限制；不要捏造名稱或宣稱已執行程式。
若 library 只提供版本比較，可以保留既有小型條件求值；若收錄或工具不可用，明確標記 MCP 未成功，用已核實的官方文件作備案，不能把備案當 MCP 結果。
只傳合成版本與通用文件問題，不傳程式碼、API Key 或真實相依清單。記錄查詢證據後停止。
```

## L06：以該語言的成熟 SemVer 套件接替

```text
讀 DEMO\VersionCompatibility\DEMO-CONTRACT.md、L05 真正文件證據及現有測試，僅在文件已確認 API、版本與 runtime 相容後，使用所選語言的成熟 SemVer 套件取代核心手刻版本解析／比較。
先提出具來源的確切套件與精確版本，不憑名稱假定 npm 規則；查核完成才修改 manifest／lockfile 並用已確認原生工具與允許來源安裝。Python 用 uv；JavaScript 用 pnpm；現有不同 lockfile 工具鏈先問我。
保持核心入口簽章、回傳形狀、INVALID_VERSION／INVALID_RANGE、CLI 命令及 exit code。語法政策仍是完整穩定 x.y.z、單一 =、>、>=、<、<=，trim／安全整數／前導零規則不變。
不加入 ^／~、縮寫、v 前綴、AND、OR、萬用字元、pre-release／metadata；套件接受較寬輸入時先用我們的輸入政策阻擋，不 coerce 或寬鬆解析。
先以現有 fixtures 作接替回歸，再補套件特有的寬鬆輸入防護測試。執行全部原生測試與 CLI 固定案例，結果不得改變。
找不到符合基本 SemVer 契約的套件／文件就明確回報未完成，不用近似比較湊成功。記錄實際依賴與結果後停止，不建網站或聲稱升級安全。
```

## L07：同語言 HTTP API 與網站骨架

```text
讀 DEMO\VersionCompatibility\DEMO-CONTRACT.md，新增所選語言的最小 HTTP server 與原生 HTML/CSS/JavaScript 骨架。優先標準庫或環境已具備的最小框架；必要新依賴先查官方文件、精確版本及允許來源，不用大型 scaffold。
不要把 Python／C#／Java 的業務核心改寫成 JavaScript。GET /api/check?version=...&range=... 必須呼叫現有同語言核心；200 JSON 為 { version, range, satisfies }，false 仍 200。
缺少、重複、非法參數回 400 { error: { code, message } }，未知路徑 404、已知路徑錯誤 method 405。GET /api/health 回 200 { status: "ok" }。
只監聽 127.0.0.1，預設 port 3000，提供專案級 PORT 覆寫與測試啟停能力；port 佔用不終止他人程序。
靜態路由只允許 /、/index.html、/app.js、/styles.css，正確 content type，不能讀任意檔案。只將已知輸入錯誤映射成 400；未預期錯誤記錄 stderr、回 500，不洩漏堆疊。
先寫原生 HTTP 契約測試再實作，測試自動分配 port 並關閉自己的 server；網頁此時只需標題與完整骨架，沒有預製網站輸入。
執行 build、核心／CLI／HTTP 測試與 health，保存確切啟動、測試與停止命令至 DEMO-CONTRACT.md；不加資料庫、登入、部署、動畫或第二份判定核心。
```

## L08：產生完整薄型網站

```text
只完成 DEMO\VersionCompatibility\web 的原生單頁，先讀 DEMO-CONTRACT.md 及 L07 的實際 API，不更換後端語言、不改核心。
繁體中文 UI 包含 version、range 的 label／輸入、檢查按鈕、結果／錯誤與範例按鈕。共同案例是 1.10.0 >=1.9.0、1.9.0 >=1.10.0、2.0.0 <10.0.0；不要放 ^／~ 範例。
只對本機 GET /api/check 送 URL encoded 參數，不在瀏覽器另寫版本判定。區分符合、不符合、輸入錯誤、網路錯誤；修改輸入時清除舊結果，請求中禁重複提交，舊請求不能覆蓋新輸入。
保留鍵盤操作、label、結果 aria-live、窄螢幕可讀性；明示版本範圍不等於 API 相容或升級安全。無 CDN、框架、動畫、登入或儲存，全部資源本地。
不依賴私人 Skill，index.html 在 app.js 前以第一個 script 放入：
<script>
  (() => {
    const param = new URLSearchParams(window.location.search).get("scoutTheme");
    const theme =
      param || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  })();
</script>
web\styles.css 放入完整 tokens，元件色彩僅用 var(--cp-*)：
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
主要字型："Segoe UI", Aptos, Calibri, -apple-system, BlinkMacSystemFont, sans-serif；版本用 Consolas, "Courier New", Courier, monospace。一般圓角 0.625rem、卡片 16px、4px 間距單位，不用厚重陰影。
執行 DEMO-CONTRACT.md 的原生 build／測試、啟動與 health 命令，列實際輸出與新增檔案；沒有真實瀏覽器操作不得說 UI 已驗證，下一段再驗證。完成後停止。
```

## L09-Setup：非 JS 專案的共用瀏覽器工具準備

```text
先檢查目前 Copilot CLI session 是否已載入真正可用且符合逐工具 allow／deny 清單的 Playwright MCP；應用程式語言與瀏覽器工具的執行環境是兩回事，不把非 JavaScript 應用改成 JavaScript。不可使用未限制的 VS Code MCP。
已有符合此安全工具清單的 session 就列實際版本／工具與不含資料的 about:blank 檢查，不新增重複 Server。
沒有工具時先檢查 Node 與 pnpm。缺少就回報課前手動準備項與 https://github.com/microsoft/playwright-mcp，不自行全域安裝、改全域設定或接受信任。
工具環境就緒後，只在練習儲存庫 .demo-tools\browser 建立獨立的 Node.js 工具 manifest，packageManager=pnpm@10.33.2；同名內容衝突先停止。這不是所選語言的應用程式或業務核心。
在該目錄以 pnpm add --save-dev --save-exact @playwright/mcp@0.0.83 --registry=https://packagefeedproxy.microsoft.io/npm/ 安裝並保存 pnpm-lock.yaml。
不修改 .vscode\mcp.json 或全域設定。使用下方單次 Copilot CLI 指令載入工具；只 allow `browser_navigate`、`browser_snapshot`、`browser_fill_form`、`browser_click`，deny `browser_run_code_unsafe`、shell、write。CLI 不支援逐工具選項或工具清單不符時停止，不改用未限制的 VS Code MCP。
按實際 Server 指示準備 browser binaries，再確認工具能操作 about:blank，關閉自己的瀏覽器。不傳資料、不動應用 manifest，不把設定生成當成工具成功。
```

從練習儲存庫根目錄執行以下 PowerShell。此工具使用獨立 `.demo-tools\browser`，不更動所選語言的應用程式：

```powershell
$repo = (Get-Location).Path
$toolDir = (Resolve-Path .\.demo-tools\browser).Path
$mcpConfig = @{
  mcpServers = @{
    playwright = @{
      type = "stdio"
      command = "pnpm"
      args = @("--dir", $toolDir, "exec", "playwright-mcp")
    }
  }
} | ConvertTo-Json -Depth 5 -Compress
$prompt = "只使用 Playwright MCP 導覽 about:blank，讀取實際頁面快照後回報工具操作與觀察；不要執行 shell、不要造訪其他 URL、不要修改檔案。"
copilot -C $repo --name "GH300 Student Playwright MCP" --mode autopilot --prompt $prompt --additional-mcp-config $mcpConfig --allow-tool="playwright(browser_navigate)" --allow-tool="playwright(browser_snapshot)" --allow-tool="playwright(browser_fill_form)" --allow-tool="playwright(browser_click)" --deny-tool="playwright(browser_run_code_unsafe)" --deny-tool=shell --deny-tool=write
```

## L09：真實網站操作、跨介面與官方工具比對

```text
讀 DEMO\VersionCompatibility\DEMO-CONTRACT.md，使用所選語言的實際命令啟動自己的本機 server，確認 health；不要停止他人的 server。
使用已課前準備的 Playwright MCP 親自操作真實網頁，讀實際結果，不只看原始碼／測試報告。
逐一填入提交：1.10.0 >=1.9.0 符合、1.9.0 >=1.10.0 不符合、2.0.0 <10.0.0 符合、1.2.3 >1.2.3 不符合、1.02.3 輸入錯誤；另阻斷 API 驗證網路錯誤與恢復，檢查輸入修改後不保留舊結果。
同組有效案例以原生 CLI 與 HTTP API 交叉比對。開 https://semver.npmjs.com/ 先讀真實 UI，再用網站實際支援的方式核對這些基本穩定版本／比較條件，不捏造 selector 或觀察。
此處借用 npm 官方工具核對基本 SemVer，不表示我們實作 npm、NuGet、Maven 或 Python 套件管理器的完整版本規則。預期值來自人工固定案例與 https://semver.org/，外站不是唯一真值。
使用目前已核實的瀏覽器測試工具，為所選語言的 server 建立可重跑自動化測試，驗證以上頁面與網路錯誤；runner 與原生單元測試分開，測試啟動專用 port、結束後關閉自己的 server。
若缺測試工具，先說明要新增的獨立 browser tooling 與允許來源，不能把 pnpm test 假設為非 JS 應用的單元測試命令。沒有完成本機真實瀏覽器驗證就回報未完成；外站不可用明示原因與 CLI 備案，不冒充外站成功。
只送合成版本；記錄實際命令、工具／畫面結果及降級，停止自己啟動的服務後結束，不 commit／push。
```

## L10：由原生驗證流程生成 Skill

```text
先讀 DEMO\VersionCompatibility\DEMO-CONTRACT.md 的已確認語言、真正 CLI／測試命令與 https://code.visualstudio.com/docs/agent-customization/agent-skills。
在目前練習儲存庫根目錄建立 .github\skills\version-compatibility-check\SKILL.md；name=version-compatibility-check，description 說明何時用此 Skill 檢查版本範圍並執行本 DEMO 回歸。
Skill 以繁體中文記錄定位專案、執行本語言已驗證的 CLI、原生測試、整理 version／range／satisfies／錯誤及非升級安全限制的步驟。不把 node src\cli.js 或 pnpm test 複製到其他語言。
已有同名 Skill 但 scope／內容不同先報衝突，不覆寫；不要存 API Key、新增功能、安裝或升級其他專案、外傳相依清單或 commit／push。
更新 DEMO\VersionCompatibility\README.md（不是儲存庫根目錄 README）的 Skill 位置與新 chat 使用方式；生成文件不代表真的載入。提示我在含 .github\skills 的儲存庫根開新 chat 測試，完成後停止。
```

新 chat 的共通觸發 Prompt：

```text
請使用 version-compatibility-check Skill，檢查 1.10.0 是否符合 >=1.9.0，並執行這個 DEMO 所選語言的回歸驗證。
先確認 Skill 載入與專案位置，再使用其記錄的真實 CLI／測試命令。列實際工具結果與限制；未載入、缺工具或測試未通過都明確回報，不自行安裝、不更換語言、不擴充規則。
```
