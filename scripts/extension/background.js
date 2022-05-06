chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get({ queue: [] }, (result) => {
    chrome.action.setBadgeText({ text: (result.queue.length).toString() });
  });

  // Set default extension settings
  chrome.storage.local.set({ view: 'list' });
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.queue) {
    chrome.action.setBadgeText({ text: (changes.queue.newValue.length).toString() });
  }
});
