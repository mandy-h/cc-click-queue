chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get({ queue: [] }, (result) => {
    chrome.browserAction.setBadgeText({ text: (result.queue.length).toString() });
  });

  // Set default extension settings
  chrome.storage.local.set({ view: 'list' });
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.queue) {
    chrome.browserAction.setBadgeText({ text: (changes.queue.newValue.length).toString() });
  }
});
