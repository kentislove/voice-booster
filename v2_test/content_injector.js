// 網頁元素音訊放大注入核心（專職負責受版權保護的串流影音平台）
(function () {
  // 如果已經初始化過，僅確保監聽器存在
  if (window.__voiceBoosterInitialized) {
    return;
  }
  window.__voiceBoosterInitialized = true;

  // 保存目前正在作用中的音訊處理管線
  window.__voiceBoosterSession = {
    audioCtx: null,
    gainNode: null,
    compressorNode: null,
    connectedVideos: new WeakSet(),
    currentVolume: 1.0,
    isActive: false
  };

  // 取得頁面上目前正在播放或存在的影片與音訊元素
  function getMediaElements() {
    const videos = Array.from(document.querySelectorAll('video'));
    const audios = Array.from(document.querySelectorAll('audio'));
    return [...videos, ...audios];
  }

  // 啟動或重啟音訊處理管線
  function attachAudioPipeline(targetMultiplier = 1.0) {
    const session = window.__voiceBoosterSession;
    const mediaElements = getMediaElements();

    if (mediaElements.length === 0) {
      return { success: false, error: '此頁面尚未找到任何正在播放的影片或音訊元件' };
    }

    // 初始化網頁音訊環境
    if (!session.audioCtx || session.audioCtx.state === 'closed') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      session.audioCtx = new AudioContextClass();

      session.gainNode = session.audioCtx.createGain();
      session.gainNode.gain.value = targetMultiplier;

      // 建立動態壓縮保護節點（避免音量暴衝與破音）
      session.compressorNode = session.audioCtx.createDynamicsCompressor();
      session.compressorNode.threshold.setValueAtTime(-12, session.audioCtx.currentTime);
      session.compressorNode.knee.setValueAtTime(30, session.audioCtx.currentTime);
      session.compressorNode.ratio.setValueAtTime(12, session.audioCtx.currentTime);
      session.compressorNode.attack.setValueAtTime(0.003, session.audioCtx.currentTime);
      session.compressorNode.release.setValueAtTime(0.25, session.audioCtx.currentTime);

      // 管線串接：增益放大 -> 防破音壓縮 -> 喇叭輸出
      session.gainNode.connect(session.compressorNode);
      session.compressorNode.connect(session.audioCtx.destination);
    }

    if (session.audioCtx.state === 'suspended') {
      session.audioCtx.resume();
    }

    let connectedCount = 0;
    // 將所有尚未綁定的影片元件接上音訊處理管線
    mediaElements.forEach((element) => {
      if (!session.connectedVideos.has(element)) {
        try {
          const sourceNode = session.audioCtx.createMediaElementSource(element);
          sourceNode.connect(session.gainNode);
          session.connectedVideos.add(element);
          connectedCount++;
        } catch (e) {
          // 若部分元件已被系統或其他程式連接則安全跳過
        }
      }
    });

    session.currentVolume = targetMultiplier;
    session.isActive = true;
    if (session.gainNode) {
      session.gainNode.gain.setValueAtTime(targetMultiplier, session.audioCtx.currentTime);
    }

    return { success: true, count: connectedCount };
  }

  // 調整放大倍率
  function updateVolume(newMultiplier) {
    const session = window.__voiceBoosterSession;
    session.currentVolume = newMultiplier;

    if (session.audioCtx && session.gainNode) {
      if (session.audioCtx.state === 'suspended') {
        session.audioCtx.resume();
      }
      session.gainNode.gain.setValueAtTime(newMultiplier, session.audioCtx.currentTime);
      session.isActive = true;
    } else {
      attachAudioPipeline(newMultiplier);
    }
  }

  // 重設為原始音量
  function resetVolume() {
    const session = window.__voiceBoosterSession;
    session.currentVolume = 1.0;
    if (session.audioCtx && session.gainNode) {
      session.gainNode.gain.setValueAtTime(1.0, session.audioCtx.currentTime);
      session.isActive = false;
    }
  }

  // 監聽來自彈出視窗的指令
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.target !== 'content') {
      return false;
    }

    if (message.type === 'START_ELEMENT_BOOST') {
      const result = attachAudioPipeline(message.volume || 1.0);
      sendResponse(result);
      return false;
    }

    if (message.type === 'SET_ELEMENT_VOLUME') {
      updateVolume(message.volume);
      sendResponse({ success: true, volume: message.volume });
      return false;
    }

    if (message.type === 'RESET_ELEMENT_VOLUME') {
      resetVolume();
      sendResponse({ success: true });
      return false;
    }

    if (message.type === 'GET_ELEMENT_STATUS') {
      const session = window.__voiceBoosterSession;
      const mediaElements = getMediaElements();
      sendResponse({
        isActive: session.isActive,
        volume: session.currentVolume || 1.0,
        hasMedia: mediaElements.length > 0
      });
      return false;
    }
  });

  // 自動觀察網頁動態變化（例如網飛換集數或動態生成新播放器時自動接上）
  const observer = new MutationObserver(() => {
    const session = window.__voiceBoosterSession;
    if (session.isActive && session.audioCtx) {
      const mediaElements = getMediaElements();
      mediaElements.forEach((element) => {
        if (!session.connectedVideos.has(element)) {
          try {
            const sourceNode = session.audioCtx.createMediaElementSource(element);
            sourceNode.connect(session.gainNode);
            session.connectedVideos.add(element);
          } catch (e) {
            // 安全容錯
          }
        }
      });
    }
  });

  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true
  });
})();
