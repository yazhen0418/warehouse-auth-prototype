[English](README.md) | **繁體中文**

# 工廠入貨掃描系統（原型）

工廠內部使用的入貨掃描系統原型。作業員以手機或平板登入後掃描條碼入貨，系統會限制每個帳號只能在已綁定的裝置上使用。

> **專案狀態：原型，開發暫停中。** 登入、註冊與裝置綁定已完成並測試通過；掃描入貨的後端 API 尚未完成（需求變更後暫停）。

## 使用技術

| 分類 | 技術 |
|---|---|
| 後端 | Node.js、Express 5（MVC 架構） |
| 前端 | EJS 伺服器端渲染（SSR）、HTML / CSS、原生 JavaScript（fetch） |
| 資料庫 | PostgreSQL（`pg` 連線池、參數化查詢） |
| 安全 | 隨機 Salt + HMAC-SHA512 密碼雜湊、httpOnly Cookie、裝置 UUID 綁定 |
| 部署測試 | Nginx 反向代理、PM2 / NSSM（Windows 服務） |

## 功能

- **員工註冊 / 登入**：以員工編號為帳號，密碼以隨機 Salt + HMAC-SHA512 雜湊後存入資料庫，不存明碼
- **裝置綁定**：前端為每台裝置產生 UUID，首次登入時綁定帳號，之後換裝置登入會被拒絕
- **登入保護**：未登入存取首頁會被導回登入頁，登出後清除 Cookie
- **裝置資訊偵測**：以 Client Hints + UAParser.js 判斷作業系統與裝置型號
- **條碼掃描介面**：輸入框自動聚焦，掃描槍送出 Enter 後以 fetch 送出資料（後端 API 開發中）

## 專案結構

```
├── server.js            # 進入點：中介軟體、路由掛載、啟動伺服器
├── config/              # 資料庫連線（從 .env 讀取設定）
├── routes/              # 路由
├── controllers/         # 商業邏輯（登入、註冊、頁面）
├── models/              # SQL 存取
├── views/               # EJS 頁面（登入、註冊、首頁）
├── public/              # CSS 與前端 JavaScript
└── schema.sql           # 資料表結構（users、inventory_logs）
```

## 如何執行

1. 安裝 [Node.js](https://nodejs.org/) 與 PostgreSQL
2. 建立名為 `node_project_demo2` 的資料庫，並執行 `schema.sql` 建立資料表
3. 複製 `.env.example` 為 `.env`，填入資料庫密碼（其他設定可依需要修改）
4. 安裝套件並啟動：

   ```bash
   npm install
   npm run dev
   ```

5. 開啟 `http://localhost:3000`
   - 同一個區網內的手機可用 `http://<電腦的 IP>:3000` 連線（需開放防火牆 3000 port）

## 待完成

- [ ] 掃描入貨 API（`POST /api/inventory`）與寫入 `inventory_logs`
- [ ] 登入檢查改為共用 middleware
- [ ] 錯誤訊息改為 JSON 回應，前端統一顯示