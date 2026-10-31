//const { json } = require("express");

// public/js/auth.js
document.addEventListener("DOMContentLoaded", async function() {
// 1. 產生/獲取 UUID (保持不變)
    function getOrCreateUUID() {
        let uuid = localStorage.getItem('device_uuid');
        if (!uuid) {
            if (typeof crypto !== 'undefined' && crypto.randomUUID) {
                uuid = 'DEV-' + crypto.randomUUID().toUpperCase();
            } else {
                uuid = 'DEV-' + Date.now() + '-' + Math.random().toString(36).substring(2, 10).toUpperCase();
            }
            localStorage.setItem('device_uuid', uuid);
            console.log("🆕 新裝置，已生成 UUID:", uuid);
        }
        return uuid;
    }

    // 2. 🔥【業界最強偵測】使用 Client Hints + UAParser + 手動修正，分析裝置型號
    async function getFullDeviceSpecs() {
        let os = "Unknown OS"
        let model = "一般裝置"
        const ua = navigator.userAgent;

        // 步驟A: 嘗試使用 Google 新技術 (專抓 ASUS/Samsung/Pixel)
        // 這是唯一能抓到現代 Android 真實型號的方法
        if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
            try {
                const hints = await navigator.userAgentData.getHighEntropyValues(["model","platform", "platformVersion"]);
                if (hints.platform === "Android" && hints.model) {
                    os = `Android ${hints.platformVersion.split('.')[0]}`.trim(); // 例如 Android 13
                    model = hints.model; // 這裡會抓到 "ASUS_I006D" 或 "Pixel 7"
                    return { os, model }; // 抓到後就會直接回傳，不用往下走
                }
            } catch (e) {
                console.log("Client Hints 受限 (可能是 HTTP 環境):", e);
            }
        }
        // 步驟B: 如果上面沒抓到，使用 UAParser + 手動計算
        // 1. 基礎解析
        if (typeof UAParser === 'function') {
            const parser = new UAParser();
            const result = parser.getResult();

            if (result.os.name) os = result.os.name + (result.os.version ? " " + result.os.version : "");
            if (result.device.model) model = ((result.device.vendor || "") + " " + result.device.model).trim();
        }
        // 2. 螢幕與裝置修正
        // 螢幕數據 (使用 Math.max確保長邊永遠是 height，避免轉向誤判)
        const width = window.screen.width;
        const height = window.screen.height;
        const ratio = window.devicePixelRatio || 1;
        // 確保長邊是高 (避免橫拿判斷錯誤)
        const h = Math.max(width, height);  
        const w = Math.min(width, height);
        console.log("jenny 測試");
        console.log(JSON.stringify(ua));
        // 步驟C: 手動修正(針對UAParser抓不準的地方)
        // A. iOS 偵測 (iPhone)
        if(ua.includes("iPhone")) {     
            const verMatch = ua.match(/OS\s([\d_]+)/);
            const version = verMatch ? verMatch[1].replace(/_/g, '.') : "Unknown";
            os = `iOS ${version}`;
            // iPhone 解析度對照 (使用長邊判斷)
            if (h === 932) model = "iPhone 14/15/16 Pro Max";
            else if (h === 852) model = "iPhone 14/15/16 Pro";
                else if (h === 926) model = "iPhone 12/13/14 Plus/Pro Max";
                else if (h === 844) model = "iPhone 12/13/14";
                else if (h === 896) model = "iPhone XR / 11 / XS Max";
                else if (h === 812) model = "iPhone X / XS / 11 Pro";
                else if (h === 667) model = "iPhone SE / 6s / 7 / 8";
                else model = `iPhone (未知 ${h}x${w})@${ratio}x`;
        }
        // A. iPad 偵測 (含Mac偽裝)
        else if (ua.includes("iPad") || (ua.includes("Mac") && navigator.maxTouchPoints > 1)) {
            // 嘗試抓取版本 (如果是在桌面模式，通常抓不到真實版本，是正常)
            const verMatch = ua.match(/OS\s([\d_]+)/); // 手機模式才有
            if (verMatch) {
                os = `iPadOS ${verMatch[1].replace(/_/g, '.')}`;
            } else {
                os = "iPadOS (Desktop Mode)"; // 如果是電腦模式，真的抓不到版本，顯示這樣
            }
            // 用解析度去判斷型號
            // iPad Air 11吋(M2) 與 iPad Pro 11吋 解析度通常是  2388x1668 (CSS像素 1194x834)
            if (h >= 1360 && h <= 1380) model = "iPad Pro 12.9吋";
            else if (h >= 1180 && h <= 1200) model = "iPad Pro 11吋 / Air";
            else if (h >= 1020 && h <= 1100) model = "iPad (一般/Air/Mini)";
            else model = `iPad (尺寸: ${h}x${w})@${ratio}x`;
        } 
        // C. Android 備案(如果步驟A失敗)
        else if (ua.includes("Android")) {
            if (model === "K" || model.length < 3) {
                const match = ua.match(/;\s?([^;]+?)\sBuild\//);
                model = match ? match[1] : "Android Device";
            }
        }
        // D. 電腦
        else if (ua.includes("Windows")) {
            os = "Windows";
            model = "Windows PC??";
        } 
        else if (ua.includes("Mac")) {
            os = "macOS";
            model = "Mac Desktop";
        }
        
        //2026/02/01 ADD
        //使用正規表示式解析第一個 () 內的內容
        // \(([^)]+)\) 解釋：
        // \( : 匹配左括號
        // ([^)]+) : 擷取組，匹配直到遇到第一個右括號為止的所有字元
        // \) : 匹配右括號
        const match = ua.match(/\(([^)]+)\)/);

        // 如果匹配成功，match[1] 即為括號內的文字
        const result = match ? match[1] : "未找到匹配內容";
        //model=JSON.stringify(result);//2026/02/01 增加
        //model=JSON.stringify(ua);//2026/02/01 增加
        model=JSON.stringify(navigator.userAgent);
        


        return { os, model};
    }


    
    // 3. 執行並填入

    const deviceUuid = getOrCreateUUID();
    const info = await getFullDeviceSpecs();

    // 填入 UUID
    const uuidField = document.getElementById('uuid');
    if (uuidField) uuidField.value = deviceUuid;

    // 填入 OS 和 型號
    const osField = document.getElementById('os_info');
    const modelField = document.getElementById('device_model');

    if (osField) osField.value = info.os;
    if (modelField) modelField.value = info.model;

    console.log("🚀 Auth 準備就緒:", { uuid: deviceUuid, ...info });
});