# 網頁樣式與無障礙契約

此原生 HTML 頁面使用 Clawpilot 的 light／dark 設計 token，不使用 React 或 CSS framework。修改介面時維持以下契約。

## 主題

`index.html` 的第一段 script 必須在其他 JavaScript 之前讀取 `scoutTheme` 查詢參數，否則依 `prefers-color-scheme` 選擇 `light`／`dark`，並設定 `<html data-theme="…">`。樣式使用 `web/styles.css` 中完整的 `--cp-*` token；元件顏色只能引用 token，不另寫 hex、rgb 或 hsl 顏色。

使用以下 theme script；正式 server 會加上 per-response CSP nonce，維持此 script 是頁面的第一段 JavaScript：

```html
<script>
  (() => {
    const param = new URLSearchParams(window.location.search).get("scoutTheme");
    const theme =
      param || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  })();
</script>
```

完整 tokens：

```css
:root {
  color-scheme: light;
  --cp-bg: #f7f4ef;
  --cp-bg-elevated: #fcfbf8;
  --cp-surface: #ffffff;
  --cp-surface-soft: #f5f5f5;
  --cp-border: #dedede;
  --cp-border-strong: #919191;
  --cp-text: #242424;
  --cp-text-muted: #5c5c5c;
  --cp-text-soft: #6f6f6f;
  --cp-accent: #b11f4b;
  --cp-accent-hover: #9a1a41;
  --cp-accent-soft: rgba(177, 31, 75, 0.08);
  --cp-accent-fg: #ffffff;
  --cp-success: #16a34a;
  --cp-danger: #dc2626;
  --cp-warning: #f59e0b;
  --cp-link: #0078d4;
  --cp-shadow: 0 18px 48px rgba(0, 0, 0, 0.12);
  --cp-overlay: rgba(255, 255, 255, 0.8);
  --cp-panel: rgba(255, 255, 255, 0.86);
  --cp-panel-strong: rgba(255, 255, 255, 0.96);
  --cp-sheen: rgba(255, 255, 255, 0.55);
  --cp-highlight: rgba(177, 31, 75, 0.12);
}
html[data-theme="dark"] {
  color-scheme: dark;
  --cp-bg: #3d3b3a;
  --cp-bg-elevated: #343231;
  --cp-surface: #292929;
  --cp-surface-soft: #2e2e2e;
  --cp-border: #474747;
  --cp-border-strong: #5f5f5f;
  --cp-text: #dedede;
  --cp-text-muted: #919191;
  --cp-text-soft: #b0b0b0;
  --cp-accent: #fd8ea1;
  --cp-accent-hover: #fb7b91;
  --cp-accent-soft: rgba(253, 142, 161, 0.14);
  --cp-accent-fg: #1a1a1a;
  --cp-success: #4ade80;
  --cp-danger: #f87171;
  --cp-warning: #fbbf24;
  --cp-link: #4da6ff;
  --cp-shadow: 0 18px 48px rgba(0, 0, 0, 0.32);
  --cp-overlay: rgba(41, 41, 41, 0.88);
  --cp-panel: rgba(41, 41, 41, 0.72);
  --cp-panel-strong: rgba(41, 41, 41, 0.96);
  --cp-sheen: rgba(255, 255, 255, 0.04);
  --cp-highlight: rgba(253, 142, 161, 0.12);
}
```

字型使用 `"Segoe UI", Aptos, Calibri, -apple-system, BlinkMacSystemFont, sans-serif`；程式碼或設備代碼使用 `Consolas, "Courier New", Courier, monospace`。圓角以 `0.625rem` 為主，卡片使用 `16px`，陰影保持輕微。

## 時間顯示

- API、資料庫與期限判定都使用 UTC 瞬間；顯示格式化不得修改期限、逾期狀態或排序。
- 以 `Intl.DateTimeFormat().resolvedOptions().timeZone` 顯示瀏覽器提供的 IANA 時區名稱。
- 每一筆借出、到期、歸還及更新時間都將自己的 UTC 瞬間傳給 `formatInstantInTimeZone`；不可拿目前 offset 套用到歷史資料。
- 格式使用 `timeZoneName: 'longOffset'`，讓每筆時間都包含實際 offset。DST 前後的 offset 可能不同。
- 若瀏覽器沒有 IANA 時區或無法格式化，顯示明確訊息，不猜測時區或默認 +08:00。

## 操作與無障礙

- 表單控制項必須有可見 `<label>`；狀態與錯誤除顏色外也要顯示文字。
- 動態更新的操作結果使用 `role="status"` 與 `aria-live="polite"`；鍵盤焦點有可見樣式。
- 所有使用者或資料庫值透過 `textContent`、`createTextNode` 及 DOM 節點插入，不用 `innerHTML` 或內嵌事件屬性。
- 更新狀態時保留未完成的表單輸入；pending 操作停用相關控制項，失敗訊息須可恢復。
- 逾期／狀態篩選只改變呈現，不得隱藏 server 端衝突檢查。對已被其他分頁借用的舊畫面送出請求時，顯示 `409`，並保留輸入以便重試。

## 驗收

以 label／role 定位互動元素。至少核對 light 與 dark 主題、表單錯誤、可借／借用中／逾期文字、兩個瀏覽器時區下同一 UTC 瞬間及 DST 前後 offset。不得只以 CSS class 或色彩作為狀態驗收。
