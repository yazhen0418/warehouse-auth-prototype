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
            model=JSON.stringify(result);//2026/02/01 增加
            return { os, model};
        };