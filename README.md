# 分頁音量放大神器 / Voice Booster

[繁體中文說明](#繁體中文說明) | [English Documentation](#english-documentation)

---

## 繁體中文說明

### 📌 為什麼要用這個擴充功能？（解決的核心痛點）
在日常使用瀏覽器追劇、看影片或聽音樂時，常常會遇到以下讓人抓狂的狀況：
1. **筆電或耳機音量過小**：影片本身的錄音音量太弱，即使把作業系統和播放器音量都開到 100%，還是聽不清楚對話細節。
2. **網飛 (Netflix) 等串流平台的版權限制**：市面上大部分音量放大擴充套件，在遇到網飛、迪士尼等平台時，會因為瀏覽器底層的數位版權加密保護 (DRM) 而直接失效，甚至跳出受保護頁面錯誤。
3. **過度放大導致嚴重爆音與失真**：市面上的工具往往只是單純把增益拉大，結果聲音全部削波破音，刺耳嘈雜甚至傷害耳機。

👉 **本擴充功能就是為了徹底解決上述三大難題而生！** 它能讓你的特定分頁聲音等比例放大高達 600%，並內建智慧防破音壓縮保護，最重要的是——**完美支援網飛 (Netflix)！**

---

### 🛠️ 怎麼用？（安裝與操作指南）

#### 適用環境
相容於所有採用**開源鉻核心 (Chromium)** 的瀏覽器，包括：
* 谷歌瀏覽器 (Google Chrome)
* 微軟瀏覽器 (Microsoft Edge)
* 勇敢瀏覽器 (Brave)
* 歌劇瀏覽器 (Opera)
* 維瓦第瀏覽器 (Vivaldi)

#### 安裝步驟（三分鐘上手）
1. 前往本專案的 [Releases 發行頁面](../../releases) 下載最新的封裝壓縮檔 `Voice-Booster-v2.0.0.zip`。
2. 將下載的壓縮檔解壓縮到你電腦中的任意資料夾。
3. 打開你的瀏覽器，在網址列輸入管理網址：
   * 谷歌瀏覽器輸入：`chrome://extensions/`
   * 微軟瀏覽器輸入：`edge://extensions/`
4. 開啟右上角（或左側欄）的**「開發人員模式」**開關。
5. 點擊**「載入未封裝項目」**（微軟 Edge 為「載入解壓縮的擴充功能」），選取剛才解壓縮出來的資料夾。
6. 安裝成功！瀏覽器右上角會出現藍色的擴充功能圖示。

#### 操作說明
1. 打開任何正在播放音訊或影片的網頁（例如優管、網飛、線上廣播等）。
2. 點擊工具列上的擴充功能圖示開啟控制面板。
3. 拖曳滑桿，聲音將即時等比例放大（範圍為 0% 至 600%）。
4. **雙核心切換模式**：
   * **一般全域模式**：預設模式，自動捕捉分頁內的所有聲音。
   * **網飛相容模式**：觀看網飛時系統會自動辨識並切換；若遇到受保護網頁，亦可手動點擊切換。
5. 想恢復原狀時，點擊「重設回 100%」即可一秒還原。

---

### 💡 設計的理由是什麼？（技術架構與深層思考）

1. **為什麼採用「雙核心智慧混合引擎」？**
   * **全域分頁捕捉 (Tab Capture)**：適用於 90% 以上的普通網頁，能全方位截取該分頁的所有發聲來源，音質穩定度最佳。
   * **網頁元素注入 (DOM Element Injector)**：為了解決網飛 (Netflix) 的硬體加密防側錄限制，我們設計了備用注入核心，直接潛入網頁內部找到 `<video>` 播放標籤就地接入音訊放大管線，完美突破瀏覽器外層封鎖。
2. **為什麼加入「動態壓縮保護節點 (DynamicsCompressorNode)」？**
   * 聲音數位訊號在放大超過 100% 時，波形頂端會被削平（削波失真），產生尖銳刺耳的破音。
   * 我們在放大節點後方串聯了專業音訊壓縮器，設定平滑的門檻值與反應時間，當峰值過大時自動壓制極端振幅，確保「聲音變宏亮，但絕不刺耳爆音」。
3. **為什麼符合「第三版擴充功能規範 (Manifest V3)」？**
   * 舊版規範 (Manifest V2) 已經被各大瀏覽器陸續淘汰。我們全面採用最新的 Manifest V3，並利用離屏文件 (Offscreen Document) 在無畫面環境中安全運作網頁音訊介面，確保未來長久穩定相容。

---

### 📜 歷史版本演進比對 (Version History)

| 評估項目 | 第一版 (v1.0.0) | 第二版旗艦版 (v2.0.0 - 目前版本) |
| :--- | :--- | :--- |
| **核心架構** | 單一全域分頁捕捉引擎 (tabCapture) | **雙核心智慧切換引擎 (全域捕捉 + 網頁元素注入)** |
| **網飛 (Netflix) 支援** | ❌ 因版權加密防側錄限制跳出受保護錯誤 | ✅ **完美突破！自動切換網飛相容模式順暢放大** |
| **防破音保護** | ✅ 具備動態壓縮保護節點 | ✅ **雙核心皆具備專業級防破音動態壓縮保護** |
| **使用者介面** | 基礎滑桿與狀態按鈕 | **新增雙核心模式切換器、平台自動辨識提示** |
| **相容瀏覽器** | Chrome、Edge 等開源鉻核心瀏覽器 | **Chrome、Edge、Brave、Opera 等全開源鉻核心通用** |

---

### 📄 授權條款與二次開發規範 (License & Attribution)
本專案採用 **[MIT License](LICENSE)** 開源授權條款：
* **自由二次改進與改寫**：任何人皆可免費下載、使用、修改本專案程式碼，或將其用於個人、學習及商業專案中。
* **唯一限制條件（姓名標示）**：在引用、改寫、重新發布本專案的程式碼或衍生作品時，**必須保留原作者姓名來源聲明**：
  > 原創作者：**kentislove**  
  > 專案原始來源：[https://github.com/kentislove/voice-booster](https://github.com/kentislove/voice-booster)

---

## English Documentation

### 📌 Why Use This Extension? (Core Problem Solved)
When streaming movies, videos, or music in your browser, you often face these frustrating situations:
1. **Low Volume on Laptops or Headphones**: Many videos are recorded at very low levels. Even with both your system volume and the video player maxed out at 100%, dialogues remain hard to hear.
2. **DRM Restrictions on Platforms Like Netflix**: Most volume boosters in the store fail completely on Netflix or Disney+ due to browser-level Digital Rights Management (DRM) and Encrypted Media Extensions (EME), triggering "Protected Page" errors.
3. **Severe Distortion & Clipping at High Gain**: Many boosters simply amplify amplitude without limiting, resulting in harsh, crackling sound that hurts your ears and speakers.

👉 **Voice Booster is built specifically to conquer these three challenges!** It provides linear amplification up to 600% with built-in dynamic compression, and most importantly: **it works seamlessly on Netflix!**

---

### 🛠️ How to Use (Installation & Quick Start)

#### Supported Browsers
Fully compatible with all modern **Chromium-based** browsers:
* Google Chrome
* Microsoft Edge
* Brave Browser
* Opera
* Vivaldi

#### Installation Steps
1. Download the latest packaged release `Voice-Booster-v2.0.0.zip` from the [Releases](../../releases) section.
2. Extract the downloaded ZIP archive into any folder on your computer.
3. Open your browser and navigate to the extensions page:
   * Google Chrome: `chrome://extensions/`
   * Microsoft Edge: `edge://extensions/`
4. Enable **Developer mode** via the toggle switch in the top-right corner.
5. Click **Load unpacked** (or "Load unpacked extension" in Edge) and select the extracted folder.
6. Done! The blue speaker icon will appear in your extension toolbar.

#### How to Operate
1. Open any audio or video stream (e.g., YouTube, Netflix, Spotify Web).
2. Click the Voice Booster icon in the browser toolbar.
3. Drag the slider to boost volume up to 600% in real time.
4. **Dual-Core Mode Selection**:
   * **Global Tab Capture Mode**: Default for general web pages.
   * **Netflix-Compatible Mode**: Automatically recognized and activated when on Netflix; can also be toggled manually.
5. Click "Reset to 100%" anytime to restore original sound immediately.

---

### 💡 Why Was It Designed This Way? (Architectural Rationale)

1. **Why the Dual-Core Hybrid Engine?**
   * **Tab Capture**: Best suited for >90% of open websites, providing rock-solid stability and zero cross-origin issues.
   * **DOM Element Injection**: To bypass Chromium's strict prohibition against stream-ripping on DRM-protected content (like Netflix), our secondary engine injects Web Audio nodes directly into the page's `<video>` tag, overcoming the external capture lock.
2. **Why Integrate a DynamicsCompressorNode?**
   * Boosting digital audio signals past 100% causes waveform clipping, creating harsh distortion.
   * By inserting a dynamic compressor after the gain node, loud amplitude spikes are smoothly attenuated, delivering high loudness while keeping the sound clean and comfortable.
3. **Why Manifest V3?**
   * Manifest V2 is deprecated across modern browsers. Voice Booster is built natively on Manifest V3 using an Offscreen Document to process Web Audio safely without DOM dependencies in the service worker.

---

### 📜 Version History & Evolution

| Feature | Version 1 (v1.0.0) | Version 2 Flagship (v2.0.0 - Current) |
| :--- | :--- | :--- |
| **Core Architecture** | Single Tab Capture Engine | **Dual-Core Hybrid Engine (Tab Capture + DOM Injection)** |
| **Netflix Support** | ❌ Blocked by DRM security policy | ✅ **Fully supported! Auto-detects Netflix and boosts sound** |
| **Anti-Clipping** | ✅ Included DynamicsCompressorNode | ✅ **Professional dynamic compression across both cores** |
| **User Interface** | Basic slider and toggle | **Dual-core mode toggles, status badges & auto-detect alerts** |
| **Compatibility** | Chromium browsers | **100% compatible across Chrome, Edge, Brave, Opera, Vivaldi** |

---

### 📄 License & Attribution
This project is open-source under the **[MIT License](LICENSE)**:
* **Freedom to Modify & Reuse**: You are free to fork, adapt, improve, and use this code in personal, educational, or commercial projects.
* **Attribution Requirement**: When reusing, modifying, or redistributing this code, you **must retain credit to the original creator**:
  > Original Author: **kentislove**  
  > Source Repository: [https://github.com/kentislove/voice-booster](https://github.com/kentislove/voice-booster)
