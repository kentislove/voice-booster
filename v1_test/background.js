// 確保離屏運算頁面存在
async function ensureOffscreenDocument() {
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT']
  });

  if (existingContexts.length > 0) {
    return;
  }

  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['USER_MEDIA'],
    justification: '專職負責分頁音訊流捕捉與音量放大運算'
  });
}

// 監聽擴充功能安裝或更新事件
chrome.runtime.onInstalled.addListener(() => {
  ensureOffscreenDocument();
});

// 當瀏覽器分頁被關閉時，通知離屏頁面釋放該分頁的聲音資源
chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.runtime.sendMessage({
    target: 'offscreen',
    type: 'STOP_AUDIO_BOOST',
    tabId: tabId
  }).catch(() => {
    // 忽略通訊離線的靜態情況
  });
});

// 監聽來自彈出選單的需求以協助確認離屏文件就緒
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.target === 'background') {
    if (message.type === 'ENSURE_OFFSCREEN') {
      ensureOffscreenDocument()
        .then(() => sendResponse({ success: true }))
        .catch((err) => sendResponse({ success: false, error: err.message }));
      return true;
    }
  }
});
