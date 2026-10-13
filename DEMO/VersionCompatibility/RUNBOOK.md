# 版本範圍檢查器 DEMO：講師 RUNBOOK

對象：講師。完整可複製的 Prompt 在 [`PROMPTS.md`](PROMPTS.md)；專案規則、環境與限制在 [`README.md`](README.md)。本檔只列「何時用哪段 Prompt、準備什麼、觀眾看到什麼、怎麼驗收、何時停、失敗時切去哪裡」，**不取代 Prompt**。

> 本 DEMO 只判定版本範圍，不保證 API 相容或升級安全。任何一步都以實際命令輸出為準；Agent 說「完成」不算驗證。

## 路徑總覽

| 路徑 | 誰用 | 起點 | 特性 |
|---|---|---|---|
| **講師低等待路徑** | 講師現場 | 課前複製到獨立目錄的 `stages\*` 快照 | 每階段使用獨立 VS Code folder 或 `copilot -C <stage-folder>` CLI session；長時間生成可直接切到下一個快照 |
| **學員從零路徑** | 學員、講師排練 | 空白練習儲存庫 | 從 P00 依序跟做，不需要快照、BMI 或預製網站；不能跳過 P06 安裝與 P07 生成 |
| **無外網／工具不可用備案** | 兩者 | 見各階段與文末 | 一律明示是備案，不能說成即時操作成功 |

目前已驗證與未驗證的範圍見最後一節「排練狀態與限制」，現場不要超出它宣稱。

## 一、課前準備（講師，一次）

### 1. 每個快照放在獨立目錄

快照在 `DEMO\VersionCompatibility\stages\`，但**不要在儲存庫內直接安裝與排練**：在儲存庫內，Node 會往上層找到 `DEMO\VersionCompatibility\node_modules`，讓快照在沒有自己安裝的情況下也看似通過（實測 `stages\05-web` 在未安裝時 `pnpm test` 仍 213／213）。所以複製到儲存庫與任何 git 專案之外的新目錄：

```powershell
$Repo = 'C:\Source\Repos\GH-300'   # 合併後的根目錄；尚未合併時為 C:\Source\Repos\GH-300\.worktrees\version-compatibility-demo
$Rehearsal = 'C:\GH300-Rehearsal'  # 自選的新目錄，不可已存在
if (Test-Path $Rehearsal) { throw "$Rehearsal 已存在，停止，不覆寫" }
New-Item -ItemType Directory $Rehearsal | Out-Null
foreach ($s in '00-starter','01-buggy','02-fixed','03-refactored','04-tested','05-web') {
  Copy-Item -Recurse "$Repo\DEMO\VersionCompatibility\stages\$s" (Join-Path $Rehearsal $s)
}
```

### 2. 各副本的依賴與驗證

| 副本 | 準備 | 驗證（實際輸出） |
|---|---|---|
| `00-starter` | 無依賴 | `node --check src\cli.js`：無輸出、exit 0 |
| `01-buggy` | 無依賴 | `node src\cli.js 1.10.0 ">=1.9.0"` → `版本 1.10.0 不符合範圍 >=1.9.0`（刻意的錯誤）；`pnpm test` → tests 1／fail 1、exit 1（**預期失敗**） |
| `02-fixed` | 無依賴 | `pnpm test` → 17／17；同一命令 → `符合範圍` |
| `03-refactored` | 無依賴 | `pnpm test` → 17／17 |
| `04-tested` | 見下方 P06 預先安裝 | `pnpm test` → 73／73（安裝 semver 前） |
| `05-web` | `pnpm install --frozen-lockfile --registry=https://packagefeedproxy.microsoft.io/npm/`；`pnpm exec playwright install chromium` | `pnpm test` → 213／213；`pnpm run test:browser` → 11 passed |

