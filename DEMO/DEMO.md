
# Agent Demo
## 版本範圍檢查器（Version Compatibility）
### GH-300 主線：Completion → 修 BUG → refactor → 測試 → Context7 → 網頁 → 瀏覽器驗證 → Skill
- 位置：`DEMO\VersionCompatibility\`
- 完整 Prompt：[`VersionCompatibility\PROMPTS.md`](VersionCompatibility/PROMPTS.md)（JavaScript 主線 P00–P11、語言中立 L00–L10）；入口索引見 [`PROMPT.md`](PROMPT.md)
- 講師逐段腳本、快照恢復點（`stages\00-starter` … `stages\05-web`）、備案：[`VersionCompatibility\RUNBOOK.md`](VersionCompatibility/RUNBOOK.md)
- 專案規則、環境、命令與限制：[`VersionCompatibility\README.md`](VersionCompatibility/README.md)
- 只判定版本範圍，不保證 API 相容或升級安全；Context7／Playwright MCP 與 Skill 的實際載入須課前實測，失敗時依 RUNBOOK 的備案如實標示。

## 訂閱管理系統
### 20250303
``` markdown
請使用 .NET 8 建立一個 ASP.NET Core 網站，使用 MVC 樣板，不要使用 Minimal API。
這個網站會幫助使用者來追蹤每一個訂閱制服務的費用以及繳費日期，並提供報表頁面供檢視，報表內容至少要包含：每個訂閱制服務的名稱、費用、繳費日期、剩餘天數。

網站的功能需求如下：

1. 使用者可以新增、修改、刪除訂閱制服務，每個訂閱制服務至少要有名稱、費用、繳費日期。
  - 使用者可以透過日曆方式來查看每個月的訂閱制服務費用與時間，並且也可以在日曆上新增並管理。
2. 使用者可以在報表頁面看到所有訂閱制服務的資訊，並可以依照剩餘天數排序。
3. 使用者可以在報表頁面看到所有訂閱制服務的總費用。
4. 資料存在 in-memory 資料庫，不需要實作登入功能。
5. 提供 README.md 檔案，說明如何啟動網站。
6. 程式碼必須包含適當的註解。
7. 程式碼必須包含適當的單元測試。
8. 使用 Bootstrap 5 來設計網站。
9. 使用 dependency injection 來管理服務。
```

### 20250407
``` markdown
請使用 .NET 8 建立一個 ASP.NET Core 網站，使用 MVC 樣板
這個網站會幫助使用者來追蹤每一個訂閱制服務的費用以及繳費日期，並提供報表頁面供檢視，報表內容至少要包含：每個訂閱制服務的名稱、費用、繳費日期、剩餘天數。

網站的功能需求如下：
- 使用者可以新增、修改、刪除訂閱制服務，每個訂閱制服務至少要有名稱、費用、繳費日期。
  - 使用者可以透過日曆方式來查看每個月的訂閱制服務費用與時間，並且也可以在日曆上新增並管理。
- 使用者可以在報表頁面看到所有訂閱制服務的資訊，並可以依照剩餘天數排序。
- 使用者可以在報表頁面看到所有訂閱制服務的總費用。
  - 使用者可以根據訂閱制服務類別來顯示圓餅圖。

系統的網站架構與設計應該要有:
- 所有 .NET 專案請使用 .NET 8
- 新增專案時請使用對應的指令來建立專案
  - 使用 .NET CLI 指令來建立專案
- 新增專案時請使用 MVC 樣板，不要使用 Minimal API。
- 使用 Dependency Injection 來進行相依性注入。
- 資料存在 in-memory 資料庫，不需要實作登入功能。
  - 資料庫初始化的時候自動新增10筆範例資料
  - 使用 Entity Framework Core 來存取資料庫。
  - 使用對應 .NET 8 的 Entity Framework Core 套件最新版。
  - Model 要使用 Fluent API 來設定。
  - 不要在 Model 上放置驗證邏輯，而是在 Service 上放置。
  - 使用 Migration 來進行資料庫遷移。
- 提供 README.md 檔案，說明如何啟動網站。
- 程式碼必須包含適當的註解。
  - 所有的 Class 與 Method 一定要有註解
  - 所有的變數與參數一定要有註解
  - 適當地為所有程式碼加入註解
  - 所有的註解請使用英文
