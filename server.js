require('dotenv').config(); //先讀取環境變數
const express = require("express");
const path = require('path'); // 引入路徑模組
const cors = require('cors'); // 跨來源通行證（讓不同裝置/網頁可呼叫 API）
const cookieParser = require('cookie-parser'); // 記得 npm install cookie-parser
const app = express();

// 1. 設定展示間 (EJS) 與 JSON解析、中間建設定
app.set('view engine', 'ejs'); // 設定模板引擎 (告訴 Express：模板引擎用 EJS)
app.set('views', path.join(__dirname, 'views')); // 指定 EJS 檔案所在資料夾 public/

// 2. 中間件設定
app.use(cors()); // 允許各種裝置跨網連線 （手機/不同IP/不同來源呼叫 API 時比較不會被擋）
app.use(express.json()); // 解析中間建(JSON Body Parser)
app.use(express.urlencoded({extended: true})) // 讓伺服器看得懂表單送出的資料(Login Form用)
app.use(express.static(path.join(__dirname, 'public'))); // 開始Public資料夾，CSS & JS 才會讀到
app.use(cookieParser()); // 啟動Cookie功能

// 3. 掛載路由 (把服務生叫過來)
app.use('/', require('./routes/pageRoutes'));
app.use('/auth', require('./routes/authRoutes'));

// 4. 啟動，優先聽從系統指令，沒指令再用 3000
const PORT = process.env.PORT || 3000;
// 啟動監聽 ( 0.0.0.0 是手機能連進來的關鍵 )
app.listen(PORT, '0.0.0.0', () =>{
    console.log(`Server running on port ${PORT}`)

    // 伺服器啟動時順便測試資料庫連線
    require('./config/dbConnection');
});
