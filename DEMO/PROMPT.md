# Version Compatibility Prompt（版本範圍檢查器）
完整可複製的 Prompt 在 [`VersionCompatibility\PROMPTS.md`](VersionCompatibility/PROMPTS.md)，此處只列入口，不複製內容。

| 階段 | JavaScript 主線 | 語言中立 |
|---|---|---|
| 環境檢查與起始專案 | P00-Preflight、P00 | L00 |
| Code Completion／教學 BUG／修 BUG | P01、P01B、P02 | L01、L01B、L02 |
| refactor／單元測試 | P03、P04 | L03、L04 |
| Context7 查詢／semver 接替 | P05-Setup、P05、P06 | L05、L06 |
| HTTP API／網站／瀏覽器驗證 | P07、P08、P09-Setup、P09 | L07、L08、L09-Setup、L09 |
| Skill | P10 | L10 |
| 講師課前快照與腳本 | P11 | — |

- 專案規則、環境與命令：[`VersionCompatibility\README.md`](VersionCompatibility/README.md)
- 講師逐段腳本、快照恢復點與備案：[`VersionCompatibility\RUNBOOK.md`](VersionCompatibility/RUNBOOK.md)
- 只判定版本範圍，不保證 API 相容或升級安全。

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