- 程式碼必須包含適當的單元測試。
  - 測試框架要使用 MSTest
  - 僅測試邏輯相關內容
    - 不要針對 Controller 進行測試
    - 不要針對 View 進行測試
    - 不要針對資料庫進行測試
  - 測試要確保符合 3A 原則，每個步驟都不可省略
  - 每一個測試都是一個獨立 method
  - 使用 Fluent Assertions 來進行斷言
- 使用 Bootstrap 5 來設計網站。
  - 使用 fontawesome 來設計網站。
- 使用 CDN 來載入 Bootstrap 5 與 fontawesome 以及其他前端套件。
  - Use cloudflare CDN as CDN source

其餘要求如下:
- 說明前後端將要使用的套件以及對應版本
- 執行前，請在 https://github.com/lettucebo/2025040701 建立 issue 來管理執行計畫與追蹤進度
  - 每次個步驟執行時
    - 請更新 github issue 對應進度與狀態
      - 更新時，順便加入 comment 說明進度
    - git commit 並 push 到 github
- 所有輸出與回應請務必使用英文
- 原始碼請放在 src 資料夾中

先不要執行，給我一個執行計畫
```

## 股票即時價格
### 20250304
``` markdown
幫我使用 Python 建立一個 WEB 用來顯示及時股價。

我們可以使用 twstock 來取得台灣股票的股價資訊。

這個 WEB 需要有以下功能：
1. 使用者可以輸入股票代碼，然後按下「查詢」按鈕，就可以顯示該股票的即時股價。
    - 並且要顯示今日的股價波動圖
2. 提供 README.md 檔案，說明如何啟動網站。
    - 要包含如何執行各種不同的測試。
3. 提供 Dockerfile，讓我們可以透過 Docker 啟動網站。
3. 程式碼必須包含適當的註解。
4. 程式碼必須包含適當的單元測試。
    - 測試的框架請使用 pytest。
    - 測試的內容至少要包含對 twstock 的測試。
5. 使用 Bootstrap 5 來設計網站。
6. 使用 Python 3.13 以上的版本。
7. 使用 Flask 來建立 WEB。
8. 程式碼必須包含適當的整合測試。
9. 程式碼必須包含適當的例外處理。
10. 程式碼必須包含適當的自動化 UI 測試。
```

### 20250326
``` markdown
幫我使用 Python 建立一個 WEB 用來做股票分析工具。
 
這個 WEB 需要有以下功能：
- 輸入股票代碼，顯示該股票的即時股價。
  - 顯示該股票的歷史股價走勢圖。
 
系統的網站架構與設計應該要有:
- 要使用 python 的虛擬環境來開發。
  - 虛擬環境的名稱為 stockenv。
- 使用 Python 3.13 以上的版本。
- 使用 Flask 作為後端框架。
- 提供 README.md 檔案，說明如何啟動網站等常見 README 內容。
  - 要包含如何執行各種不同的測試。
- 程式碼必須包含適當的註解。
  - 所有的 Class 與 Method 一定要有註解
  - 所有的變數與參數一定要有註解
  - 適當地為所有程式碼加入註解
- 程式碼必須包含適當的單元測試。
  - 測試框架要使用 pytest
- 使用 Bootstrap 5 來設計網站。
  - 使用 fontawesome 來設計網站。
  - 畫面要華麗一點
  - 必要時可以加入一些動畫效果。
  - 畫面的整體色調要繽紛一點
  - 要有 Dark Mode 與 Light Mode 的切換功能。
- 使用 jsdeliver CDN 來載入 Bootstrap 5 與 fontawesome。
 
其他要求:
- Update relevant documentation in /docs when modifying features
- Keep README.md in sync with new capabilities
- Maintain changelog entries in CHANGELOG.md
- Write implementation plan to .md files in /docs/implementation
  - Naming convention: <date>-<feature-name>.md
- Each step should be committed separately to preserve history.
 
先不要執行，請先產出一個執行計畫與檔案文件目錄結構給我看
```

### 20250327
``` markdown
幫我使用 Python 建立一個 WEB 用來做股票及時價格。
 