**獨立副本重驗（Task 5）**：已將六個 stage 複製至儲存庫外的新目錄，確認各副本起初皆無 `node_modules`。在副本 `05-web` 執行 `pnpm install --frozen-lockfile --registry=https://packagefeedproxy.microsoft.io/npm/` 成功，再執行 `pnpm test`（213／213）與 `pnpm run test:browser`（11 passed）。以下各快照的通過結果因此是在儲存庫外的副本取得，不是借用父專案 `node_modules`；學員外部機器是否可連內部 feed 仍未驗證。

**04-tested 與 semver（釐清 P11 的敘述）**：儲存庫內的 `stages\04-tested` 是 semver 整合**前**的快照，`package.json` 沒有 semver 依賴。P11 允許講師課前安裝以便現場 P06 不下載套件，作法是只在**副本**執行：

```powershell
Set-Location "$Rehearsal\04-tested"
pnpm add --save-exact semver@7.8.5 --registry=https://packagefeedproxy.microsoft.io/npm/
```

這會改到該副本的 `package.json` 與 `pnpm-lock.yaml`，不影響儲存庫快照；P06 的 Prompt 因此會走「已預先安裝且 manifest／lockfile 一致，驗證版本而不重裝」。核心仍是教學手刻版，現場只替換核心。

`pnpm-lock.yaml` 的 semver tarball 指向內部 feed（`pkgs.visualstudio.com`）。在外部或雲端機器 `pnpm install --frozen-lockfile` 可能失敗；此時不要靜默改用官方來源，改走學員從零路徑（自己的 `pnpm add`），或請維護者重新產生 lockfile。

### 3. MCP 設定範圍

Context7 設定位於練習儲存庫根目錄 `.vscode\mcp.json`，僅供該 workspace 的 VS Code extension-host 使用；是否載入及 OAuth／信任仍須本人課前確認。階段快照不繼承父目錄的設定；若要在 `04-tested` 使用 Context7，需在該副本建立只含 Context7 的非機密設定，並由本人檢閱、登入及核准。

Playwright MCP 不寫入 `.vscode\mcp.json`，也不在 VS Code 啟動。P09-Setup 使用 `--additional-mcp-config` 將 Server 限定在單次 Copilot CLI session，個別 allow 導覽、快照、填表、點擊，並 deny `browser_run_code_unsafe`、shell、write。CLI 不支援逐工具選項或工具清單不符時，停止 MCP 路徑並改用 Playwright runner 備案。

**這兩件事在本教材的製作環境都沒有被驗證**（見最後一節）。未實測成功前，現場一律走「備案」，且不得說成 MCP 成功。

### 4. Skill 課前實測

