# 講師 Runbook：團隊設備借用

講師準備文件；此 Demo 是本機課堂模擬，沒有登入或正式資產管理功能。主流程保留 Code Completion → Agent 修 BUG → refactor → 測試 → 文件查詢 → SQLite → HTTP／網頁 → 真實瀏覽器 → read-only Skill。

## 課前準備

1. 確認 Node.js 24、pnpm 10.33.2 與組織核准的本機 package registry。先在 `DEMO\EquipmentLending` 執行 README 所列安裝命令；Playwright browser binaries 另外安裝。
2. 執行 `pnpm test`、`pnpm test:browser`，保存實際結果。`02-buggy` 的 regression failure 是唯一預期紅燈；其他階段應成功。
3. 以 `scripts\verify-stages.ps1` 指定一個 repository 外、尚不存在的新路徑，確認八個快照分別獨立測試。Script 不刪除輸出；同名路徑即拒絕。
4. 為互動展示另建一個新的明確 DB，例如 `data\instructor-2026-10-14.sqlite`。只在不存在路徑執行一次 `init`。不要使用驗收測試 DB 或學員資料庫。
5. 親自確認 browser、VS Code、GitHub Copilot seat、repository content exclusion 與組織 MCP 政策；不要求學員放寬政策。
6. 對 Context7、Playwright MCP、Inline Completion 與 Skill 分別記錄實際工具及版本。沒有在本機完成操作，就標示未驗證，不借用舊 VersionCompatibility 的結果。

## 講師低等待路徑

| 段落 | 快照／輸入 | 觀眾要看到什麼 | 恢復方式 |
|---|---|---|---|
| P00 | `00-starter`、`fixtures\acceptance.json` | 清楚的借→還→再借驗收資料與版本檢查 | 直接轉 `01-console`，不在錯誤資料夾重建 |
| P01 | `01-console` | 編輯器 Inline Completion 完成單一函式，顯示實際建議及 diff | Inline Completion 不可用時如實標未驗證，改以已準備好的正確 snapshot 示範 Agent 差異 |
| P01B（可選） | `02-buggy` | regression 因歷史紀錄錯誤地阻止再借 | 保留紅燈視窗，接續在另一份 `03-fixed` 修正 |
| P02 | `02-buggy` → `03-fixed` | 先看到回歸失敗，再讓 Agent 只修「有效借用」判斷 | Agent 失敗時切 `03-fixed`，不在原 snapshot reset |
| P03 | `04-refactored` | 純規則與 service 分離，借還結果不變 | 切 `05-tested` |
| P04 | `05-tested` | 邊界、錯誤、DST 與歸還再借測試 | 保存原始輸出；不升級工具鏈來掩蓋 baseline |
| P05 | `references\sqlite-evidence.md` | 直接使用真正的 Context7 MCP 查固定 Node 24 SQLite API | MCP 不可用時展示官方文件備案，口頭清楚說明 Context7 未通過 |
| P06 | `06-sqlite` | 新 DB 初始化、程序間持久化、read-only report | 缺 DB 時停止，不自動建檔；用另一個全新 DB 做備援 |
| P07/P08 | `07-web` | 真實 UI 借 EQ-001、阻擋競爭借用、歸還、再借、保留歷史與時區 | 只在已初始化的新 DB 上重啟；不要以刷新頁面代替 server 重啟 |
| P09 | `07-web` 的獨立 browser fixture | Chromium 操作、兩個 context 衝突、DST、重啟後持久化 | runner 與 MCP 分開；runner 通過不代表 Playwright MCP 通過 |
| P10 | 根 `.github\skills\equipment-lending-report\SKILL.md` | Skill 讀真實報告並跑測試，不寫入 DB | 缺 Skill／DB 時展示明確錯誤，不新增隱性初始化 |
| P11 | 本 Runbook | 回顧每個階段、工具證據、停止條件與回復路徑 | 使用下一個已驗證副本，不刪除原故障現場 |

Inline Completion 必須在實際支援的編輯器完成；Agent 直接代寫不能替代這段證據。Context7 查詢的來源 ID／版本／內容要留存；從官方網站閱讀文件不等同成功使用 Context7。

## 學員從零路徑

