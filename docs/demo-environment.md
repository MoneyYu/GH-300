# GH-300 示範環境指南

> 講師專用。本 repo 的 `DEMO\SampleApps\` 每個資料夾都是**獨立教學快照**；不可同步、
> 正規化、交叉搬移，或為了讓所有範例通過而改動其中一份。
> 課程講解與投影片範圍請搭配 [teaching-guide.md](teaching-guide.md)。

## 範圍與先備條件

本課不需要 Azure demo environment 或 Terraform。進行 IDE／CLI 示範前：

1. 使用已指派 GitHub Copilot seat 的 GitHub 帳戶登入受支援 IDE。
2. 遵循組織對 public-code matching、content exclusions 與 MCP 的政策；不要為了完成練習繞過政策。
3. 若要示範最新第三方套件／SDK，請先參閱 `DEMO\Context7 API Key 申請教學.md`，並將 API key 保存在
   環境變數，勿放入 repo。
4. 執行前先選定單一目標快照；本文件不表示所有 `APL2007M*` 都應在同一環境合併運作。

## Demo prompt 素材

| 檔案 | 用途 | 合適授課模組 |
| --- | --- | --- |
| `DEMO\DEMO.md` | 歷史 Agent demo prompt 目錄：訂閱管理、股票價格、樂透集資、錯誤分析、YouTube 查詢、午餐、下午茶、機票與新聞輿情等情境 | M2（Chat / agent prompt）、M3（需求拆解與 SDLC） |
| `DEMO\PROMPT.md` | BMI Calculator：建立、Clean Code 重構、安全問題盤點與單元測試；另有 WPF Async Downloader 的解釋、流程圖、README、視覺化 prompt | M2（prompt engineering）、M4（單元測試） |
| `DEMO\Context7 API Key 申請教學.md` | Context7 API key 與 MCP 設定的歷史教學 | M2／補充 MCP；先用目前官方文件重新查核步驟 |

`DEMO\DEMO.md` 是 prompt 歷史目錄，而不是可直接建置的單一應用程式。不要把它當成實作起點。

## SampleApps 對照

資料夾名稱沿用早期 `APL2007` 課程的歷史命名；下表依**教學用途**對應 GH-300，而不是將名稱當成 GH-300 模組編號。

| 用途 | 快照 | 建議示範 | 對應 GH-300 |
| --- | --- | --- | --- |
| Code completion / inline Chat 對照 | `APL2007M3SalesReport-CodeLogicChallenge`、`-InlineChat`、`-NewCodeChallenge`、`-SalesOrders` | 同一 SalesReport 題材下比較完成、對話與需求導向變更 | M2、M3 |
| Python 生成與測試 | `APL2007M3Python` | 檢視 `src\main.py`、請 Copilot 提出測試案例，再比對 `tests\test_main.py` | M3、M4 |
| 最小 C# 測試範例 | `APL2007M4PrimeService`、`APL2007M4PrimeService-UnitTests` | 從 `IsPrime` 行為寫邊界值測試；使用既有 xUnit 專案 | M4 |
| C# 類別與測試 | `APL2007M4BankAccount`、`APL2007M4SalesReport` | 討論需求、前置條件與可測試性 | M3、M4 |
| 測試品質／可靠性／安全差異 | `APL2007M5BankAccount`、`-Reliability`、`-Security`、`APL2007M5SalesReport` | 選一個明確議題做 review；不可跨資料夾複製修正 | M1（驗證／風險）、M4 |
| 舊型專案的 context 差異 | `APL2007M2Sample1`、`APL2007M2Sample2` | 僅在需要示範不同技術背景時使用；為 `net6.0`／IoT 歷史素材 | 補充，不列為主線 |

## 已存在的驗證指令

只使用下列 repo 已記錄的最小指令。這些指令的目的，是確認選定快照的當前教學狀態，**不是**逼迫
不完整的訓練基準線通過。執行前不要更新依賴或修改 source。

### SalesReport Code Logic Challenge

```powershell
dotnet build 'DEMO\SampleApps\APL2007M3SalesReport-CodeLogicChallenge\APL2007M3SalesReport.csproj'
```

預期：驗證這份獨立 `net8.0` console snapshot 是否可建置；成功時可用於 M2/M3 的小型程式碼理解與修改 demo。
本次文件更新時的實測結果：建置成功，`0 Warning(s)`、`0 Error(s)`。

### PrimeService unit tests

```powershell
dotnet test 'DEMO\SampleApps\APL2007M4PrimeService-UnitTests\PrimeService.UnitTests\PrimeService.UnitTests.csproj'
```

```powershell
dotnet test 'DEMO\SampleApps\APL2007M4PrimeService-UnitTests\PrimeService.UnitTests\PrimeService.UnitTests.csproj' --filter 'FullyQualifiedName~PrimeServiceTests.IsPrime_InputIs2_ReturnTrue' --nologo
```

預期：可用來示範完整 suite 與單一行為測試。`Numbers` library 是 `netstandard2.0`，測試專案是 `net8.0`；
保留這個組合，不為了統一 framework 而重構。
本次文件更新時的實測結果：完整 suite `12/12` 通過；以上方 filter 執行的
`PrimeServiceTests.IsPrime_InputIs2_ReturnTrue` 也為 `1/1` 通過。

### Python sample

```powershell
Set-Location 'DEMO\SampleApps\APL2007M3Python'
$env:PYTHONPATH = 'src'
python -m pytest tests\test_main.py
```

```powershell
python -m pytest tests\test_main.py -k test_add_numbers
```

預期：此 snapshot 鎖定 `pytest==6.2.5`，且 source／test 不一致是刻意的教學基準線。
若目前環境沒有既有 pytest，記錄為環境未準備，不要只為驗證而安裝或升級依賴。
本次文件更新時的實測結果：目前 Python 環境回報 `No module named pytest`；因此未執行測試，
也未安裝套件。

## 建議 demo 流程

1. **M1**：用 `PROMPT.md` 的 BMI 範例說明「先說出驗收條件，再請 Copilot 產生草稿」。
2. **M2**：選一個 SalesReport 快照，對照 inline completion、Chat 與 agent 能取得的 context；讀取 diff，
   不直接接受。
3. **M3**：選 JavaScript 或 Python 主線，不要兩條都做完；透過 `DEMO.md` 的真實需求 prompt 示範拆解。
4. **M4**：從 PrimeService 的 `2`、非質數、負數等例子，先由學員說出測試矩陣，再評估 Copilot 草稿。
5. **補充（若有時間）**：使用 `M5BankAccount-Security` 談安全 review；只閱讀／討論，不變更快照。

## 開課前檢查

- [ ] 對當日使用的單一快照執行對應指令，記下實際結果。
- [ ] 確認 IDE 內 Copilot、Chat 與必要 extension 可用。
- [ ] 若課程會用到 Codespaces，先開啟官方 Lab repo 並確認 template 可建立。
- [ ] 不將 `PPT\`、暫存檔、憑證、API key、`.venv` 或套件快取納入 commit。
- [ ] 若示範涉及 MCP，先以 [GitHub MCP Server setup](https://docs.github.com/en/copilot/how-tos/provide-context/use-mcp-in-your-ide/set-up-the-github-mcp-server?tool=vscode)
  確認伺服器來源、資料範圍與權限。

## 參考

- [GH-300 attendee reference](../README.md)
- [Trainer teaching guide](teaching-guide.md)
- [GitHub Copilot developer exercises](https://github.com/MicrosoftLearning/mslearn-github-copilot-dev)
