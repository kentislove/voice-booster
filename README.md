# 分頁音量放大神器 / Voice Booster

[繁體中文](#繁體中文說明) | [English](#english-documentation)

---

## 繁體中文說明

### 📖 專案簡介
**分頁音量放大神器 (Voice Booster)** 是一款專為Google Chrome 打造的高效能音量增強擴充功能。採用最新第三版擴充功能規範 (Manifest V3) 開發，支援將特定分頁的音量進行等比例線性放大（最高可達 600%），並內建動態壓縮防破音保護機制，兼具極致響度與純淨音質。

---

### ✨ 核心功能特色
1. **最高 600% 等比例音量放大**：透過音訊增益節點進行線性乘法放大，突破系統與網頁原始 100% 音量上限。
2. **智慧防破音與平滑壓縮保護**：內建動態範圍壓縮節點 (DynamicsCompressorNode)，當聲音振幅過高時自動平滑壓制極值，避免高倍率放大時產生刺耳爆音，有效保護耳機與聽力。
3. **獨創「雙核心智慧切換引擎」**：
   - **一般全域模式**：適用於 YouTube、線上廣播、一般影音網站，全方位捕捉該分頁所有音訊來源。
   - **網飛相容模式**：專門針對網飛 (Netflix)、迪士尼 (Disney+) 等受版權保護的串流平台，就地深入網頁內部影片播放器進行放大。
4. **即時互動操作面板**：深色質感現代介面、平滑調整滑桿、放大倍率即時顯示、狀態指示燈號與一鍵重設功能。

---

### 🔍 開發背景與參考他人開源作品的理由
在決定自行獨立開發此專案之前，我們深入研讀了開源社群（GitHub）上的多個既有專案：

1. **參考專案一：MasterAlexS / VolumeBooster**
   - **參考收穫**：學習其使用第三版擴充功能規範搭配離屏文件 (Offscreen Document) 運作音訊上下文的架構。
   - **改進理由**：該專案在高倍率放大時容易產生嚴重破音與波形削波失真；因此我們在本專案中加入了完整的動態音訊壓縮保護電路。
2. **參考專案二：hazzalark / Volume-Booster**
   - **參考收穫**：學習其極簡的單一分頁狀態管理思維。
   - **改進理由**：其架構仍採用即將淘汰的舊版規範，且在分頁關閉時未能妥善回收串流資源；我們改寫為符合現代規範且具備自動資源釋放的架構。
3. **參考專案三：sanjeed5 / sound-booster**
   - **參考收穫**：啟發了我們直接在網頁內部針對媒體播放標籤進行音訊節點接軌的可行性。
   - **改進理由**：純粹的元素注入容易受到跨網域 (CORS) 限制；因此我們決定將其改良為備用核心，與全分頁捕捉合體。

---

### 🚀 為什麼最終採用第二版（V2 雙核心）架構？
在第一版 (v1) 的開發過程中，我們採用了標準的「分頁音訊捕捉法 (tabCapture)」。這套架構在YOUTUBE等一般網站運作完美，但當在**網飛 (Netflix)** 觀看影片時，系統卻拋出「受保護頁面」的錯誤而無法啟動！

**深入根本原因**：
* 網飛等付費串流平台採用了數位版權管理 (DRM / Widevine) 與加密媒體擴充機制 (EME)。
* 瀏覽器為了防範使用者側錄受版權保護的影音串流，底層強制封鎖了擴充功能透過 `tabCapture` 抓取串流的權限。

**V2 版本的重大突破**：
* 我們開發了**「雙核心混合引擎」**，同時具備「全分頁捕捉」與「網頁元素注入」雙軌架構。
* 當使用者造訪網飛時，擴充功能會自動辨識並切換至**【網飛相容模式】**，直接潛入網頁內部找到影片播放標籤進行就地放大，徹底繞過外層分頁側錄鎖！
* 兼具廣泛通用性與付費串流平台相容性，這正是我們全面採用 V2 架構的核心關鍵。

---

### 📦 安裝與使用指南
1. 前往本專案的 [Releases 發行頁面](../../releases) 下載最新的封裝壓縮檔（如 `Voice-Booster-v2.0.0.zip`）。
2. 將下載的壓縮檔解壓縮至你電腦中的任意資料夾。
3. 打開谷歌瀏覽器 (Google Chrome)，在網址列輸入 `chrome://extensions/` 並進入。
4. 開啟右上角的**「開發人員模式」**。
5. 點擊左上角的**「載入未封裝項目」**，選取剛才解壓縮出來的資料夾。
6. 打開任意音樂或影片網頁（包括網飛 Netflix），點擊瀏覽器工具列上的圖示，拖動滑桿即可開始享受放大的音量！

---

## English Documentation

### 📖 Overview
**Voice Booster** is a high-performance Google Chrome extension built on Manifest V3, designed to give users precise, per-tab volume amplification up to 600%. It features a built-in dynamic compressor that prevents audio distortion, delivering both extreme loudness and crystal-clear sound quality.

---

### ✨ Key Features
1. **Linear Amplification up to 600%**: Multiplies audio amplitude programmatically via Web Audio API gain nodes, breaking through standard 100% volume limits.
2. **Anti-Clipping & Distortion Protection**: Integrated with a `DynamicsCompressorNode` that smoothly compresses extreme amplitude peaks, protecting your speakers and hearing from harsh distortion.
3. **Dual-Core Hybrid Engine**:
   - **Global Tab Capture Mode**: Ideal for YouTube, Twitch, online radio, and standard web media, capturing all sounds across the active tab.
   - **Netflix-Compatible Mode**: Specially engineered for DRM-protected streaming platforms (such as Netflix and Disney+), injecting audio nodes directly into in-page media elements.
4. **Intuitive Modern UI**: Sleek dark mode interface, responsive slider control, real-time gain percentage readout, status badges, and one-click reset.

---

### 🔍 Motivation & Prior Art Analysis
Before developing this project, we carefully reviewed existing open-source solutions on GitHub:

1. **MasterAlexS / VolumeBooster**
   - *Key Takeaway*: Demonstrated the modern Manifest V3 architecture routing audio streams through an Offscreen Document.
   - *Area of Improvement*: Lacked dynamic limiting, leading to harsh clipping and audio distortion at high gain levels. We solved this with dynamic compression.
2. **hazzalark / Volume-Booster**
   - *Key Takeaway*: Clean, minimalist per-tab state management.
   - *Area of Improvement*: Built on legacy Manifest V2 without reliable lifecycle cleanup on tab closure. We modernized the lifecycle to prevent memory leaks.
3. **sanjeed5 / sound-booster**
   - *Key Takeaway*: Demonstrated direct attachment to `HTMLMediaElement` tags.
   - *Area of Improvement*: Encountered severe CORS issues on external media sources. We combined this technique as a fallback engine alongside global capture.

---

### 🚀 Why Architecture V2 Was Chosen
During Version 1 (v1) testing, we relied exclusively on `chrome.tabCapture`. While it worked flawlessly on standard websites like YouTube, testing on **Netflix** triggered a "Protected Page" security error.

**Root Cause**:
* Premium streaming platforms utilize Digital Rights Management (DRM / Widevine) and Encrypted Media Extensions (EME).
* Chromium enforces strict security boundaries that prohibit standard `tabCapture` APIs from tapping into DRM-protected media streams to prevent stream ripping.

**Breakthrough in Version 2 (v2)**:
* We introduced the **Dual-Core Hybrid Engine**, providing both tab capture and DOM media element injection.
* On Netflix, the extension automatically switches to **Netflix-Compatible Mode**, attaching the Web Audio gain graph directly to the active `<video>` element within the page origin, completely bypassing external stream-capture blocks.
* This hybrid approach ensures seamless playback and volume boosting across both open-web media and encrypted streaming services.

---

### 📦 Installation
1. Download the latest packaged release (e.g., `Voice-Booster-v2.0.0.zip`) from the [Releases](../../releases) tab.
2. Extract the ZIP file to a convenient local folder.
3. Open Google Chrome and navigate to `chrome://extensions/`.
4. Enable **Developer mode** using the toggle in the top-right corner.
5. Click **Load unpacked** in the top-left corner and select the extracted folder.
6. Open any audio or video stream (including Netflix), click the Voice Booster icon in your extension toolbar, and adjust the slider to your desired volume.
