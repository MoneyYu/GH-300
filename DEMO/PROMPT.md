# Equipment Lending Prompt（團隊設備借用）
GH-300 新主線使用有狀態的設備借用系統；完整可複製的 JavaScript 與語言中立 Prompt 在 [`EquipmentLending\PROMPTS.md`](EquipmentLending/PROMPTS.md)。

| 階段 | JavaScript 主線 | 語言中立 |
|---|---|---|
| 環境檢查與需求 | P00-Preflight、P00 | L00 |
| Inline Completion／故障注入／Agent 修復 | P01、P01B、P02 | L01、L01B、L02 |
| refactor／回歸測試／時區 | P03、P04 | L03、L04 |
| Context7 文件查詢／SQLite | P05-Setup、P05、P06 | L05、L06 |
| HTTP API／原生網頁／瀏覽器驗收 | P07、P08、P09-Setup、P09 | L07、L08、L09 |
| Read-only Skill／講師準備 | P10、P11 | L10 |

- 專案、環境、CLI 命令與安全邊界：[`EquipmentLending\README.md`](EquipmentLending/README.md)
- 快照、逐段流程、備案與實測限制：[`EquipmentLending\RUNBOOK.md`](EquipmentLending/RUNBOOK.md)

## 歷史備案：Version Compatibility
舊版本範圍檢查器保留於 [`VersionCompatibility\README.md`](VersionCompatibility/README.md)，其完整 prompts 為 [`VersionCompatibility\PROMPTS.md`](VersionCompatibility/PROMPTS.md)。它只判定 SemVer 範圍，不保證 API 相容或升級安全。

# BMI Calculator Prompt
## Create a BMI Calculator
``` markdown
Write a console application, it's a BMI calculator, that takes the following inputs:
- weight in pounds
- height in meters

Calculate the BMI and get the BMI category.
Then display the result in a user-friendly format.
```

## Refactor the Code
``` markdown
@workspace /new 幫我將這個 BMI 計算器的程式碼重構，並且要符合 Clean Code 的原則
```

``` markdown
請幫我找出所有潛在的安全問題，並一一列出解法與程式碼；每一個修正的程式碼片段也請單獨列出讓我可以選擇要套用那些解法
```

## Unit Test Prompt
``` markdown
@workspace /new 幫我建立單元測試

針對: poundsToKg, calculateBMI, getBMICategory 來進行單元測試，將這三個function 的單元測試分別放在不同的 file 裡；其他的 function 不要建立單元測試

NodeJS 請使用 Jest 來進行單元測試
Python 請使用 PyTest 來進行單元測試
CSharp 請使用 MSTest 來進行單元測試
Java 請使用 JUnit 來進行單元測試

請盡可能的產生多的測試案例，並且要包含邊界條件的測試案例

每個單元測試要獨立的 function

請確保所有的單元測試都要符合 3A 原則，不可省略
```

# WPF Async Downloader
## Explanation Prompt
``` markdown
@workspace 幫我使用簡體中文詳細說明這個專案的用途、設計與架構
```

### Flowchart Prompt
``` markdown
請幫我使用 mermaid 劃出流程圖，請用英文，並確保 mermaid 語法正確
請幫我使用 mermaid 劃出這個專案的架構圖，請用英文，並確保 mermaid 語法正確
```

### README Prompt
``` markdown
@workspace /new 幫我將這個專案的說明與架構圖新增到 README.md，並且要再加上 README 的常見內容
```

## Beautify Prompt
``` markdown
#codebase #codebase 請幫我美化 WPF 應用程式，讓它看起來更好看，並且要符合 WPF 的設計規範，若有變更 xaml 的 name，則 .cs 也要記得更新；若在 .cs 有加入一些新的 control，xaml 也記得要加入，並確保名稱同步。

請使用這個 framework: https://github.com/MaterialDesignInXAML/MaterialDesignInXamlToolkit

#codebase 幫我美化這個 WPF 應用程式，請使用簡體中文回復
```

``` markdown
#codebase 請幫我美化 WPF 應用程式，使用 MaterialDesignInXamlToolkit 來美化
```