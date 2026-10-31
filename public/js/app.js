document.addEventListener('DOMContentLoaded', async () => {

    /* =========================================
       第一部分：基礎資訊設定 (UUID, 時間, 裝置)
       ========================================= */

    // 1. 讀取若無簡單生成 UUID
    let deviceId = localStorage.getItem('device_uuid');
    if (!deviceId) {
        deviceId = "Unknown-" + Date.now() + '-' + Math.floor(Math.random() * 1000);
        console.warn("⚠️ 警告：找不到 UUID，使用臨時 ID");
        localStorage.setItem('device_uuid', deviceId);
    }
    // 顯示在帳戶資訊頁
    const uuidDisplay = document.getElementById('uuid-display');
    if (uuidDisplay) uuidDisplay.innerText = deviceId;

    // 2. 時間工具 (格式化為 YYYY/MM/DD HH:mm:ss)
    const getFormattedTime = () => {
        const now = new Date();
        return now.getFullYear() + '/' +
            (now.getMonth() + 1).toString().padStart(2, '0') + '/' +
            now.getDate().toString().padStart(2, '0') + ' ' +
            now.getHours().toString().padStart(2, '0') + ':' +
            now.getMinutes().toString().padStart(2, '0') + ':' +
            now.getSeconds().toString().padStart(2, '0');
    };

    // 設定登入時間 (顯示在帳戶資訊頁)
    const loginTimeSnapshot = getFormattedTime();
    const loginTimeDisplay = document.getElementById('login-time-display');
    if (loginTimeDisplay) loginTimeDisplay.innerText = loginTimeSnapshot;

    // 3. 核心偵測 (Async Client Hints)
    // 定義一個全域變數來存偵測結果，讓掃描功能可以用
    let globalDeviceInfo = { os: "讀取中...", device: "讀取中..." };

    async function getFullDeviceSpecs() {
        let os = "Unknown OS";
        let model = "一般裝置";
        const ua = navigator.userAgent ;
        // A: 優先嘗試 Client Hints
        if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
            try {
                const hints = await navigator.userAgentData.getHighEntropyValues(["model", "platform", "platformVersion"]);
                if (hints.platform === "Android") {
                    // platformVersion 可能像 "14.0.0" → 取主版
                    os = `Android ${String(hints.platformVersion).split('.')[0]}.trim()`;
                    model = hints.model; // 這裡抓得最準
                    return { os, model };
                }
            } catch (e) {
                // ignore
            }
        }
        // B: 失敗則使用UAParsr
        if (typeof UAParser === 'function') {
            const parser = new UAParser();
            const result = parser.getResult();
            if (result.os.name) os = result.os.name + (result.os.version ? " " + result.os.version : "")
            if (result.device.model) model = ((result.device.vendor || "") + " " + result.device.model).trim();
        }
        // C. 手動
        // 螢幕數據 (使用 Math.max確保長邊永遠是 height，避免轉向誤判)
        const width = window.screen.width;
        const height = window.screen.height;
        const ratio = window.devicePixelRatio || 1;
        // 確保長邊是高 (避免橫拿判斷錯誤)
        const h = Math.max(width, height);
        const w = Math.min(width, height);
         // iOS
        if (ua.includes("iPhone")) {
            const verMatch = ua.match(/OS\s([\d_]+)/);
            const version = verMatch ? verMatch[1].replace(/_/g, '.') : "";
            os = `iOS ${version}`;

            if (h === 932) model = "iPhone 14/15/16 Pro Max";
            else if (h === 852) model = "iPhone 14/15/16 Pro";
            else if (h === 926) model = "iPhone 12/13/14 Plus/Pro Max";
            else if (h === 844) model = "iPhone 12/13/14";
            else if (h === 896) model = "iPhone XR / 11 / XS Max";
            else if (h === 812) model = "iPhone X / XS / 11 Pro";
            else if (h === 667) model = "iPhone SE / 6s / 7 / 8";
            else model = `iPhone (${h}x${w})@${ratio}x`;
        }
        // iPad
        else if (ua.includes("iPad") || (ua.includes("Mac") && navigator.maxTouchPoints > 1)) {
            const verMatch = ua.match(/OS\s([\d_]+)/);
            os = verMatch ? `iPadOS ${verMatch[1].replace(/_/g, '.')}` : "iPadOS (Desktop Mode)";
            if (h === 1366) model = "iPad Pro 12.9吋";
            else if (h === 1194) model = "iPad Pro 11吋 / Air (M1/M2)";
            else if (h === 1180) model = "iPad Air 10.9吋";
            else if (h === 1024) model = "iPad Mini / 舊款 iPad";
            else model = `iPad (尺寸: ${h}x${w})@${ratio}x`;
        }
        // Android "K" 修正
        // Android Fallback
        else if (ua.includes("Android")) {
            const verMatch = ua.match(/Android\s([0-9.]+)/);
            os = verMatch ? `Android ${verMatch[1]}` : "Android";

            if (!model || model === "K" || model.length < 3) {
                // ✅ 放寬：Build/ 或 Build 都吃
                const match = ua.match(/;\s?([^;]+?)\sBuild/i);
                model = match ? match[1].trim() : "Android Device";
            }
        }
        // PC
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
    };

    // 填入資訊到帳戶頁面
    const info = await getFullDeviceSpecs();
    const osDisplay = document.getElementById("os-display");
    const modelDisplay = document.getElementById("model-display"); // 配合新 HTML 的 ID
    
    if (osDisplay) osDisplay.innerText = info.os;
    if (modelDisplay) modelDisplay.innerText = info.model;


    /* =========================================
       第二部分：UI 互動 (漢堡選單開關)
       ========================================= */
    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');

    // 只有當這些元素存在時才綁定事件 (避免報錯)
    if (menuBtn && sidebar && overlay) {
        // 打開選單
        menuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('show');
        });

        // 點擊遮罩關閉
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('show');
        });
    }

    // 全域函式：給 HTML onclick 使用的切換功能
    window.showSection = function(sectionName) {
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('show');

        const scanSection = document.getElementById('scan-section');
        const accountSection = document.getElementById('account-section');

        if (scanSection && accountSection) {
            if (sectionName === 'scan') {
                scanSection.style.display = 'block';
                accountSection.style.display = 'none';
            } else {
                scanSection.style.display = 'none';
                accountSection.style.display = 'block';
            }
        }
    };


    /* =========================================
       第三部分：掃描入貨邏輯 (核心功能)
       ========================================= */
    const barcodeInput = document.getElementById('barcode-input');
    const statusMsg = document.getElementById('status-msg');
    const logBody = document.getElementById('log-body'); // 表格的身體

    if (barcodeInput) {
        // 自動聚焦 (讓員工不用點輸入框就能掃)
        barcodeInput.focus();

        // 監聽 Enter 鍵 (掃描槍掃完會自動送出 Enter)
        barcodeInput.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                const barcode = barcodeInput.value.trim();
                if (!barcode) return;

                // 1. 鎖定介面
                barcodeInput.disabled = true;
                if (statusMsg) {
                    statusMsg.innerText = "⏳ 處理中...";
                    statusMsg.style.color = "blue";
                }

                // 2. 準備資料
                const scanTimeSnapshot = getFormattedTime();
                const payload = {
                    uuid: deviceId,
                    barcode: barcode,
                    os_info: info.os,
                    device_model: info.model,
                    login_time: loginTimeSnapshot,
                    scan_time: scanTimeSnapshot
                };

                console.log("📦 掃描送出:", payload);

                try {
                    // 3. 發送 API
                    const res = await fetch('/api/inventory', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    const data = await res.json();

                    if (res.ok) { // 後端回傳 200 OK
                        // 4. 成功：在表格「最上面」插入一行
                        if (logBody) {
                            const row = logBody.insertRow(0);
                            
                            // 只是為了顯示好看，只取時間部分 (例如 14:30:05)
                            const timeOnly = scanTimeSnapshot.split(' ')[1]; 

                            row.innerHTML = `
                                <td>${timeOnly}</td>
                                <td style="font-weight:bold; color:#333;">${barcode}</td>
                                <td style="color:green;">✔ 成功</td>
                            `;
                        }

                        if (statusMsg) {
                            statusMsg.innerText = "✅ 掃描成功！請繼續";
                            statusMsg.style.color = "green";
                        }
                    } else {
                        // 失敗 (例如沒登入、裝置錯誤)
                        if (statusMsg) {
                            statusMsg.innerText = "❌ 失敗：" + (data.message || "未知錯誤");
                            statusMsg.style.color = "red";
                        }
                    }

                } catch (err) {
                    console.error(err);
                    if (statusMsg) {
                        statusMsg.innerText = "❌ 網路或伺服器錯誤";
                        statusMsg.style.color = "red";
                    }
                }

                // 5. 復原輸入框 (清空 + 解鎖 + 聚焦)
                barcodeInput.value = "";
                barcodeInput.disabled = false;
                barcodeInput.focus();
            }
        });
    }
});