# 版本範圍檢查器：00-starter

GH-300 教學起始專案。這個工具只判定「版本是否落在版本範圍內」，不保證實際 API 相容，也不代表可以安全升級套件。

- 環境：Node.js 24、pnpm 10.33.2、ES modules。
- 目前 `src\cli.js` 只有說明註解，尚未實作版本判定。
- 下一步：以 Code Completion 依註解完成單一 function（見上層 `PROMPTS.md` 的 P01）。
- 此階段沒有第三方套件、網頁或測試。
