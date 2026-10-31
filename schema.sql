-- 1. <防呆機制>先拆除舊的表 (順序很重要：先拆紀錄，再拆員工)
-- 這樣是為了確保乾淨重建，不會報錯
DROP TABLE IF EXISTS inventory_logs CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. 建立「員工資料表」 (員工編號當帳號)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,            -- 資料庫流水號 (給程式看的，如 1, 2, 3 關聯用)
    employee_id VARCHAR(50) UNIQUE NOT NULL, /* 登入帳號 */
    username VARCHAR(50) NOT NULL,    -- 姓名
    password_hash VARCHAR(255) NOT NULL,   -- 密碼是雜湊(不是明碼)
    
    -- 👇 這裡就是妳要的「綁定手機」欄位！
    -- 如果這裡填了 "DEV-1234"，那這個人就只能用那支手機登入(可為 NULL 代表尚未綁定)
    allowed_uuid VARCHAR(100) UNIQUE,  -- 綁手機 --
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 3. 建立「入貨紀錄表」 (誰、何時、掃了什麼)
CREATE TABLE inventory_logs (
    id SERIAL PRIMARY KEY,
    -- 紀錄是哪個員工掃的 (關聯到 users 表的 id)
    user_id INTEGER NOT NULL REFERENCES users(id), --【外鍵】記錄是誰掃的 (連結到 users 表)，必須登入才能掃
	uuid VARCHAR(100) NOT NULL,                 -- 掃描當下是用哪台手機
    barcode VARCHAR(100) NOT NULL,     -- 掃到的條碼
    scanned_at TIMESTAMP NOT NULL DEFAULT NOW(), -- 掃描時間

	-- 🔥 修改：補回這兩個欄位，因為妳的 app.js 有傳這兩個字串過來
    login_time VARCHAR(50),          -- 平板上的登入時間
    scan_time VARCHAR(50),           -- 平板上的掃描時間
	
	-- 以下是稽核欄位：記錄用，不做限制用
    os_info VARCHAR(100),
    device_model VARCHAR(100),
    ip VARCHAR(64)
    
);
-- 4. 🔥新增：建立索引 (為了讓以後查詢速度飛快)
-- 幫「條碼」建目錄
CREATE INDEX idx_logs_barcode ON inventory_logs(barcode);
-- 幫「掃描時間」建目錄 (老闆常會查"今天的紀錄")
CREATE INDEX idx_logs_date ON inventory_logs(scanned_at);
-- 幫「員工」建目錄 (查"某人掃了什麼")
CREATE INDEX idx_logs_user ON inventory_logs(user_id);
CREATE INDEX idx_logs_uuid ON inventory_logs(uuid);