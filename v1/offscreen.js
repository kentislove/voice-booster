// 音訊工作管理員：保存各個分頁的音訊處理狀態
const tabAudioContexts = {};

// 監聽來自彈出視窗或背景腳本的訊息指令
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.target !== 'offscreen') {
    return false;
  }

  if (message.type === 'START_AUDIO_BOOST') {
    startTabAudio(message.tabId, message.streamId, message.volume)
      .then(() => sendResponse({ success: true }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true; // 保持非同步通訊通道開放
  }

  if (message.type === 'SET_TAB_VOLUME') {
    setTabVolume(message.tabId, message.volume);
    sendResponse({ success: true });
    return false;
  }

  if (message.type === 'STOP_AUDIO_BOOST') {
    stopTabAudio(message.tabId);
    sendResponse({ success: true });
    return false;
  }

  if (message.type === 'GET_TAB_STATUS') {
    const isBoosting = !!tabAudioContexts[message.tabId];
    const currentVolume = isBoosting ? tabAudioContexts[message.tabId].volume : 1.0;
    sendResponse({ isBoosting, volume: currentVolume });
    return false;
  }
});

// 啟動指定分頁的音訊捕捉與放大管線
async function startTabAudio(tabId, streamId, initialVolume = 1.0) {
  // 如果該分頁已經在處理中，先關閉先前的資源以避免重複串接
  if (tabAudioContexts[tabId]) {
    stopTabAudio(tabId);
  }

  // 透過瀏覽器底層串流識別碼取得聲音資料串流
  const mediaStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      mandatory: {
        chromeMediaSource: 'tab',
        chromeMediaSourceId: streamId
      }
    },
    video: false
  });

  // 建立音訊處理核心環境
  const audioContext = new AudioContext();
  const sourceNode = audioContext.createMediaStreamSource(mediaStream);

  // 建立聲音增益放大器節點
  const gainNode = audioContext.createGain();
  gainNode.gain.value = initialVolume;

  // 建立動態壓縮保護節點（用來防範音量放大過大造成的刺耳破音現象）
  const compressorNode = audioContext.createDynamicsCompressor();
  compressorNode.threshold.setValueAtTime(-12, audioContext.currentTime); // 壓制門檻值
  compressorNode.knee.setValueAtTime(30, audioContext.currentTime);
  compressorNode.ratio.setValueAtTime(12, audioContext.currentTime); // 壓縮比例
  compressorNode.attack.setValueAtTime(0.003, audioContext.currentTime);
  compressorNode.release.setValueAtTime(0.25, audioContext.currentTime);

  // 串接音訊管線：聲音來源 -> 放大節點 -> 防破音壓縮節點 -> 電腦喇叭輸出
  sourceNode.connect(gainNode);
  gainNode.connect(compressorNode);
  compressorNode.connect(audioContext.destination);

  // 記錄該分頁的物件狀態
  tabAudioContexts[tabId] = {
    stream: mediaStream,
    context: audioContext,
    gain: gainNode,
    compressor: compressorNode,
    volume: initialVolume
  };

  // 監聽聲音串流是否異常中斷（例如使用者關閉該分頁）
  mediaStream.getAudioTracks().forEach((track) => {
    track.onended = () => {
      stopTabAudio(tabId);
    };
  });
}

// 調整指定分頁的音量放大倍率
function setTabVolume(tabId, newVolume) {
  const session = tabAudioContexts[tabId];
  if (session && session.gain) {
    session.volume = newVolume;
    session.gain.gain.setValueAtTime(newVolume, session.context.currentTime);
  }
}

// 停止指定分頁的音訊捕捉並釋放所有系統資源
function stopTabAudio(tabId) {
  const session = tabAudioContexts[tabId];
  if (session) {
    if (session.stream) {
      session.stream.getTracks().forEach((track) => track.stop());
    }
    if (session.context && session.context.state !== 'closed') {
      session.context.close();
    }
    delete tabAudioContexts[tabId];
  }
}