Skill 在儲存庫根目錄 `.github\skills\version-compatibility-check\`。以 `copilot -C <練習儲存庫根目錄>` 開啟新的 Copilot CLI session，貼上 `PROMPTS.md` P10 的「新 chat 的實際觸發 Prompt」，記錄 Skill 是否被載入與實際命令輸出。使用 VS Code 也可新開 chat；獨立副本資料夾沒有這個 Skill。

### 5. 現場切換規則

- 一個階段開一個 VS Code folder（`File > Open Folder` 或新視窗）；**只開另一個 folder**。
- 不對目前資料夾執行 restore、checkout、reset、clean，也不刪除未提交的修改；失敗時保留現場、直接開下一個快照副本。
- 不共享可寫的程式檔，不切換全域 Node，不停止他人的 server／程序。

## 二、逐段腳本

每段欄位：**Prompt**（編號即 `PROMPTS.md` 中的完整文字）、**前置**、**動作**、**觀眾可見**、**驗收**、**停止**、**恢復點**（講師快照／學員從零／備案）、**講解重點**。除非另註，命令在該階段的專案根目錄執行（儲存庫內為 `DEMO\VersionCompatibility`；快照副本為其根目錄）。

### P00-Preflight、P00：環境檢查與起始專案

- **Prompt**：P00-Preflight、P00（語言中立路徑為 L00）。
- **前置**：Node 24、pnpm 10.33.2；Copilot Agent 可用。inline Completion 若現場展示，另需支援補全的編輯器。
- **動作**：在 VS Code Agent 或 Copilot CLI 新 session 貼 P00-Preflight（只檢查），再貼 P00 建立 `package.json`、`.gitignore`、`src\cli.js`（只有註解）、`README.md`。
- **觀眾可見**：`node --version`、`pnpm --version` 的實際輸出；Agent 對無法查證的 Completion／IDE 狀態寫「需人工確認」；產生的檔案清單。
- **驗收**：`node --check src\cli.js` exit 0；`package.json` 的 `scripts.demo` 為 `node src\cli.js`，沒有 `package-lock.json`。
- **停止**：缺 Node 24／登入／信任 → 列為課前手動項目並停止；目錄已有內容 → 列衝突並停止，不覆寫。
- **恢復點**：講師快照 `00-starter`；學員從零：本階段就是起點；備案：無。
- **講解重點**：先檢查、不偷偷安裝；工具鏈固定為 pnpm；此工具只判定版本範圍。

### P01：Code Completion 建立單一 function

- **Prompt**：P01（只貼註解，不交給 Agent；L01 為語言中立）。
- **前置**：P00 完成；`00-starter\src\cli.js` 已含此註解。
- **動作**：在 `src\cli.js` 打字、接受 inline suggestion；跑 `node src\cli.js 1.10.0 ">=1.9.0"` 與 `node src\cli.js 1.9.0 ">=1.10.0"`。
- **觀眾可見**：Completion 逐步補全；兩個命令的繁體中文輸出。Completion 不保證自然產生錯誤。
- **驗收**：結果為 `符合`／`不符合`，exit 0。已正確 → 說明並進入 P01B。
- **停止**：Completion 遲遲不出現 → 不改請 Agent 代寫，直接切快照。
- **恢復點**：講師快照 `00-starter`（含註解，可重來）；Completion 的**成果沒有獨立快照**，下一個可展示的狀態是 `01-buggy`（含 BUG）或 `02-fixed`（已修）；學員從零：重貼註解；備案：無。
- **講解重點**：Completion 是補完，不是 Agent；註解就是規格。

### P01B（可選）：教學 BUG 注入

- **Prompt**：P01B（L01B）。
- **前置**：P01 的單一 function。
- **動作**：貼 P01B，讓版本以字串字典序比較。
- **觀眾可見**：`node src\cli.js 1.10.0 ">=1.9.0"` → `版本 1.10.0 不符合範圍 >=1.9.0`；檔案標示為教學錯誤版本。
- **驗收**：只有字串比較這一個錯誤；明說違反 SemVer 數值比較（https://semver.org/）。
- **停止**：出現其他 BUG 或放寬驗證 → 停止並丟棄這次輸出。
- **恢復點**：講師快照 `01-buggy`（`pnpm test` 預期失敗：tests 1／fail 1）；學員從零：重跑 P01B；備案：無。
- **講解重點**：這是刻意的故障注入，不得進入最終 core／API／網站。

### P02：Agent 重現、回歸測試與修 BUG

- **Prompt**：P02（L02）。
- **前置**：`01-buggy`（或含 BUG 的學員專案）。
- **動作**：貼 P02：先重現、先寫 `tests\cli.test.js` 回歸並確認紅燈、再最小修正。
- **觀眾可見**：測試先失敗（`+ '版本 1.10.0 不符合範圍 >=1.9.0'`），修正後轉綠。
- **驗收**：`pnpm test` 17／17；兩個 CLI 案例結果相反且 exit 0；`1.02.3` 等非法輸入 exit 1。
- **停止**：無法重現 → 回報並停止，不製造新 BUG；修正需要放寬需求 → 停止。
- **恢復點**：講師快照 `02-fixed`；學員從零：重跑 P02；備案：無。
- **講解重點**：先紅後綠；major／minor／patch 逐段數值比較。

### P03：Agent refactor，不改變行為

- **Prompt**：P03（L03）。
- **前置**：`02-fixed`。
- **動作**：貼 P03，拆出 `src\core.js`（`checkCompatibility`、`CompatibilityInputError`）。
- **觀眾可見**：`cli.js` 縮成約 24 行；diff 重點是邏輯搬到純函式 core。
- **驗收**：`pnpm test` 仍 17／17；CLI 輸出與 exit code 不變。
- **停止**：行為改變或測試被刪除／放寬 → 停止。
- **恢復點**：講師快照 `03-refactored`；學員從零：重跑 P03；備案：無。
- **講解重點**：refactor 不改行為；CLI 只做參數、輸出、exit code。

### P04：Agent 產生單元測試

- **Prompt**：P04（L04）。
- **前置**：`03-refactored`。
- **動作**：貼 P04，建立 `tests\core.test.js`（`04-tested` 快照另含人工預期值 `fixtures\cases.json`；P04 本身沒有要求它，語言中立的 L04 才要求）。
- **觀眾可見**：每個案例獨立 `test`，Arrange／Act／Assert 清楚。
- **驗收**：`pnpm test` 73／73；非法輸入驗證 error code，不被當成 false。
- **停止**：需放寬需求才能通過 → 停止；不建網站、不擴充 `^`／`~`。
- **恢復點**：講師快照 `04-tested`（semver 整合前）；學員從零：重跑 P04；備案：無。
- **講解重點**：測公開行為，不鎖內部函式，下一段才能換套件。

### P05-Setup、P05：Context7 查詢（先看文件）

- **Prompt**：P05-Setup（課前）、P05（L05）。
- **前置**：該 workspace 有自己的 `.vscode\mcp.json`，講師已本人登入並核准 Context7（見「課前準備」）。
- **動作**：貼 P05，讓 Agent 先辨識實際工具與 library，再查 `valid`、`validRange`、`satisfies`。
- **觀眾可見**：實際的 MCP 工具呼叫、來源 URL、版本與摘錄；為何單靠 `validRange` 會放行超出我們政策的語法（本 DEMO 的 `tests\semver-allowlist.test.js` 有證明）。
- **驗收**：只有取得工具並成功呼叫才算 MCP 成功。**製作環境未驗證這一點。**
- **停止**：MCP 不可用、未核准、找不到 semver → 明說「MCP 未成功」，不捏造呼叫或結果。
- **恢復點**：講師快照：無（本階段不改程式；P06 從 `04-tested` 副本進行）。
- **備案（無外網或 MCP 不可用）**：讀 https://github.com/npm/node-semver，講師可展示 `references\semver-evidence.md`；兩者都必須說明是「官方文件備案」，不是 MCP 結果。
- **講解重點**：MCP 設定產生 ≠ 已連線；不送程式碼、憑證或真實套件清單，只問合成例子。

### P06：依文件用 semver 接替教學核心

- **Prompt**：P06（L06 為語言中立，須使用該語言的成熟 SemVer 套件，不複製 JS 命令）。
- **前置**：講師低等待用已預先安裝 semver 的 `04-tested` 副本（見「課前準備」2）；學員從零需要現場安裝。
- **動作**：先補新增行為測試並確認紅燈，再換核心。講師路徑驗證 `semver@7.8.5` 已存在而不重裝；學員路徑執行 `pnpm add --save-exact semver@7.8.5 --registry=https://packagefeedproxy.microsoft.io/npm/`。
- **觀眾可見**：紅燈（新行為失敗）→ 換核心後綠燈；`1.3.0 ^1.2.3` 符合、`2.0.0 ^1.2.3` 不符合、`1.2.4-beta.1 ^1.2.3` 不符合。
- **驗收**：`pnpm test` 通過（最終專案含 semver 輸入政策測試時共 195 項，加上 server 測試後為 213 項）；固定案例結果見 README「固定驗收案例」；原穩定版本結果不變。
- **停止**：套件接受的語法被放行（未先擋下）→ 停止；為了通過而刪測試 → 停止。
- **恢復點**：講師快照：**沒有 P06 中間快照**，直接切 `05-web`（最終成果，已含 semver）；學員從零：重跑 P06；備案：離線時只能用已預先安裝的副本。
- **講解重點**：先用我們的政策擋，再交給套件；pre-release 採 npm 語意，與 semver.org 純 precedence 不同；不開 loose／`includePrerelease`／`coerce`。

