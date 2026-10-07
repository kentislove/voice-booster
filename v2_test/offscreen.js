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
  if (tabAudioContexts[tabId]) {
    stopTabAudio(tabId);
  }

  const mediaStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      mandatory: {
        chromeMediaSource: 'tab',
        chromeMediaSourceId: streamId
      }
    },
    video: false
  });

  const audioContext = new AudioContext();
  const sourceNode = audioContext.createMediaStreamSource(mediaStream);

  const gainNode = audioContext.createGain();
  gainNode.gain.value = initialVolume;

  const compressorNode = audioContext.createDynamicsCompressor();
  compressorNode.threshold.setValueAtTime(-12, audioContext.currentTime);
  compressorNode.knee.setValueAtTime(30, audioContext.currentTime);
  compressorNode.ratio.setValueAtTime(12, audioContext.currentTime);
  compressorNode.attack.setValueAtTime(0.003, audioContext.currentTime);
  compressorNode.release.setValueAtTime(0.25, audioContext.currentTime);

  sourceNode.connect(gainNode);
  gainNode.connect(compressorNode);
  compressorNode.connect(audioContext.destination);

  tabAudioContexts[tabId] = {
    stream: mediaStream,
    context: audioContext,
    gain: gainNode,
    compressor: compressorNode,
    volume: initialVolume
  };

  mediaStream.getAudioTracks().forEach((track) => {
    track.onended = () => {
      stopTabAudio(tabId);
    };
  });
}

function setTabVolume(tabId, newVolume) {
  const session = tabAudioContexts[tabId];
  if (session && session.gain) {
    session.volume = newVolume;
    session.gain.gain.setValueAtTime(newVolume, session.context.currentTime);
  }
}

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
