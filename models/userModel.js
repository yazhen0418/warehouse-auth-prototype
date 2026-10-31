const pool = require('../config/dbConnection'); //拿到通往倉庫(資料庫)的鑰匙
module.exports = {
    // 功能一: 找人(登入時用)
    // 會給一個email，去資料庫找
    findUserEmployeeId: async (employee_id) => {
        // 這是SQL指令，跟pgAdmin寫的一樣
        // $1 是佔位符，代表後面變數陣列的第一個值(為了資安)
        const query = 'SELECT * FROM users WHERE employee_id = $1';
        const result = await pool.query(query, [employee_id]);
        return result.rows[0];
    },

    // 功能二: 加入(註冊時用)
    // 會給一堆資料，塞進資料庫
    createUser: async (employee_id, username, passwordHash, allowed_uuid = null) => {
        // 括號裡的欄位，必須跟資料庫蓋的相同
        // 尤其是 password_hash 和 allowed_uuid
        const sql = `
            INSERT INTO users (employee_id, username , password_hash, allowed_uuid)
            VALUES ($1, $2, $3, $4)
            RETURNING *;     
        `;
        // RETURNING *:新增完後，順便把剛產生的那筆資料 (含id) 回傳給Node.js程式後端，後端才能拿到新員工id，回傳給前端顯示註冊成功，編號是5
        const result = await pool.query(sql, [employee_id, username, passwordHash, allowed_uuid]);
        return result.rows[0];
    },
    // 功能三: 補綁定 UUID (工廠實戰常用！)
    // 如果員工帳號早就建好了，但還沒綁手機，第一次登入時用這個功能把手機綁上去。
    bindAllowedUuidIfEmpty: async (userId, uuid) => {
        const sql = `
            UPDATE users
            SET allowed_uuid = $2
            WHERE id = $1 AND allowed_uuid IS NULL
            RETURNING *;
        `;
        // WHERE allowed_uuid IS NULL 的意思是：只有「原本沒綁手機」的人才能補綁
        // 如果原本已經有綁了，就不準改 (防止員工亂換手機)
        const result = await pool.query(sql, [userId, uuid]);
        return result.rows[0]; 
    },
    // 功能四: 透過ID找人(未來擴充功能會用到)
    findUserById: async (id) => {
        const sql = "SELECT * FROM users WHERE id = $1";
        const result = await pool.query(sql, [id]);
        return result.rows[0];
    }
};