這個 WEB 需要有以下功能：
- 輸入股票代碼，顯示該股票的即時股價。
  - 顯示該股票的歷史股價走勢圖
- 顯示該股票的即時新聞
  - 顯示該股票的即時財報
 
系統的網站架構與設計應該要有:
- OS 是 Windows 11
- 使用 twstock 來取得股價相關資訊。
  - 請參考以下網址
    - https://twstock.readthedocs.io/zh-tw/latest/
    - https://github.com/mlouielu/twstock
- 要使用 python 的虛擬環境來開發。
  - 虛擬環境的名稱為 stock27env。
- 使用 Python 3.13 以上的版本。
- 使用 Flask 作為後端框架。
- 提供 README.md 檔案，說明如何啟動網站等常見 README 內容。
  - 要包含如何執行各種不同的測試。
- 程式碼必須包含適當的註解。
  - 所有的 Class 與 Method 一定要有註解
  - 所有的變數與參數一定要有註解
  - 適當地為所有程式碼加入註解
- 程式碼必須包含適當的單元測試。
  - 測試框架要使用 pytest
  - 測試只針對邏輯部分，前端不需要測試。
- 使用 Bootstrap 5 來設計網站。
  - 使用 fontawesome 來提供 ICON。
  - 畫面要華麗
  - 必要時可以加入一些動畫效果。
  - 畫面的整體色調要彩色繽紛
  - 要有 Dark Mode 與 Light Mode 的切換功能。
- 使用 jsdeliver CDN 來載入 Bootstrap 5 與 fontawesome。
  - 若有任何其他前段需要的 library 也要使用 jsdeliver CDN。
 
其他要求:
- Update relevant documentation in /docs when modifying features
- Keep README.md in sync with new capabilities
- Maintain changelog entries in CHANGELOG.md
- Write implementation plan to .md files in /docs/implementation
  - Naming convention: <date>-<feature-name>.md
- Each step should be committed separately to preserve history.
- 請使用繁體中文
 
先不要執行，請先產出一個執行計畫與檔案文件目錄結構給我看，以及提供預計要使用那些 API 來取得即時新聞與財報資訊，並提供這些API的前置作業說明，例如: 需要註冊帳號、取得 API KEY 等等。
```

### 20250417
``` markdown
幫我使用 JAVA 建立一個 WEB 用來做股票及時價格。
 
這個 WEB 需要有以下功能：
- 輸入股票代碼，顯示該股票的即時股價。
  - 顯示該股票的歷史股價走勢圖
 
系統的網站架構與設計應該要有:
- 不要使用任何資料庫。
- OS 是 Windows 11
- 使用 Spring Initializr 指令建立專案骨架
- 使用 spring-boot 作為後端框架。
- 股票僅針對美國股票 (免費版限制)
  - 使用 finnhub api 來取得即時股價等資訊。
- API KEY 等機密資訊要使用環境變數來取得。
  - 使用 dotenv 套件來讀取環境變數。
- 提供 README.md 檔案，說明如何啟動網站等常見 README 內容。
  - 要包含如何執行各種不同的測試。
  - 要包含使用哪個套件來取得即時股價等資訊。
    - 要包含如何取得對應 API KEY 的說明。
- 程式碼必須包含適當的註解。
  - 所有的 Class 與 Method 一定要有註解
  - 所有的變數與參數一定要有註解
  - 適當地為所有程式碼加入註解
- 程式碼必須包含適當的單元測試。
  - 測試框架要使用 junit
  - 測試只針對邏輯部分；控制器、服務層、前端不需要測試。
- 使用 Bootstrap 5 來設計網站。
  - 使用 fontawesome 來提供 ICON。
  - 畫面要華麗
  - 必要時可以加入許多動畫效果。
  - 畫面的整體色調要色彩繽紛
  - 要有 Dark Mode 與 Light Mode 的切換功能。
- 使用 jsdeliver CDN 來載入 Bootstrap 5 與 fontawesome。
  - 若有任何其他前端需要的 library 也要使用 jsdeliver CDN。
 
其他要求:
- Update relevant documentation in /docs when modifying features
- Keep README.md in sync with new capabilities
- Maintain changelog entries in CHANGELOG.md
- Write implementation plan to .md files in /docs/implementation
  - Naming convention: <date>-<feature-name>.md
