---
name: version-compatibility-check
description: 'Use when the user asks whether a version satisfies a version constraint (for example "does 1.10.0 satisfy >=1.9.0", ^ or ~ ranges) or wants to re-run the GH-300 Version Compatibility demo regression. Runs only the existing CLI and pnpm test in DEMO\VersionCompatibility and reports version, range, satisfies (true/false) or the input error with command evidence. Checks range membership only; it is not an API-compatibility or upgrade-safety check. Do not use to scan, install or upgrade dependencies of other projects.'
---

# 版本範圍檢查（GH-300 Version Compatibility DEMO）

只判定「某個版本是否落在某個版本範圍內」，並重跑本 DEMO 的回歸測試。**這不是升級安全檢查**：`satisfies` 為 true 不代表 API 相容、行為不變或可以安全升級。

## 邊界（先讀）

- 只在儲存庫內的 `DEMO\VersionCompatibility` 操作；只執行下列兩種既有命令：`node src\cli.js <version> <range>` 與 `pnpm test`。
- 不安裝、不升級、不移除任何套件；`node_modules` 不存在時回報並請使用者自行準備，不自行 `pnpm install`。
- 不讀取、掃描或回傳其他專案的 `package.json`、lockfile 或相依清單，也不傳送到任何外部服務；只處理使用者在對話中明確給的 version 與 range。
- 不修改檔案、不 commit／push、不新增功能；不執行 `pnpm run test:browser`、`pnpm start` 或其他命令。

## 步驟

1. **定位專案**：確認 `DEMO\VersionCompatibility\package.json` 存在且 `name` 為 `version-compatibility-demo`。找不到就回報並停止，不去其他目錄猜測。
2. **取得輸入**：version 與 range 必須由使用者提供；缺少就詢問，不自行編造。將兩者當成獨立引數傳給 CLI，不拼接成其他命令。
3. **執行 CLI**（工作目錄為 `DEMO\VersionCompatibility`）：

   ```powershell
   node src\cli.js "1.10.0" ">=1.9.0"
   ```

   - 規則：完整 SemVer 版本（含 pre-release／metadata）；range 為單一 `=`、`>`、`>=`、`<`、`<=`、`^`、`~` 加完整版本，無符號視為 `=`。縮寫、`v` 前綴、`AND`、`OR`、萬用字元一律是輸入錯誤。
   - stdout `版本 … 符合範圍 …`、exit 0 → `satisfies = true`；`不符合範圍`、exit 0 → `satisfies = false`（有效的計算結果，不是錯誤）。
   - stderr `輸入錯誤 [INVALID_VERSION]` 或 `[INVALID_RANGE]`、exit 1 → 輸入錯誤，**不得**當成 false；引數個數錯誤會顯示用法、exit 1。
4. **執行回歸**（同一工作目錄）：

   ```powershell
   pnpm test
   ```

   以輸出中的 `tests`／`pass`／`fail` 與 exit code 為準。失敗時列出失敗的測試名稱，不改程式讓它通過；缺少 `node_modules` 或 pnpm 時回報實際錯誤並停止。
5. **回報**，每一項都附實際命令與關鍵輸出，未執行的項目寫「未執行」：

   | 項目 | 內容 |
   |---|---|
   | version／range | 使用者輸入（trim 後） |
   | 結果 | `satisfies: true`／`false`，或 `輸入錯誤` 與 error code |
   | CLI 證據 | 命令、輸出、exit code |
   | 回歸證據 | `pnpm test` 的 tests／pass／fail、exit code |
   | 限制 | 只判定版本範圍；不保證 API 相容或升級安全；未檢查任何實際相依或其他專案 |

## 範例

使用者：「檢查 1.10.0 是否符合 >=1.9.0」→ 執行步驟 3 的命令，預期 `版本 1.10.0 符合範圍 >=1.9.0`、exit 0（`satisfies: true`）；再執行 `pnpm test` 並依步驟 5 回報。
