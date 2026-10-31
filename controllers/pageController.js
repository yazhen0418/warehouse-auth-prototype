// controllers/pageController.js

exports.showIndex = (req, res) => {
    try {
        console.log("🔍 正在讀取首頁..."); // 幫你在終端機印出來
        
        // 1. 檢查有沒有 ID 證件
        if (req.cookies && req.cookies.user_id) {
            
            let name = "員工"; // 預設名字

            // 2. 嘗試讀取名字 Cookie
            if (req.cookies.user_name) {
                try {
                    // 這裡最容易錯！如果 cookie 格式怪怪的，解碼會報錯
                    name = decodeURIComponent(req.cookies.user_name);
                    console.log("✅ 解碼名字成功:", name);
                } catch (e) {
                    console.error("⚠️ 名字解碼失敗，使用預設值:", e);
                }
            }

            // 3. 傳給 EJS
            // 🔥 重點：這裡傳的是物件 { user: { name: ... } }
            res.render('index', { user: { name: name } });
            
        } else {
            console.log("⛔ 沒有 Cookie，踢回登入頁");
            res.redirect('/auth/login');
        }
    } catch (error) {
        // 🔥 這裡會抓出為什麼會 Nginx Error 的真正原因！
        console.error("🔥 首頁渲染發生嚴重錯誤:", error);
        res.status(500).send("後端發生錯誤，請看終端機");
    }
};