### P07：從零產生共用核心的 server 與網站骨架

- **Prompt**：P07（L07）。
- **前置**：已接替 semver 的專案。
- **動作**：貼 P07：先寫 HTTP 契約測試再實作；測試用自動 port。
- **觀眾可見**：`GET /api/health` → `{"status":"ok"}`；`/api/check` 呼叫同一個 `core.js`；缺參數 400、未知路徑 404、非 GET 405。
- **驗收**：`pnpm test`（含 server 測試）通過；啟動 `pnpm start` 後 health 回 ok；port 被占用時回報或換 port，不停止他人程序；結束時停止自己的 server。
- **停止**：測試需要人工留下的 server → 修測試；不使用 Express／框架／CDN。
- **恢復點**：講師快照：**沒有 P07 中間快照**。這一段課前由講師用相同 Prompt 在自己的排練副本生成並保存；現場展示該成果；來不及就切 `05-web`。學員從零：不可跳過，必須生成。備案：無。
- **講解重點**：API 與 CLI 共用 core，不重寫判定；`false` 是 200，輸入錯誤是 400。

### P08：Agent 生成完整薄型網頁

- **Prompt**：P08（L08）。
- **前置**：P07 的骨架。
- **動作**：現場只做薄 UI 的小增量（例如表單與範例按鈕）；完整成果在 `05-web`。
- **觀眾可見**：瀏覽 `http://127.0.0.1:3000/`；`?scoutTheme=dark` 切換主題；「符合」「不符合」「輸入錯誤」「網路錯誤」四種畫面分開。
- **驗收**：`pnpm test` 通過；`/api/health` 回 ok；只把實際執行過的驗證稱為通過（瀏覽器完整驗證在 P09）。
- **停止**：出現瀏覽器端另寫的版本判定、CDN、框架 → 停止。
- **恢復點**：講師快照 `05-web`；學員從零：重跑 P08；備案：無。
- **講解重點**：主題 tokens 與第一個 script 來自 Prompt 本身（不依賴講師私有 Skill）；修改輸入要清掉舊結果、舊請求不能覆蓋新輸入。

