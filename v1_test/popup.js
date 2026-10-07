document.addEventListener('DOMContentLoaded', async () => {
  const volumeSlider = document.getElementById('volumeSlider');
  const volumePercent = document.getElementById('volumePercent');
  const badge = document.getElementById('badge');
  const toggleBtn = document.getElementById('toggleBtn');
  const resetBtn = document.getElementById('resetBtn');
  const tabTitle = document.getElementById('tabTitle');

  let currentTab = null;
  let isBoosting = false;

  // 取得目前正在檢視的作用中分頁
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTab = tab;

  if (currentTab) {
    tabTitle.textContent = '目標分頁：' + (currentTab.title || '無標題分頁');
  } else {
    tabTitle.textContent = '無法取得當前分頁';
    return;
  }

  // 確保背景離屏運算環境已經就緒
  await chrome.runtime.sendMessage({ target: 'background', type: 'ENSURE_OFFSCREEN' });

  // 向離屏運算核心查詢當前分頁的音訊處理狀態
  chrome.runtime.sendMessage(
    { target: 'offscreen', type: 'GET_TAB_STATUS', tabId: currentTab.id },
    (response) => {
      if (response && response.isBoosting) {
        isBoosting = true;
        const currentMultiplier = response.volume || 1.0;
        const currentPercentage = Math.round(currentMultiplier * 100);
        updateInterfaceState(true, currentPercentage);
      } else {
        updateInterfaceState(false, 100);
      }
    }
  );

  // 更新介面狀態（按鈕文字、徽章色彩與百分比文字）
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

  // 啟動分頁聲音捕捉與放大核心
  async function startBoosting(targetMultiplier) {
    try {
      // 取得分頁音訊串流識別碼
      const streamId = await new Promise((resolve, reject) => {
        chrome.tabCapture.getMediaStreamId({ targetTabId: currentTab.id }, (id) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(id);
          }
        });
      });

      // 將識別碼傳遞至離屏核心進行音訊管線串接
      chrome.runtime.sendMessage(
        {
          target: 'offscreen',
          type: 'START_AUDIO_BOOST',
          tabId: currentTab.id,
          streamId: streamId,
          volume: targetMultiplier
        },
        (res) => {
          if (res && res.success) {
            updateInterfaceState(true, Math.round(targetMultiplier * 100));
          } else {
            alert('啟動音量放大失敗：' + (res ? res.error : '未知原因'));
          }
        }
      );
    } catch (err) {
      alert('無法擷取此分頁聲音：此頁面可能為系統保護頁面（例如空白頁或設定頁面）。');
    }
  }

  // 停止分頁聲音捕捉
  function stopBoosting() {
    chrome.runtime.sendMessage(
      { target: 'offscreen', type: 'STOP_AUDIO_BOOST', tabId: currentTab.id },
      () => {
        updateInterfaceState(false, 100);
      }
    );
  }

  // 滑桿數值變更監聽
  volumeSlider.addEventListener('input', (e) => {
    const percent = parseInt(e.target.value, 10);
    volumePercent.textContent = percent + '%';
    const multiplier = percent / 100.0;

    if (isBoosting) {
      // 若已在運作中，即時變更放大倍率
      chrome.runtime.sendMessage({
        target: 'offscreen',
        type: 'SET_TAB_VOLUME',
        tabId: currentTab.id,
        volume: multiplier
      });
    }
  });

  // 滑桿放開時，如果尚未啟用且數值大於 100%，自動協助使用者啟動
  volumeSlider.addEventListener('change', (e) => {
    const percent = parseInt(e.target.value, 10);
    const multiplier = percent / 100.0;
    if (!isBoosting && percent !== 100) {
      startBoosting(multiplier);
    }
  });

  // 主按鈕點擊切換
  toggleBtn.addEventListener('click', () => {
    if (isBoosting) {
      stopBoosting();
    } else {
      const multiplier = parseInt(volumeSlider.value, 10) / 100.0;
      startBoosting(multiplier);
    }
  });

  // 重設按鈕點擊
  resetBtn.addEventListener('click', () => {
    volumeSlider.value = 100;
    volumePercent.textContent = '100%';
    if (isBoosting) {
      chrome.runtime.sendMessage({
        target: 'offscreen',
        type: 'SET_TAB_VOLUME',
        tabId: currentTab.id,
        volume: 1.0
      });
    }
  });
});
