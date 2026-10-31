const pool = require("../config/dbConnection");
// 功能: 新增一筆入貨記錄
exports.addRecord = async (uuid, barcode, os_info, os_ver) => {
    // 修正: 補上 barcode 和 os_info 欄位 ，不然妳掃描的條碼都沒存進去
    const sql = `
        INSERT INTO mobile_records (uuid, barcode, os_info, os_ver, last_login) 
        VALUES ($1, $2, $3, $4, NOW()) 
        RETURNING *;
    `
    // 執行SQL
    const result = await pool.query(sql, [uuid, barcode, os_info, os_ver]);
    return result.rows[0];
}