### P09-Setup、P09：真實瀏覽器操作與交叉比對

- **Prompt**：P09-Setup（課前）、P09（L09-Setup、L09）。
- **前置**：`05-web` 副本已安裝依賴與 Chromium。Playwright MCP 僅使用 P09-Setup 的 `--additional-mcp-config` 在單次 Copilot CLI session 載入，不寫入 `.vscode\mcp.json`；只個別核准導覽、快照、填表及點擊工具，拒絕 `browser_run_code_unsafe`、shell、write。CLI URL permission 不限制 MCP 瀏覽器；不要宣稱此命令是本機-only 的網路安全邊界。設定載入後先以 `about:blank` 做冒煙檢查。
- **動作**：貼 P09，操作真實頁面並讀畫面：`1.10.0 >=1.9.0` 符合、`2.0.0 ^1.2.3` 不符合、`1.3.0 ~1.2.3` 不符合、`1.02.3` 輸入錯誤；阻斷 API 驗證網路錯誤與恢復。再到 https://semver.npmjs.com/ 先讀 UI 再操作。
- **觀眾可見**：實際頁面結果；外站的 package／range 輸入與結果列表。
- **驗收**：`pnpm test` 213／213；`pnpm run test:browser` 11 passed。外站只證明與 node-semver 生態一致，不是獨立真值；預期值來自固定案例與 https://semver.org/。
- **停止**：沒有完成本機真實瀏覽器驗證就報未完成；外站或工具不可用要列原因，不冒充。
- **恢復點**：講師快照 `05-web`；學員從零：重跑 P09。
- **備案（MCP 不可用）**：改跑 `pnpm run test:browser`（Playwright 測試 runner 在真實 Chromium），並明說**不是 MCP 操作**。外站不可用：用本機 CLI 與 `fixtures\cases.json` 代替，明說未操作外站。
- **講解重點**：兩種驗證分開——`pnpm test`（node:test）與 `pnpm run test:browser`（Playwright）；MCP 準備完成不等於瀏覽器測試通過。

