// 引入 Node.js 內建加密庫(不需要npm install)
const crypto = require(`crypto`);
const userModel = require(`../models/userModel`);
// 負責算數學的函式
// 1. 產生隨機鹽巴(Salt)
function generateSalt(length = 16) {
    // 產生 16 bytes 的隨機亂碼，並轉成 16 進位字串
    return crypto.randomBytes(length).toString('hex');
}
// 2. 啟動(HMAC-SHA512 加密)
function sha512Encrypt(password, salt) {
    // 使用 hmac 演算法，把 password 跟 salt 攪再一起
    const hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    return hash.digest('hex'); // 回傳 128 個字的亂碼
}
// 控制器邏輯
// 註冊功能
const register = async(req, res) => {
    try {
        const {employee_id, username, password, confirm_password, uuid } = req.body;
        // 1. 防呆: 檢查兩次密碼是否一樣
        if (password !== confirm_password) {
            return res.send("<script>alert('❌ 兩次密碼不一致'); window.history.back();</script>");
        }
        // 2. 檢查密碼是否已經存在
        const userExists = await userModel.findUserEmployeeId(employee_id);
        if (userExists) {
            return res.send("<script>alert('❌ 此員工編號已有人使用'); window.history.back();</script>");
        }
        // 3. 加密三部曲 SHA-512  
        // (A)產鹽
        const salt = generateSalt(16);
        // (B)加密: 用上面那罐鹽去算密碼
        const hashedPassword = sha512Encrypt(password,salt);
        // (C)打包: 把「鹽」跟「結果」黏在一起 (中間用 $ 隔開)
        // 格式範例: a1b2c3d4$e9901...
        const finalPasswordToStore = salt + '$' +hashedPassword;
        
        // 4. 存入資料庫
        await userModel.createUser(
            employee_id,
            username,
            finalPasswordToStore, // 存打包好的這串
            uuid
        );
        console.log(`✅ 新員工註冊成功: ${employee_id}`);
        res.send("<script>alert('✅ 註冊成功！請重新登入'); window.location='/auth/login';</script>");
    } catch (error) {
        console.error("註冊失敗:", error);
        res.status(500).send("伺服器錯誤");
    }   
};

// 登入功能
const login = async (req, res) => {
    try {
        const { employee_id, password, uuid } = req.body;
        // 1. 先去資料庫找人
        const user = await userModel.findUserEmployeeId(employee_id);

        if (!user) {
            return res.send("<script>alert('❌ 找不到此員工編號'); window.location='/auth/login';</script>");
        }

        // 2. 解密驗證 (Verify)
        // 資料庫拿出來的是: salt$hash
        const storedPassword = user.password_hash;

        // (A) 切開字串: 把鹽跟雜湊值分開
        const parts = storedPassword.split('$');

        // 防呆: 如果資料庫格式壞了(避免程式當機)
        if (parts.length !==2) {
            return res.send("<script>alert('系統錯誤：密碼格式異常'); window.location='/auth/login';</script>");
        }

        const salt = parts[0]; // 拿到當初的那罐鹽
        const originalHash = parts[1]; // 拿到當初的正確答案

        // (B) 重算一次: 用同一冠鹽，把現在輸入的密碼再算一次
        const newHash = sha512Encrypt(password, salt);

        // (C) 比對: 看看算出來的跟資料庫存的一不一樣
        if (newHash !== originalHash) {
            return res.send("<script>alert('❌ 密碼錯誤'); window.location='/auth/login';</script>");
        }

        // 3. 處理裝置綁定 (UUID)
        // 如果這個人已經綁定過裝置，且跟現在這台不一樣擋住
        if (user.allowed_uuid && user.allowed_uuid !== uuid) {
            return res.send("<script>alert('⛔ 此帳號未授權在此裝置登入'); window.location='/auth/login';</script>");
        }
        // 如果是新帳號沒綁過，現在自動綁定
        if (!user.allowed_uuid && uuid) {
            await userModel.bindAllowedUuidIfEmpty(user.id, uuid);
            console.log('📱 裝置綁定成功: ${uuid}');
        }

        // 4. 發證件 (Cookie)
        // (A) 發 ID (給程式看)
        res.cookie('user_id', user.id, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 
        });

        // (B) 🔥 新增：發名字 (給畫面顯示用)
        // 注意：這裡 user.username 要看你資料庫欄位是不是叫 username
        // 為了怕中文亂碼，我們用 encodeURIComponent 包起來
        res.cookie('user_name', encodeURIComponent(user.username), {
            httpOnly: true, // 只有後端能讀，比較安全
            maxAge: 24 * 60 * 60 * 1000 
        });

        res.redirect('/');
    } catch (error) {
        console.error("登入失敗", error);
        res.status(500).send("伺服器錯誤");
    }
};
// 登出功能
const logout = (req,res) => {
    res.clearCookie('user_id');
    res.redirect('/auth/login');
};

module.exports = { register, login, logout };