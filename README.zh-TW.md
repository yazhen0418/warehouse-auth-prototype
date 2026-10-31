[English](README.md) | **繁體中文**

# 倉儲系統登入與裝置授權原型

源自實際工廠管理需求的倉儲系統原型，實作員工註冊、登入，以及帳號與瀏覽器 UUID 的綁定與比對。原先規劃的條碼掃描入貨功能因需求變更暫停開發。

> **專案狀態：原型，暫停開發中。**
> 登入驗證仍有待改善，目前不適合正式上線。

## 使用技術

| 分類 | 技術 |
| --- | --- |
| 後端 | JavaScript、Node.js、Express 5（Routes / Controllers / Models 分層） |
| 頁面呈現 | EJS 伺服器端渲染、HTML、CSS |
| 瀏覽器端 | 原生 JavaScript、localStorage |
| 資料庫 | PostgreSQL、pg 連線池、參數化查詢 |
| 密碼處理 | 隨機 Salt 搭配 HMAC-SHA512 |

## 功能

- **員工註冊與登入**：以員工編號為帳號，使用隨機 Salt 搭配 HMAC-SHA512 處理密碼，以 `salt$hash` 格式儲存，不保存明碼。
- **瀏覽器 UUID 綁定與比對**：瀏覽器產生 UUID 並存於 localStorage，註冊時與帳號綁定，登入時比對；尚未綁定的帳號可於登入時補綁。UUID 可被修改或清除，不代表實體裝置身分。
- **基本登入狀態處理**：首頁目前依登入 Cookie 是否存在決定顯示頁面或導回登入頁，登出時清除登入識別 Cookie；完整的登入狀態驗證仍待改善。
- **裝置資訊偵測**：透過 Client Hints 與 UAParser.js 推測作業系統與裝置資訊，部分顯示邏輯仍待修正。

## 專案結構

```text
├── server.js        # Express 設定、路由掛載與伺服器啟動
├── config/          # PostgreSQL 連線設定
├── routes/          # 路由
├── controllers/     # 註冊、登入與頁面邏輯
├── models/          # 資料庫查詢
├── middleware/      # 中介層（規劃中）
├── views/           # EJS 頁面模板
├── public/          # CSS 與瀏覽器端 JavaScript
└── schema.sql       # 資料表結構
```

## 如何執行

### 1. 準備環境與資料庫

安裝 Node.js 18 以上版本與 PostgreSQL。

建立開發用資料庫，例如 `node_project_demo2`，並在該資料庫執行 `schema.sql`。

### 2. 設定環境變數

複製 `.env.example` 為 `.env`，填入本機 PostgreSQL 設定。

請勿將包含真實帳密的 `.env` 提交至 Git。

### 3. 安裝套件並啟動

在包含 `package.json` 的專案資料夾中執行：

```bash
npm install
npm run dev
```

### 4. 開啟頁面

開啟 `http://localhost:3000/auth/login`，註冊開發帳號後，使用同一個瀏覽器登入。

## 後續規劃

- 完善登入狀態驗證，改用伺服器端 Session，並建立共用登入中介層
- 改用專門處理密碼的雜湊演算法，例如 Argon2id
- 補齊後端欄位驗證與 UUID 綁定結果檢查
- 完成條碼掃描介面與入貨 API，寫入 `inventory_logs`