- Each step should be git committed separately to preserve history.
- 所有回復請務必使用繁體中文
- 分階段實作，先產生計畫，並在 Github: https://github.com/lettucebo/Demo0417 上面新增 issue 來追蹤進度，每完成一步驟就更新 issue 並加入 comment 補充說明
  - When creating issue, remember to add corresponding labels
  - note: remember always update the issue and add issue comment everytime
 
先不要執行，請先產出一個執行計畫與檔案文件目錄結構給我看，以及提供預計要使用那些 API 來取得股票即時報價資訊，並提供這些API的前置作業說明，例如: 需要註冊帳號、取得 API KEY、API KEY 的使用限制等等。
```

### 20250729
``` markdown
幫我使用 Python 建立一個 WEB 用來做股票及時價格的顯示。
 
這個 WEB 需要有以下功能：
- 輸入股票代碼，顯示該股票的即時股價。
- 提供股票價格的更新頻率選項。
  - 5秒
  - 10秒
  - 30秒
  - 1分鐘
  - 刷新時要顯示通知與更新時間。
 
系統的網站架構與設計應該要有:
- OS 是 Windows 11
- 使用 twstock 來取得股價相關資訊。
  - 請參考以下網址
    - https://twstock.readthedocs.io/zh-tw/latest/
    - https://github.com/mlouielu/twstock
- 要使用 python 的虛擬環境來開發。
  - 虛擬環境的名稱為 stock29env。
- 使用 Python 3.13 以上的版本。
- 使用 Flask 作為後端框架。
- 提供 README.md 檔案，說明如何啟動網站等常見 README 內容。
  - 要包含如何執行各種不同的測試。
- 程式碼必須包含適當的註解。
  - 所有的 Class 與 Method 一定要有註解
  - 所有的變數與參數一定要有註解
  - 適當地為所有程式碼加入註解
- 程式碼必須包含適當的單元測試。
  - 測試框架要使用 pytest
  - 測試只針對邏輯部分，前端與API不需要測試。
 
網站UI設計與功能需求：
- 使用 Bootstrap 5 來設計網站。
  - 使用 fontawesome 來提供 ICON。
  - 畫面要華麗
  - 必要時可以加入一些動畫效果。
  - 畫面的整體色調要色彩繽紛
  - 要有 Dark Mode 與 Light Mode 的切換功能。
- 使用 jsdeliver CDN 來載入 Bootstrap 5 與 fontawesome。
  - 若有任何其他前段需要的 library 也要使用 jsdeliver CDN。
 
其他要求:
- Update relevant documentation in /docs when modifying features
- Keep README.md in sync with new capabilities
- Maintain changelog entries in CHANGELOG.md
- Write implementation plan to .md files in /docs/implementation
  - Naming convention: <date>-<feature-name>.md
  - 每個功能的實作計畫都要有詳細的步驟說明。
  - 每個步驟都要有明確的目標與預期結果。
  - 每個步驟都要有明確的開始與結束時間。
  - 每個步驟都要有明確的驗收標準。
  - 每個步驟都要有明確的測試計畫。
- 每個實作要有紀錄目前的進度與狀態，來確保若突然中斷，可以讓 Agent 知道目前的進度並繼續往下進行。
- 所有的回應與輸出請使用繁體中文。
 
- 上面所有的實作計畫與進度要同步到 github 上的 Issues。
- 每個步驟都要分開進行 GIT 提交，以保留歷史紀錄。
  - 並定期同步到 github 上。
- Github 連結: https://github.com/lettucebo/20250729-AZ2007
 
先不要執行，請先產出一個執行計畫與檔案文件目錄結構給我看，以及提供預計要使用那些 API 來取得即時新聞與財報資訊，並提供這些API的前置作業說明，例如: 需要註冊帳號、取得 API KEY 等等。
```

## 樂透集資系統
### 20250305
``` markdown
幫我建立一個使用 .NET 9 C# 的 ASP.NET Core MVC 網站。網站的功能主要是針對不同的使用者可以在這個系統上紀錄台灣大樂透的集資。台灣大樂透的規則可以參考這個連結: https://www.taiwanlottery.com/lotto/info/lotto649

