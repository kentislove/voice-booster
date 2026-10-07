document.addEventListener('DOMContentLoaded', async () => {
  const volumeSlider = document.getElementById('volumeSlider');
  const volumePercent = document.getElementById('volumePercent');
  const badge = document.getElementById('badge');
  const toggleBtn = document.getElementById('toggleBtn');
  const resetBtn = document.getElementById('resetBtn');
  const tabTitle = document.getElementById('tabTitle');
  const modeTabBtn = document.getElementById('modeTabBtn');
  const modeInjectBtn = document.getElementById('modeInjectBtn');
  const modeDescription = document.getElementById('modeDescription');
  const noticeBox = document.getElementById('noticeBox');
  const noticeText = document.getElementById('noticeText');

  let currentTab = null;
  let currentMode = 'tab'; // 'tab' (全分頁捕捉) 或 'inject' (網頁元素注入)
  let isBoosting = false;

  // 取得目前作用中的分頁
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTab = tab;

  if (currentTab) {
    tabTitle.textContent = '目標分頁：' + (currentTab.title || '無標題分頁');
    // 如果偵測到網飛網域，自動優先推薦網飛相容模式
    if (currentTab.url && currentTab.url.includes('netflix.com')) {
      setMode('inject');
      showNotice('偵測到網飛影音平台，已自動為您切換至【網飛相容模式】！');
    }
  } else {
    tabTitle.textContent = '無法取得當前分頁';
    return;
  }

  // 確保背景環境與離屏文件就緒
  await chrome.runtime.sendMessage({ target: 'background', type: 'ENSURE_OFFSCREEN' });

  // 模式切換器按鈕監聽
  modeTabBtn.addEventListener('click', () => {
    if (currentMode !== 'tab') {
      setMode('tab');
      checkStatus();
    }
  });

  modeInjectBtn.addEventListener('click', () => {
    if (currentMode !== 'inject') {
      setMode('inject');
      checkStatus();
    }
  });

  function setMode(mode) {
    currentMode = mode;
    if (mode === 'tab') {
      modeTabBtn.classList.add('active');
      modeInjectBtn.classList.remove('active');
      modeDescription.textContent = '目前放大倍率（一般全域模式）';
    } else {
      modeInjectBtn.classList.add('active');
      modeTabBtn.classList.remove('active');
      modeDescription.textContent = '目前放大倍率（網飛相容模式）';
    }
  }

  function showNotice(msg) {
    noticeText.textContent = msg;
    noticeBox.classList.remove('hidden');
  }

  // 檢查當前選定模式下的音訊狀態
  async function checkStatus() {
    if (currentMode === 'tab') {
      chrome.runtime.sendMessage(
        { target: 'offscreen', type: 'GET_TAB_STATUS', tabId: currentTab.id },
        (res) => {
          if (res && res.isBoosting) {
            updateInterfaceState(true, Math.round((res.volume || 1.0) * 100));
          } else {
            updateInterfaceState(false, 100);
          }
        }
      );
    } else {
      // 先確保目標分頁已經載入注入程式
      await chrome.runtime.sendMessage({ target: 'background', type: 'ENSURE_INJECTOR', tabId: currentTab.id });
      chrome.tabs.sendMessage(
        currentTab.id,
        { target: 'content', type: 'GET_ELEMENT_STATUS' },
        (res) => {
          if (chrome.runtime.lastError || !res) {
            updateInterfaceState(false, 100);
          } else if (res.isActive) {
            updateInterfaceState(true, Math.round((res.volume || 1.0) * 100));
          } else {
            updateInterfaceState(false, 100);
          }
        }
      );
    }
  }

  // 更新介面燈號與按鈕
  function updateInterfaceState(active, percentage) {
    isBoosting = active;
    volumeSlider.value = percentage;
    volumePercent.textContent = percentage + '%';

    if (active) {
      badge.textContent = '放大中';
      badge.className = 'badge badge-on';
      toggleBtn.textContent = '關閉放大效果';
      toggleBtn.className = 'btn btn-secondary';
    } else {
      badge.textContent = '尚未啟用';
      badge.className = 'badge badge-off';
      toggleBtn.textContent = '啟動放大音量';
      toggleBtn.className = 'btn btn-primary';
    }
  }

  // 啟動全分頁捕捉核心
  async function startTabBoosting(multiplier) {
    try {
      const streamId = await new Promise((resolve, reject) => {
        chrome.tabCapture.getMediaStreamId({ targetTabId: currentTab.id }, (id) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(id);
          }
        });
      });

      chrome.runtime.sendMessage(
        {
          target: 'offscreen',
          type: 'START_AUDIO_BOOST',
          tabId: currentTab.id,
          streamId: streamId,
          volume: multiplier
        },
        (res) => {
          if (res && res.success) {
            updateInterfaceState(true, Math.round(multiplier * 100));
          } else {
            // 捕捉失敗時，自動觸發智慧降級切換
            fallbackToInject(multiplier);
          }
        }
      );
    } catch (err) {
      // 捕獲到瀏覽器受保護頁面錯誤，自動智慧切換到網飛相容模式
      fallbackToInject(multiplier);
    }
  }

  // 智慧降級至網飛相容注入核心
  async function fallbackToInject(multiplier) {
    setMode('inject');
    showNotice('偵測到受版權保護頁面，已自動切換至【網飛相容模式】！');
    await startInjectBoosting(multiplier);
  }

  // 啟動網頁元素注入核心
  async function startInjectBoosting(multiplier) {
    try {
      await chrome.runtime.sendMessage({ target: 'background', type: 'ENSURE_INJECTOR', tabId: currentTab.id });
      chrome.tabs.sendMessage(
        currentTab.id,
        { target: 'content', type: 'START_ELEMENT_BOOST', volume: multiplier },
        (res) => {
          if (chrome.runtime.lastError || (res && !res.success)) {
            alert('啟動失敗：未在目前頁面偵測到正在播放的影片播放器，請確認影片是否正在播放中。');
          } else {
            updateInterfaceState(true, Math.round(multiplier * 100));
          }
        }
      );
    } catch (e) {
      alert('無法在此頁面注入放大程式。');
    }
  }

  // 停止聲音放大
  function stopBoosting() {
    if (currentMode === 'tab') {
      chrome.runtime.sendMessage(
        { target: 'offscreen', type: 'STOP_AUDIO_BOOST', tabId: currentTab.id },
        () => updateInterfaceState(false, 100)
      );
    } else {
      chrome.tabs.sendMessage(
        currentTab.id,
        { target: 'content', type: 'RESET_ELEMENT_VOLUME' },
        () => updateInterfaceState(false, 100)
      );
    }
  }

  // 調整音量
  function applyVolume(multiplier) {
    if (currentMode === 'tab') {
      chrome.runtime.sendMessage({
        target: 'offscreen',
        type: 'SET_TAB_VOLUME',
        tabId: currentTab.id,
        volume: multiplier
      });
    } else {
      chrome.tabs.sendMessage(currentTab.id, {
        target: 'content',
        type: 'SET_ELEMENT_VOLUME',
        volume: multiplier
      });
    }
  }

  // 滑桿即時拖曳事件
  volumeSlider.addEventListener('input', (e) => {
    const percent = parseInt(e.target.value, 10);
    volumePercent.textContent = percent + '%';
    const multiplier = percent / 100.0;

    if (isBoosting) {
      applyVolume(multiplier);
    }
  });

  // 滑桿放開時自動啟動
  volumeSlider.addEventListener('change', (e) => {
    const percent = parseInt(e.target.value, 10);
    const multiplier = percent / 100.0;
    if (!isBoosting && percent !== 100) {
      if (currentMode === 'tab') {
        startTabBoosting(multiplier);
      } else {
        startInjectBoosting(multiplier);
      }
    }
  });

  // 主切換按鈕
  toggleBtn.addEventListener('click', () => {
    if (isBoosting) {
      stopBoosting();
    } else {
      const multiplier = parseInt(volumeSlider.value, 10) / 100.0;
      if (currentMode === 'tab') {
        startTabBoosting(multiplier);
      } else {
        startInjectBoosting(multiplier);
      }
    }
  });

  // 重設按鈕
  resetBtn.addEventListener('click', () => {
    volumeSlider.value = 100;
    volumePercent.textContent = '100%';
    if (isBoosting) {
      applyVolume(1.0);
    }
  });

  // 頁面初始化後先檢查狀態
  checkStatus();
});
