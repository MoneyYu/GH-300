# Context7 API Key 申請教學

這份教學將引導你如何申請並取得 **Context7** 的 API Key。Context7 是由 Upstash 推出的一項服務，專門為 AI 編碼助手（如 Cursor、Claude Code、Windsurf 等）提供最新、具備版本資訊的開發文件與程式碼範例。

透過 API Key，你可以獲得更高的請求速率限制（Rate Limits），這對於頻繁開發的工程師來說非常重要。

---

## 什麼是 Context7？
Context7 是一個基於 **MCP (Model Context Protocol)** 的服務。它的核心作用是解決 AI 訓練資料過時的問題。當你在 Prompt 中加入 `use context7` 時，它會即時抓取目標套件（如 Next.js 15、React 19 等）的最新官方文件給 AI 參考，避免 AI 產生錯誤或過時的 API 調用。

---

## Context7 API Key 申請步驟

### 第一步：進入 Context7 官方網站
1. 開啟瀏覽器，造訪 [context7.com](https://context7.com/)。
2. 在首頁右上角點擊 **"Sign In"** 或 **"Get Started"**。

### 第二步：登入或註冊帳號
Context7 屬於 **Upstash** 生態系，因此通常會引導你透過第三方帳號快速登入：
1. 選擇 **Continue with GitHub** 或 **Continue with Google**。
2. 完成授權後，系統會自動為你建立一個免費帳號。

### 第三步：進入控制面板 (Dashboard)
1. 登入成功後，系統會引導你進入 [context7.com/dashboard](https://context7.com/dashboard)。
2. 在 Dashboard 頁面中，你會看到一個專門管理 API 金鑰的區塊。

### 第四步：產生 API Key
1. 如果頁面中尚未自動顯示金鑰，請點擊 **"Create API Key"** 或 **"Generate New Key"**。
2. 系統會顯示一串以 `ctx7sk-` 開頭的字串，這就是你的 **API Key**。
3. **重要提醒：** 請務必立即複製並妥善保存這個金鑰。基於安全考量，金鑰通常只會在建立時完整顯示一次。

---

## 如何使用 API Key？

申請到金鑰後，你可以透過以下幾種常見方式將其整合到你的開發流程中：

### 1. 在 Cursor 編輯器中使用 (MCP 模式)
如果你使用 Cursor，可以將 Context7 設定為全域 MCP Server：
1. 打開 Cursor 的 **Settings** -> **Cursor Settings**。
2. 找到 **MCP** 選項，點擊 **"Add New Global MCP Server"**。
3. **Name:** `Context7`
4. **Type:** `command`
5. **Command:** ```bash
   npx @upstash/context7-mcp
   ```
6. **Environment Variables:** 加入一個變數：
   - Key: `CONTEXT7_API_KEY`
   - Value: `你的_API_KEY`

### 2. 在終端機 (CLI) 中設定
如果你習慣使用 CLI 工具，可以透過以下指令進行設定：
```bash
npx ctx7 setup
```
執行後，系統會提示你輸入剛申請到的 API Key。

### 3. 在環境變數中設定
如果你是在開發自己的 AI Agent 或 SDK，可以將其加入 `.env` 檔案中：
```env
CONTEXT7_API_KEY=ctx7sk-xxxxxxxxxxxx
```

---

## 常見問題 (FAQ)

| 問題 | 回答 |
| :--- | :--- |
| **一定要申請 API Key 嗎？** | 不一定。匿名用戶也可以使用，但請求次數（Rate Limit）會受到嚴格限制，申請免費 API Key 後配額會顯著提升。 |
| **Context7 是免費的嗎？** | 目前 Context7 提供相當慷慨的免費額度，適合個人開發者使用。 |
| **金鑰外流了怎麼辦？** | 請立刻回到 Dashboard 點擊 **"Revoke"** 或 **"Delete"** 刪除該金鑰，並重新生成一個新的。 |

> **提示：** > 只要在你的 Prompt 結尾加上 `use context7`，AI 就會自動調用這個 API 來搜尋最新的文件。例如：「幫我寫一個 Next.js 的 middleware 處理 JWT 驗證，use context7」。