這個系統的功能需求如下：
1. 使用者不需要登入
2. 使用者可以在首頁看到目前所有使用者的集資紀錄
3. 使用者可以在首頁看到目前所有使用者的集資總金額
4. 提供一個頁面來輸入使用者的集資紀錄，包含使用者名稱、集資金額、期別號碼
5. 提供一個頁面來編輯使用者的集資紀錄
6. 根據使用者的集資紀錄，計算出每個使用者的集資總金額
7. 根據集資的總金額，隨機得出多組樂透號碼來用光總金額，每組號碼要不一樣
8. 提供一頁面跟，讓使用者可以輸入中獎總金額，並且自動根據集資金額的比例分配獎金給每個使用者
9. 資料存在 in-memory 資料庫，不需要實作登入功能。
10. 提供 README.md 檔案，說明如何啟動網站。
11. 程式碼必須包含適當的註解。
12. 程式碼必須包含適當的單元測試。
    - 測試框架要使用 MSTest
    - 使用 Moq 來 mock 服務
13. 使用 Bootstrap 5 來設計網站。
14. 使用 dependency injection 來管理服務。
15. 程式碼必須包含適當的整合測試。
16. 程式碼必須包含適當的自動化 UI 測試。
    - 使用 Playwright 來進行自動化 UI 測試
17. 程式碼必須包含適當的例外處理。
18. 要有一個頁面可以顯示最新一期目前大樂透的總獎金
```

## 系統錯誤收集與分析系統
### 20250307
``` markdown
幫我建立一個使用 .NET 9 C# 的 ASP.NET Core MVC 網站。

網站的目的為: 應用系統錯誤收集、彙整與分析
系統的使用者功能應該要有:
- 錯誤管理頁面
  - 顯示所有錯誤訊息
  - 顯示特定錯誤訊息
  - 新增錯誤訊息
  - 刪除錯誤訊息
  - 修改錯誤訊息
- AI分析頁面
  - 選擇特定的錯誤，使用 Azure OpenAI 來分析錯誤訊息
    - 若之前已經分析過了，直接從資料庫讀取 AI 分析過的結果
    - 若之前沒有分析過，則使用 Azure OpenAI 來分析，並寫入資料庫供日後直接讀取
    - 顯示分析結果
    - 顯示分析圖表

系統的網站架構與設計應該要有:
- 資料存在 in-memory 資料庫，不需要實作登入功能。
  - 資料庫初始化的時候自動新增10筆範例資料
- 提供 README.md 檔案，說明如何啟動網站。
- 程式碼必須包含適當的註解。
  - 所有的 Class 與 Method 一定要有註解
- 程式碼必須包含適當的單元測試。
  - 測試框架要使用 MSTest
- 使用 Bootstrap 5 來設計網站。
```

## Youtube 資訊查詢系統
### 20250310
``` markdown
請幫我使用 ptyhon 建立一個 WEB 應用。
此 WEB 功能為：貼上 Youtube URL, 然後可以取得：觀看次數、喜歡數、留言數、上傳時間、標題、簡介等資訊。
系統的使用者功能應該要有:
- 首頁
  - 使用者可以輸入 Youtube 的 URL，然後按下「查詢」按鈕，就可以顯示該 Youtube 的資訊。
  - 並且要顯示該 Youtube 的觀看次數、喜歡數、留言數、上傳時間、標題、簡介等資訊。
- 提供一個頁面來顯示該 Youtube 的字幕檔。
- 提供一個頁面來顯示該 Youtube 的留言。

系統的網站架構與設計應該要有:
- 使用 Flask 作為後端框架。
- 提供 README.md 檔案，說明如何啟動網站等常見 README 內容。
- 程式碼必須包含適當的註解。
  - 所有的 Class 與 Method 一定要有註解
  - 所有的變數與參數一定要有註解
  - 適當地為所有程式碼加入註解
- 程式碼必須包含適當的單元測試。
  - 測試框架要使用 pytest
- 使用 Bootstrap 5 來設計網站。
  - 使用 fontawesome 來設計網站。
- 使用 CDN 來載入 Bootstrap 5 與 fontawesome。
```

## 午餐吃甚麼
### 20250311
``` markdown
幫我建立一個 JAVA WEB 專案，網站的主要功能為午餐吃甚麼。

