// controllers/deviceController.js
const deviceModel = require('../models/deviceModel'); // 引入剛剛寫的 Model

// A. 顯示首頁的邏輯
exports.showPage = (req, res) => {
    res.render('index'); // 對應 views/index.ejs
};

// B. 處理入貨 API 的邏輯
exports.saveDevice = async (req, res) => {
    // 1. 【拆包裹】從前端拿出所有資料 
    const { uuid, barcode, os_info, os_ver } = req.body;

    // 2. 【防呆】檢查有沒有條碼
    if (!barcode) {
        return res.status(400).json({ success: false, message: "沒收到條碼！" });
    }

    try {
        // 3. 【叫 Model 做事】存入資料庫
        const newRecord = await deviceModel.addRecord(uuid, barcode, os_info, os_ver);

        console.log(`🎉 成功入貨！條碼: ${barcode}, 裝置: ${os_ver}`);
        
        // 4. 【回報前端】
        res.json({ success: true, message: "資料已同步", data: newRecord });

    } catch (err) {
        console.error("🔥 存檔失敗:", err);
        res.status(500).json({ success: false, message: "寫入失敗" });
    }
};