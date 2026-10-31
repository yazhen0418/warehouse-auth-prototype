require('dotenv').config();
const { Pool } = require('pg'); // 引入 PostgreSQL 搬運工 (Pool 模式)

// 資料庫連線配置(落實不寫死原則)，從 .env抓取資料庫資訊
const pool = new Pool ({
    user: process.env.DB_USER,          // 帳號
    host: process.env.DB_HOST,          // 主機
    database: process.env.DB_DATABASE,  // 資料庫名
    password: process.env.DB_PASSWORD,  // 密碼
    port: process.env.DB_PORT,          // 埠號
});
// 測試連線用 (連上會印出時間)
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ 資料庫連線失敗！', err);
    } else {
        console.log('✅ 資料庫連線成功！現在時間:', res.rows[0].now);
    }
});

module.exports = pool;