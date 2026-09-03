# GH-300 備課指南：GitHub Copilot

> 講師專用。本文件以 `PPT\GH-300 Restructuring.pptx` 的 52 張投影片與 speaker notes 為基礎，
> 並以目前的 [GH-300 Study Guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/gh-300) 校正課程範圍。
> 學員用連結請見根目錄 [README](../README.md)；示範快照與執行方式請見
> [demo-environment.md](demo-environment.md)。

## 課程概覽

- **課程**：Course GH-300T00-A: GitHub Copilot
- **建議授課長度**：1 天
- **受眾**：具 GitHub 基礎、希望以 GitHub Copilot 提升開發生產力、品質與安全性的開發者、
  技術主管與管理者。
- **先備條件**：GitHub 帳戶、基本 GitHub 與至少一種程式語言的使用經驗；要完成實作，帳戶必須
  有可用的 GitHub Copilot 訂閱或組織指派的 seat。

課程頁與兩條 Learn 路徑提供 **Achievement Code**；這和通過
[GH-300 certification exam](https://learn.microsoft.com/en-us/credentials/certifications/github-copilot/)
是兩件不同的事。課前再次核對目前是否有相符的 Applied Skills，不要將課程成就碼說成 Applied Skill。

## 課程地圖：4 個授課模組

| 授課模組 | 投影片 | 主要內容 | 實作資源 |
| --- | ---: | --- | --- |
| M1 - Introduction to GitHub Copilot | 1–15 | Plans、設定、風險、Responsible AI | [Getting started skill](https://github.com/skills/getting-started-with-github-copilot) |
| M2 - Exploring GitHub Copilot Features | 16–31 | completion、Chat、prompt engineering、data、CLI、content exclusions | [Advanced exercises](https://github.com/MicrosoftDocs/mslearn-advanced-copilot) |
| M3 - Developer use cases for AI | 32–43 | 生產力、SDLC、JavaScript、Python | [JavaScript](https://github.com/MicrosoftDocs/mslearn-copilot-codespaces-javascript) / [Python](https://github.com/MicrosoftDocs/mslearn-copilot-codespaces-python) |
| M4 - Develop unit tests using GitHub Copilot tools | 44–51 | xUnit、Chat、edge cases、test review | [Current developer exercises](https://github.com/MicrosoftLearning/mslearn-github-copilot-dev) |

投影片 52 只有「Module 5」封面，沒有 M5 內容；它是 M4 後的殘留頁，授課時略過。

## 建議議程與時間分配

| 時段 | 主題 | 講師重點 |
| --- | --- | --- |
| 開場 | 課程定位與環境檢查 | 確認 Copilot seat、IDE 登入、public-code matching 設定 |
| M1 | Plans、設定與 Responsible AI | 先建立「產出須驗證」的共同語言 |
| M2 | Chat、prompt、資料與 agent capabilities | 用同一個小需求對照 completion、Chat 與 agent |
| 休息 | 環境／Lab 緩衝 | 協助帳戶或 Codespaces 問題 |
| M3 | 生產力與程式語言實作 | 以 JavaScript 或 Python 其中一個主線 demo |
| M4 | 測試、edge cases 與 review | 讓學員先寫測試意圖，再由 Copilot 協助補齊 |
| 收尾 | Drift、考試範圍、Q&A | 明確告知投影片與現行考試的落差 |

## 貫穿全課的核心觀念

| 觀念 | 講法與提醒 |
| --- | --- |
| 責任歸屬 | Copilot 產出是建議，不是已驗證的事實；仍由開發者審核正確性、授權、安全與測試。 |
| Prompt 與 context | 先說明目標、限制、輸入輸出與驗收條件；只提供完成任務需要的 context。 |
| 計畫／功能選擇 | 不要用舊投影片的功能表格當唯一真相；開課前以 [plans](https://docs.github.com/en/copilot/get-started/plans) 核對。 |
| Privacy 與治理 | 說明 [content exclusions](https://docs.github.com/en/copilot/how-tos/configure-content-exclusion) 的範圍與限制，並用組織政策管理風險。 |
| 測量影響 | 以交付時間、返工、缺陷、review 負擔與開發者體驗等多種訊號衡量；不要只用「接受了幾個建議」判斷。 |

### 重要對比

| 對比 | 講師要點 |
| --- | --- |
| Pro vs Business vs Enterprise | 個人方案與組織方案的差異重點是管理、政策與治理需求。功能與名稱可能調整，引用現行 [plans](https://docs.github.com/en/copilot/get-started/plans) 而非死背投影片。 |
| Code completion vs Copilot Chat | completion 適合行內、短距離改動；Chat 適合詢問、解釋、規劃與多檔案脈絡。 |
| Agent mode vs Cloud Agent | agent mode 適合在使用者互動下迭代；[Cloud Agent](https://docs.github.com/en/copilot/concepts/agents/cloud-agent) 可在 GitHub 背景執行任務。兩者均須檢查 diff 與測試。 |
| Content exclusion vs public-code matching filter | 前者控制哪些內容可作為 context；後者處理與公開程式碼相符的建議。兩者不能互相取代。 |

## 逐模組備課指南

### M1 - Introduction to GitHub Copilot

**學習目標**

- 比較計畫層級與組織管理需求。
- 設定、使用與初步疑難排解 GitHub Copilot。
- 說明 AI 風險，以及負責任使用與驗證輸出的原則。

**講解重點**

- 投影片 2–3 用 plans、use cases 與 customer stories 開場；避免把舊的方案功能矩陣當作承諾，
  改以目前官方 [plans](https://docs.github.com/en/copilot/get-started/plans) 頁面核對。
- 投影片 7–10 聚焦 IDE 登入、互動方式、content exclusions 與常見疑難排解。
- 投影片 11–13 是本模組的安全護欄：偏誤、幻覺、隱私、授權與 public-code matching 都需要人類決策。

**Demo / Lab**

- 先完成 [Getting started with GitHub Copilot](https://github.com/skills/getting-started-with-github-copilot)。
- 請學員以一段小函式示範：接受前先讀懂、修改後執行測試、最後說明驗證結果。

**知識檢查與常見坑**

| 題目 | 答案／處理方式 |
| --- | --- |
| 生成結果看似合理，是否可直接合併？ | 不可。先做 code review、測試、授權與安全檢查。 |
| 組織要統一控管功能與政策時要看什麼？ | 先確認組織適用的方案與管理功能，不要只依個人帳戶畫面判斷。 |
| Copilot 沒有建議時先查什麼？ | 登入帳戶、seat、IDE 擴充、網路／proxy、檔案與內容排除設定。 |

**重要連結**

- [Responsible use of GitHub Copilot Chat](https://docs.github.com/en/copilot/responsible-use/chat)
- [Configuring and auditing content exclusion](https://docs.github.com/en/copilot/how-tos/configure-content-exclusion)

### M2 - Exploring GitHub Copilot Features

**學習目標**

- 選擇 code completion、Chat、CLI 與 agents 的正確使用情境。
- 建構可重複使用的 prompt 與 repository guidance。
- 說明 prompt、context、資料流與模型選擇如何影響結果。

**講解重點**

- 投影片 20–22 依序介紹 completion、Chat 與命令列。以同一需求先做一行 completion，再以 Chat 要求
  測試／邊界條件，讓學員看見 context 與互動模式的差異。
- 投影片 24–27 是 prompt engineering、user prompt process flow、GitHub Copilot data 與 LLMs；
  示範 prompt 裡加入角色、任務、限制、輸入與驗收條件。
- 投影片 28–30 重複提醒 contractual protections、public-code matching、content exclusions 與排錯；
  應重新連回 M1 的負責任使用主線。

**Demo / Lab**

- 使用 [Advanced GitHub Copilot exercises](https://github.com/MicrosoftDocs/mslearn-advanced-copilot)。
- 示範 [repository instructions](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions-in-your-ide/add-repository-instructions-in-your-ide?tool=visualstudio)
  與 [prompt files](https://docs.github.com/en/copilot/tutorials/customization-library/prompt-files)，但不要讓學員直接複製未審查的全域規則。

**知識檢查與常見坑**

| 題目 | 答案／處理方式 |
| --- | --- |
| Prompt 不夠精準怎麼改善？ | 補上目標、限制、輸入輸出範例與完成條件；分割過大的任務。 |
| 能否把機密資料整段貼進 Chat？ | 先遵循公司資料分類、content exclusion 與核准的工具政策；不以「方便」取代治理。 |
| `gh copilot suggest` 是否仍是課程應教指令？ | 否。它是舊 GitHub CLI extension 的流程；改教現行 [GitHub Copilot CLI](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-copilot-cli)。 |

**重要連結**

- [GitHub Copilot CLI](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-copilot-cli)
- [Create and manage agent customizations in VS Code](https://code.visualstudio.com/docs/agent-customization/overview)

### M3 - Developer use cases for AI

**學習目標**

- 描述 Copilot 如何融入不同 SDLC 階段與開發者偏好。
- 在 JavaScript 或 Python 範例中，以驗收條件導向的 prompt 進行修改。
- 辨識 AI 限制並使用多元指標衡量效果。

**講解重點**

- 投影片 34–37 把焦點放在 productivity、developer preferences、SDLC、limitations 與 measurement；
  告訴學員 Copilot 的價值不是輸出更多程式碼，而是減少可避免的重工並提升回饋速度。
- 投影片 38–42 提供 JavaScript 與 Python 路線；時間不足時只選一條完整走完，另一條說明差異即可。

**Demo / Lab**

- [GitHub Copilot JavaScript portfolio](https://github.com/MicrosoftDocs/mslearn-copilot-codespaces-javascript)
- [GitHub Copilot Python web API](https://github.com/MicrosoftDocs/mslearn-copilot-codespaces-python)

**知識檢查與常見坑**

| 題目 | 答案／處理方式 |
| --- | --- |
| 如何證明工具有生產力效益？ | 定義基準線，結合交付時間、品質、返工與開發者回饋；不要只量建議接受率。 |
| 生成的程式碼能跑但不符合需求怎麼辦？ | 回到需求與驗收條件，補測試與邊界案例；不要用更多隨機 prompt 掩蓋問題。 |

### M4 - Develop unit tests using GitHub Copilot tools

**學習目標**

- 使用 Copilot 與 VS Code 協助建立與管理 xUnit 單元測試。
- 以具體條件、邊界值與負向案例要求測試。
- 審核測試是否真的驗證行為，而非只追求覆蓋率。

**講解重點**

- 投影片 45–46 說明 xUnit、VS Code 與 Chat / inline chat 的角色。先讓學員講出預期行為，
  再讓 Copilot 產生測試草稿。
- 投影片 47–50 的舊流程可當 prompt 範例，但實作應改用目前的
  [GitHub Copilot developer exercises](https://github.com/MicrosoftLearning/mslearn-github-copilot-dev)。
- speaker notes 特別提醒：如果組織政策封鎖 matching public code，活動可能無法如預期運作；
  課前先確認，課中不要要求學員繞過政策。

**Demo / Lab**

- 本 repo 的 `DEMO\SampleApps\APL2007M4PrimeService-UnitTests` 適合示範最小目標測試；
  詳見 [demo-environment.md](demo-environment.md)。

**知識檢查與常見坑**

| 題目 | 答案／處理方式 |
| --- | --- |
| Copilot 產生十個測試，是否代表測試完整？ | 不代表。檢查每個 assertion 是否對應需求、是否包含邊界與失敗路徑。 |
| 為何要把特定條件寫進 prompt？ | 條件使測試意圖可檢查，避免只得到 happy path 或與需求無關的案例。 |
| 範例專案測試失敗要直接修來源嗎？ | 不要。此 repo 的快照可刻意保留錯誤，先確認該練習想教的情境。 |

## 投影片與現行課程／考試範圍的 Drift

| 項目 | 投影片狀態 | 現行補課處置 |
| --- | --- | --- |
| Agent mode、Cloud Agent、agent sessions、custom agents、Sub-Agents、Copilot Edits | 主投影片未完整涵蓋 | 在 M2 補用 [Use GitHub Copilot agents](https://docs.github.com/en/copilot/how-tos/use-copilot-agents)、[Cloud Agent](https://docs.github.com/en/copilot/concepts/agents/cloud-agent) 與 `skills/build-applications-w-copilot-agent-mode`；要求學員檢查 agent／Edits 產生的 diff 與驗證結果。 |
| MCP | 主投影片未完整涵蓋 | 補用 [About MCP](https://docs.github.com/en/copilot/concepts/context/mcp) 與 `skills/integrate-mcp-with-copilot`；先談權限與治理。 |
| Copilot Spaces | 主投影片未完整涵蓋；它是 **Part 1** 的正式模組 | 在 M1／M2 之間補用 [Spaces](https://docs.github.com/en/copilot/concepts/context/spaces) 與對應 GitHub Lab；不要把它排成 Part 2 的加料主題。 |
| Copilot code review | 主投影片未完整涵蓋；它是 **Part 2** 的正式模組 | 補用 [code review](https://docs.github.com/en/copilot/concepts/agents/code-review)，並保留人類審核責任。 |
| CLI | Slide 22 使用 `gh copilot suggest` | 改教獨立 `copilot` CLI；課前以官方安裝文件核對版本與命令。 |
| M4 練習 | Slides 47–50 為舊四段式流程 | 使用目前 `MicrosoftLearning/mslearn-github-copilot-dev`，並先確認其 instruction index。 |
| Spark、組織政策／audit log、REST API | 考試範圍明列，但投影片有限 | 依 [GH-300 Study Guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/gh-300) 補充；以當日產品可用性為準。 |

## 預期學員問題 Q&A

| 問題 | 建議回答 |
| --- | --- |
| 上完課就取得認證嗎？ | 不會。課程／路徑的 Achievement Code 與 GH-300 考試是不同項目。 |
| Agent 產生 PR 後還要 review 嗎？ | 要。agent 加速工作，不轉移變更品質、安全與合規的責任。 |
| MCP server 可不可以任意安裝？ | 不可以。先檢查資料範圍、工具權限、供應商、組織政策與審核需求。 |
| 為何 Copilot 有時看不到檔案？ | 檢查開啟的 workspace、context 範圍、content exclusions、帳戶與 IDE 狀態。 |
| 本課的 Labs 為何使用 GitHub repo？ | 這些是目前可用的官方實作來源；README 已刻意不混入 Learn 模組連結。 |

## 課前準備清單（開課前 1–2 天）

- [ ] 重新驗證 README、Lab、講師文件和投影片所用的外部連結。
- [ ] 確認每位學員的 GitHub 帳戶與 Copilot seat；需要 public-code matching 的活動先依組織政策確認。
- [ ] 在課前電腦測試 IDE、GitHub CLI／Copilot CLI、網路與 proxy。
- [ ] 以當日 [plans](https://docs.github.com/en/copilot/get-started/plans) 與
  [Study Guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/gh-300) 檢查產品名稱、範圍與考試比重。
- [ ] 選定 M3 的 JavaScript 或 Python 主線；備好 M4 PrimeService 的最小測試示範。
- [ ] 不修改 `DEMO\SampleApps\` 的教學快照；若範例失敗，先確認是否為刻意教學情境。

## 講師小技巧

- 第一個 demo 要小：用一個可驗證函式建立「prompt → diff → test → review」節奏。
- 先示範如何拒絕或修正不適用建議，比只示範成功補全更能建立正確期待。
- 時間不足時縮短 M3 的第二種語言，不省略 M1 的 Responsible AI 或 M4 的人工審核。
- 讓學員說出需要哪些 context 與驗收條件，再把答案寫成 prompt。
- 把 Cloud Agent、MCP 與自訂 agent 視為額外權限與治理課題，而非單純提高自動化程度。

## 參考

- [Course GH-300T00-A: GitHub Copilot](https://learn.microsoft.com/en-us/training/courses/gh-300t00)
- [GitHub Copilot Fundamentals Part 1](https://learn.microsoft.com/en-us/training/paths/copilot/)
- [GitHub Copilot Fundamentals Part 2](https://learn.microsoft.com/en-us/training/paths/gh-copilot-2/)
- [Study guide for Exam GH-300](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/gh-300)
- [Demo environment guide](demo-environment.md)
