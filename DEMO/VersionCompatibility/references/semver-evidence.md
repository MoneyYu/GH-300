# semver 查詢與來源證據（Task 2）

## 結論先行

- **沒有任何 Context7 MCP 呼叫發生。** 本次執行環境的擴充探索回報「No extensions discovered.」，沒有 Context7 工具可用；`.vscode\mcp.json` 只有非機密設定，未做 OAuth 登入或信任核准。
- 下列內容全部來自「官方文件備案」：直接讀取 node-semver 官方 README（tag `v7.8.5`），**不是** MCP 查詢結果，也不可在課堂上說成 MCP 結果。
- 單元測試不證明 MCP 連線；MCP 成功證據須由講師本人完成 OAuth／信任後，以實際工具呼叫另行保存（呼叫的工具名、library 與回傳摘要）。

## 官方文件備案來源

| 來源 | URL | 本次是否實際讀取 |
|---|---|---|
| node-semver README（v7.8.5） | https://raw.githubusercontent.com/npm/node-semver/v7.8.5/README.md | 是，2026-10-14 |
| VS Code MCP 設定 | https://code.visualstudio.com/docs/agent-customization/mcp-servers | 是，2026-10-14（確認 `.vscode/mcp.json` 使用頂層 `servers`；文件另指出新設定偏好可攜的 `.mcp.json`，本專案依 P05-Setup 使用 `.vscode\mcp.json`） |
| SemVer 2.0.0 規格 | https://semver.org/ | 否；僅作為固定案例預期值的規格依據（§10 build metadata 不參與 precedence、§11 precedence） |

套件取得：`pnpm view semver@7.8.5 version license --registry=https://packagefeedproxy.microsoft.io/npm/` → `version = '7.8.5'`、`license = 'ISC'`。

## README 必要摘錄（v7.8.5，原文）

- 版本：「A leading `"="` or `"v"` character is stripped off and ignored.」→ 套件的寬鬆輸入需由本專案白名單先擋（實測 `semver.valid('v1.2.3')` 非 null）。
- 範圍：「Comparators can be joined by whitespace … A range is composed of one or more comparator sets, joined by `||`.」→ `validRange` 會接受複合與 OR。
- X-Range：「A partial version range is treated as an X-Range … `""` (empty string) := `*` := `>=0.0.0`」；`1`、`1.2`、`1.x`、`*` 皆合法 → 單靠 `validRange` 會放行縮寫與萬用字元。
- Hyphen：`1.2.3 - 2.3.4` := `>=1.2.3 <=2.3.4`。
- Tilde：`~1.2.3` := `>=1.2.3 <1.3.0-0`；`~0.2.3` := `>=0.2.3 <0.3.0-0`。
- Caret：`^1.2.3` := `>=1.2.3 <2.0.0-0`；`^0.2.3` := `>=0.2.3 <0.3.0-0`；`^0.0.3` := `>=0.0.3 <0.0.4-0`。
- Pre-release：「If a version has a prerelease tag … it will only be allowed to satisfy comparator sets if at least one comparator with the same `[major, minor, patch]` tuple also has a prerelease tag.」`includePrerelease` 可關閉此行為 → 本專案不開。
- 嚴格 pre-release：數字識別碼不得有前導零（`1.2.3-00` 無效）；build 識別碼可含前導零。
- Options：`loose`、`includePrerelease` 預設皆為 false；本專案不傳 options，也不用 `coerce`。

## 本專案採用的政策（由程式與測試強制）

- version：完整 SemVer 2.0.0（`x.y.z`，可含 `-pre-release` 與 `+build`）；拒絕 `v` 前綴、`=` 前綴、縮寫、前導零、超過 `Number.MAX_SAFE_INTEGER` 的數字片段（含數字 pre-release 識別碼）。
- range：單一條件 `[=|>|>=|<|<=|^|~]` 加完整 SemVer，運算子與版本間不得有空白；無運算子等於 `=`。拒絕 `*`、`x`、`1.x`、`1.2`、`^1.2`、hyphen、AND、OR、`||`、空範圍、複合範圍與 `v` 前綴。
- build metadata 比較時被忽略（測試 `1.2.3+build.5` 滿足 `=1.2.3+build.1`）。
- pre-release 版本預設不滿足沒有同 tuple pre-release 的範圍（例：`1.2.4-beta.1` 不滿足 `^1.2.3`、`>=1.0.0`；`1.2.3-alpha` 不滿足 `<1.2.3`），這是 npm 範圍語意，不同於 semver.org 純 precedence。
- 驗證順序：先白名單，再 `semver.valid` / `semver.validRange` 作第二層檢查（例如套件的 256 字元上限），最後 `semver.satisfies`。