網站的使用者功能有:
- 首頁
  - 使用者可以輸入地址
  - 使用者可以選擇餐廳類型
    - Ex: 中式、日式、義式、韓式、美式
  - 提供一個選項可以設定搜尋範圍
    - Ex: 500公尺、1公里、2公里
        - 預設值為500公尺
  - 透過使用者輸入的地址
    - 顯示附近的餐廳
      - 使用列表方式顯示餐廳
        - 餐廳名稱
        - 餐廳類型
        - 餐廳地址
        - 餐廳的評價
        - Google Map 顯示餐廳位置
        - 餐廳的電話
        - 使用者可以透過點擊"隨機"按鈕隨機選擇餐廳
      - 提供一個頁面透過地圖顯示所有有搜尋到的餐廳
        - 使用 Google Map API 顯示地圖
        - 顯示所有搜尋到的餐廳位置
        - 點擊餐廳位置顯示餐廳資訊

系統的網站架構與設計應該要有:
- 使用 spring-boot 作為後端框架。
- 提供 README.md 檔案，說明如何啟動網站等常見 README 內容。
- 程式碼必須包含適當的註解。
  - 所有的 Class 與 Method 一定要有註解
  - 所有的變數與參數一定要有註解
  - 適當地為所有程式碼加入註解
- 使用 Bootstrap 5 來設計網站。
  - 使用 fontawesome 來設計網站。
- 使用 jsdeliver CDN 來載入 Bootstrap 5 與 fontawesome。
- 程式碼必須包含適當的單元測試。
  - 測試框架要使用 junit

先不要執行，請先產出一個執行計畫供我查看與檔案文件目錄結構給我看
```

## 下午茶訂餐系統
### 20250424
``` markdown
幫我使用 Python 建立一個 WEB 用來做下午茶訂餐統計系統。
 
這個 WEB 需要有以下功能：
1. 不需要使用者登入
2. 首頁: 使用者可以建立下午茶訂餐的表單
  - 使用者可以選擇訂餐的餐點
3. 訂餐表單頁面: 使用者可以在這個頁面選擇不同的餐點 +1 的按鈕來增加訂餐的數量
  - 每次 +1 都需要輸入使用者的姓名
4. 統計頁面: 使用者可以看到所有人的訂餐統計
  - 統計頁面會顯示每個餐點的訂餐數量
  - 統計頁面會顯示每個餐點的訂餐人數
  - 統計頁面會顯示每個餐點的訂餐人數的姓名
5. 使用者可以在統計頁面下載訂餐的統計報表，使用 CSV 格式

系統的網站架構與設計應該要有:
- OS 是 Windows 11- 要使用 python 的虛擬環境來開發。
  - 虛擬環境的名稱為 .eatenv
- 使用 Python 3.11.9 以上的版本。
- 使用 Flask 作為後端框架。
- 資料儲存在 SQLite 資料庫中。
- 提供 README.md 檔案，說明如何啟動網站等常見 README 內容。
  - 要包含如何執行各種不同的測試。
- 程式碼必須包含適當的註解。
  - 所有的 Class 與 Method 一定要有註解
  - 所有的變數與參數一定要有註解
  - 適當地為所有程式碼加入註解
  - 符合 Clean Code 的原則
- 程式碼必須包含適當的單元測試。
  - 測試框架要使用 pytest
  - 測試只針對邏輯部分，前端、服務層、Controller 不需要測試。
- 使用 Bootstrap 5 來設計網站。
  - 使用 fontawesome 來提供 ICON。
  - 畫面要華麗
  - 可以加入一些動畫效果。
  - 畫面的整體色調要很色彩繽紛
- 使用 cloudflare CDN 來載入 Bootstrap 5 與 fontawesome。
  - 若有任何其他前段需要的 library 也要使用 jsdeliver CDN。

其他要求:
- Update relevant documentation in /docs when modifying features
- Keep README.md in sync with new capabilities
- Maintain changelog entries in CHANGELOG.md
- 所有回復請務必使用繁體中文
- 分階段實作，先產生計畫，並在 Github: https://github.com/lettucebo/20250422-AZ2007/ 上面新增 issue 來追蹤進度，每完成一步驟就加入 comment 補充說明
  - When creating issue, remember to add corresponding labels
  - note: remember always update the issue and add issue comment everytime when completing a task/step