1. 在 GH-300 repository 外建立一個新的空白練習目錄；不要複製 `stages\`，也不要在課程 repo 或另一位學員資料夾直接改。
2. 依 `PROMPTS.md` 執行 P00-Preflight 與 P00；由 P00 建立 package、手寫 acceptance fixture、scenario stub 與 regression test，並確認 stub 產生預期 red。P01 只用 Inline Completion 完成單一函式。
3. 為完整 bug-fix 教學，在同一個練習 repo 執行 P01B 注入唯一回歸缺陷，再以 P02 先看 red、由 Agent 修成 green。P03、P04 繼續在同一目錄 refactor 並擴增測試。
4. P05 查所選語言及版本對應的 SQLite 官方文件；P06 才加入 DB。若選 Node SQLite，注意 `node:sqlite` 在此 Node 版本仍是 experimental。
5. P07/P08 在同一 repo 維持單一 service，增加 loopback HTTP 與原生 web client。P09 才加入鎖定的 browser／MCP 套件並使用每個案例獨立的 DB／server。
6. P10 在學生 repo 建立 read-only Skill；P11 記錄可證明的能力與尚未實測項目。`stages\00-starter`–`07-web` 是講師低等待／恢復用的獨立副本，不是學生主線的輸入或依賴。

## 啟動與手動驗收

```powershell
Set-Location 'DEMO\EquipmentLending'
pnpm install --registry=https://packagefeedproxy.microsoft.io/npm/
pnpm test
pnpm exec playwright install chromium
pnpm test:browser
node src\cli.js init --database data\instructor-unique.sqlite
$env:DATABASE_PATH = 'data\instructor-unique.sqlite'
node src\server.js
```

另開 browser 到 `http://127.0.0.1:3000`。手動依序：確認 EQ-003 為逾期、EQ-001 可借；DEMO-A 借 EQ-001；另一個預先開啟頁面以 DEMO-B 嘗試同一設備並看見 409；歸還；再由 DEMO-B 借；在 history 確認 DEMO-A 歸還紀錄仍存在。不要只看按鈕 disable，要確認 HTTP server 真的拒絕衝突請求。

測試另會啟動獨立 Node server，將整個 process 關閉後以同一 DB 路徑重啟，核對 history；不同 browser context 使用 `Asia/Taipei` 與 `America/Los_Angeles`，逐字核對固定 DST instants。只重新整理頁面不算重啟持久化驗收。

## 快照產生與恢復

```powershell
Set-Location 'DEMO\EquipmentLending'
$exerciseRoot = Join-Path $env:TEMP ('GH-300-EquipmentLending-' + [guid]::NewGuid())
.\scripts\verify-stages.ps1 -DestinationRoot $exerciseRoot -ValidateOnly
.\scripts\verify-stages.ps1 -DestinationRoot $exerciseRoot
```

輸出路徑必須在整個 Git repository 外且尚不存在。可先用 `-ValidateOnly` 確認路徑；此模式不建立目錄或複製檔案。正式快照 script 只複製、不覆寫、不刪除，將 `NODE_PATH` 在其子程序中清空，並驗證只有 `02-buggy` 出現預期 regression failure。完成後依需要保留輸出；不執行遞迴刪除或 reset。若 script 停止，讀取錯誤並另選一個新的路徑；不得重用已有輸出。

## 工具缺失與常見故障

| 狀況 | 處置 |
|---|---|
| 設備借用 DB 不存在 | 停止 server／report；只以明確的新路徑初始化，不假造空報告 |
| 初始化回報路徑已存在 | 不覆寫；改用新的唯一檔名，保留既有 DB |
| SQLite locked／busy | 顯示 retryable 錯誤並稍後重試；不宣稱借用成功、不刪除鎖定者資料 |
| port 3000 已使用 | 不殺其他 process；確認其擁有者後另選未使用 port |
| 過期畫面造成 409 | 保留輸入、刷新 server 狀態；由 service 再次確認可借狀態 |
| timezone 顯示不同 | 比較同一 UTC instant 與各筆 offset；不手動加 8 小時 |
| Playwright runner 缺 browser | 依鎖定 runner 安裝 Chromium，不能用 MCP 的 Playwright 版本代替 |
| Context7／Playwright MCP 不在工具清單 | 明列未驗證；讀官方版本文件或使用 runner 作備案，不猜 server 設定 |
| Skill 未載入或命令失敗 | 保留 DB 與輸出；不呼叫 init／borrow／return，不自動安裝 |
| Inline Completion 無建議 | 核對編輯器、seat、設定及 content exclusion；不要宣稱 Agent 完成是 completion |

## 工具證據狀態

請以 `references\verification.md` 為唯一本次狀態記錄。此工作環境已安裝並執行固定 Playwright **test runner**；Context7 MCP 與 Playwright MCP 沒有可用工具／extension 時應保持「未驗證」。runner 的成功、官方文件讀取、NPM package 安裝與 MCP 操作是四種不同證據。