### P10：Agent 生成 Skill，再示範載入

- **Prompt**：P10 與其「新 chat 的實際觸發 Prompt」（L10 為語言中立：使用所選語言的已驗證命令，不複製 `node src\cli.js` 或 `pnpm test`）。
- **前置**：**切回含 `.github\skills` 的儲存庫根目錄**，開**新的 GitHub Copilot CLI session**；獨立快照副本沒有這個 Skill。
- **動作**：先貼 P10 讓 Agent 生成（或展示儲存庫已有的 `SKILL.md` 作為成果）；先執行 `copilot skill list` 確認發現，再以 `copilot -C . --name "GH300 Version Compatibility" -i "<貼上新 chat 的實際觸發 Prompt>"` 啟動新 session。
- **觀眾可見**：Skill 是否真的被載入、實際執行的 `node src\cli.js 1.10.0 ">=1.9.0"` 與 `pnpm test` 輸出、`satisfies` 結論與「非升級安全保證」限制。
- **驗收**：必須同時有「Skill 載入證據」與「實際命令輸出」；只展示 `SKILL.md` 內容不算成功。`copilot skill list` 與本次新命名 CLI session 已實測成功。
- **停止**：未載入 → 依序檢查資料夾位置（根目錄的 `.github\skills\version-compatibility-check\`）、`name` 與資料夾名稱一致、`description` 含觸發情境、`copilot skill list` 是否列出；仍失敗就如實說未載入；不安裝套件、不擴充功能。
- **恢復點**：儲存庫根目錄的 `SKILL.md`（本專案已提供）；學員從零：重跑 P10。
- **講解重點**：Skill 是可重用的程序說明；它只在本 DEMO 目錄執行既有命令，不掃描或外傳其他專案的相依清單。

### P11：講師課前以相同 Prompt 生成快照與腳本

- **Prompt**：P11（只在課前使用，不屬於現場）。
- **動作**：在彼此獨立的練習目錄依序用相同 Prompt 生成並驗證各階段，保存到 `stages\*`；產生並維護本 RUNBOOK。
- **驗收**：`PROMPTS.md` 仍含全部完整 Prompt（不只編號、摘要或外部連結）；排練證實的問題才修教材。
- **停止**：教材缺項 → 列缺項並停止。

## 三、學員從零路徑（摘要）

1. 從空白練習儲存庫開始，在 `DEMO\VersionCompatibility` 依 P00 → P10（JavaScript）或 L00 → L10（其他語言）順序跟做；不需要快照、BMI 或預製網站。
2. 每次開新 Agent chat 先定位 `DEMO\VersionCompatibility`；登入、API Key、MCP 信任由自己課前手動完成。
3. 每段以該段「驗收」的實際輸出判斷是否完成；失敗就依停止條件停下，不要求 Agent 自行繞過。
4. 無快照可切換。Context7／Playwright MCP 不可用時，使用上面的備案並如實標示。

## 四、無外網備案對照

| 項目 | 備案 | 必須說明 |
|---|---|---|
| Context7 MCP | 讀官方 README；講師可展示 `references\semver-evidence.md` | 是官方文件備案，不是 MCP 結果 |
| Playwright MCP | `pnpm run test:browser`（Chromium） | 是測試 runner，不是 MCP 操作 |
| semver.npmjs.com | 本機 CLI 與 `fixtures\cases.json` | 未操作外站 |
| npm registry | 課前已安裝的獨立副本 | 不現場改全域 registry、不靜默改官方來源 |
| Chromium 下載 | 課前以 `pnpm exec playwright install chromium` 準備 | 官方發行資源，不是 npm registry |

## 五、排練狀態與限制（請勿超出宣稱）

**已驗證（命令與輸出）**

- 各快照已在儲存庫外獨立副本重驗：`00-starter` `node --check` exit 0；`01-buggy` `pnpm test` fail 1（預期，斷言指出字串排序錯誤）；`02-fixed` 與 `03-refactored` 17／17；`04-tested` 73／73；`05-web` `pnpm test` 213／213、`pnpm run test:browser` 11 passed。`05-web` 的 `pnpm install --frozen-lockfile --registry=https://packagefeedproxy.microsoft.io/npm/` 成功。
- 最終專案：`pnpm test` 213／213；`pnpm run test:browser` 11 passed（`@playwright/test` 於真實 Chromium）；固定案例結果見 README。
- Skill：`copilot skill list` 已發現 Skill；新的命名 Copilot CLI session 實際載入 Skill，執行 `node src\cli.js "1.10.0" ">=1.9.0"`（符合、exit 0）與 `pnpm test`（213／213、exit 0），未修改檔案或安裝套件。
- Python 語言中立路徑：隔離 scratch 使用 Python 3.11.9、uv 0.12.18、semver 3.0.4，最終 `unittest` 55／55；CLI 與 HTTP 七案一致；wheel build 與語法檢查通過。另開新 Copilot CLI session 實際載入 Python Skill，`1.10.0 >=1.9.0` exit 0，55 tests 全通過。L01 inline Completion 以 Agent 模擬，未驗證 IDE ghost text；L05 用官方文件備案；L09 用既有 Chrome／CDP 完成本機頁面與網路錯誤檢查，非 Playwright MCP；未操作 npm 外站。
- Playwright MCP：Copilot CLI 單次設定實際呼叫成功；`about:blank` 冒煙通過。本機頁面導覽／填表／提交操作曾執行，但 MCP 回傳的頁面快照皆為空，未能讀取畫面結果；正式網頁驗收仍以 Playwright runner 的 Chromium 11／11 為準，不冒稱 MCP 驗證完成。