先不要執行，請先產出一個執行計畫與檔案文件目錄結構給我看
```

## 機票票價查詢
### 20250313
``` markdown
幫我建立一個 JAVA WEB 專案，網站的主要功能為: 機票票價查詢。

網站的使用者功能有:
- 首頁
  - 使用者可以輸入出發地、目的地、出發日期、回程日期、乘客人數等資訊。
    - 使用者可以選擇單程或來回票。
    - 使用者可以選擇經濟艙或商務艙。
    - 使用者按下查詢後
      - 系統會顯示符合條件的機票資訊。
      - 系統會顯示符合條件的機票價格。
      - 系統會顯示符合條件的機票航空公司。
      - 系統會顯示機票票價的歷史資料。

系統的網站架構與設計應該要有:
- 不要使用任何資料庫。
- 使用 Amadeus Flight Offers Search API
  - 請在 README 裡面加入如何取得 Amadeus Flight Offers Search API KEY 與設定的詳細說明
- 使用 spring-boot 作為後端框架。
- 提供 README.md 檔案，說明如何啟動網站等常見 README 內容。
- 程式碼必須包含適當的註解。
  - 所有的 Class 與 Method 一定要有註解
  - 所有的變數與參數一定要有註解
  - 適當地為所有程式碼加入註解
- 使用 Bootstrap 5 來設計網站。
  - 使用 fontawesome 來設計網站。
- 使用 jsdeliver CDN 來載入 Bootstrap 5 與 fontawesome。
- 程式碼必須包含適當的單元測試。
  - 測試框架要使用 junit

先不要執行，請先產出一個執行計畫與檔案文件目錄結構給我看
```

## 新聞輿情分析
### 20250422
``` markdown
幫我使用 Python 撰寫一個 WEB 應用，網站的主要目的是熱點新聞加上輿情分析。

# 這個網站的功能包括：
1. 爬取熱點新聞
2. 輿情分析
3. 顯示新聞和輿情分析結果
4. 首頁可以選擇新聞類別
   - 國內新聞
   - 國際新聞
   - 體育新聞
   - 娛樂新聞
5. 選擇完類別後，顯示該類別的熱點新聞
6. 點擊新聞標題後，顯示該新聞的詳細內容和輿情分析結果

# 系統的網站架構與設計應該要有
- OS 是 Windows 11
- 要使用 python 的虛擬環境來開發。
  - 虛擬環境的名稱為 newsenv。
- 使用 Python 3.11.9 的版本。
- 使用 Flask 作為後端框架。
- 提供 README.md 檔案，說明如何啟動網站等常見 README 內容。
  - 要包含如何執行各種不同的測試的指令與說明。
- 程式碼必須包含適當的註解。
  - 所有的 Class 與 Method 一定要有註解
  - 所有的變數與參數一定要有註解
  - 適當地為所有程式碼加入註解
- 程式碼必須包含適當的單元測試。
  - 測試框架要使用 pytest
  - 測試只針對邏輯部分，前端與服務層不需要測試。
- 使用 Bootstrap 5 來設計網站。
  - 使用 fontawesome 來提供 ICON。
  - 畫面要華麗
  - 必要時可以加入一些動畫效果。
  - 畫面的整體色調要繽紛
- 使用 jsdeliver CDN 來載入 Bootstrap 5 與 fontawesome。
  
其他要求:
- Update relevant documentation in /docs when modifying features
- Keep README.md in sync with new capabilities
- Maintain changelog entries in CHANGELOG.md
- 分階段實作，先產生計畫，並在 https://github.com/lettucebo/20250422-AZ2007 上面新增 issue 來追蹤進度，每完成一步驟就加入 comment 說明目前狀態與進度等等
  - When creating issue, remember to add corresponding labels
  - note: remember always update the issue and add issue comment everytime
- 請使用簡體中文來進行後續與所有的回覆

先不要執行，請先產出一個執行計畫與檔案文件目錄結構給我看，以及提供預計要使用那些 API 來取得新聞資訊，並提供這些API的前置作業說明，例如: 需要註冊帳號、取得 API KEY 等等。
```