**未驗證**

- Context7 MCP 在 VS Code／CLI 的實際載入、登入與工具呼叫；Playwright MCP 對本機頁面的快照結果；`.vscode\mcp.json` 是否被 VS Code 實際讀取。VS Code Playwright 路徑不採用。
- Playwright MCP 已由 Copilot CLI 使用 `--additional-mcp-config` 在單次 session 載入並操作；about:blank 快照為空白是預期，但本機頁面快照也未回傳文字，故不宣稱 MCP 已驗證 UI。CLI workspace MCP 設定未建立。預設 `copilot mcp list --json` 只有內建伺服器；CLI workspace 設定位置是 `.mcp.json` 或 `.github\mcp.json`，不含 `.vscode\mcp.json`。
- `@playwright/mcp@0.0.83`（Playwright 1.64 alpha）與 `@playwright/test@1.63.0` 並存時，MCP 所需 browser revision 是否已就緒。
- Python 路徑為隔離 Agent 排練，不是 live 學員或 inline Completion 操作；L01 使用 Agent 模擬。L10 新 Copilot CLI Skill 載入與驗證已完成；Context7／外站未實際操作。
- 從空白資料夾（無快照、無預製網站）完整跟做學員路徑，以及「快照由 Copilot 以對應 Prompt 現場重現」尚未實際排練；快照由開發與測試產生並驗證。
- 內部 feed 的 lockfile tarball 在外部機器是否可解析。
