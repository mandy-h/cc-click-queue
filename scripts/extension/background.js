chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get({ queue: [] }, (result) => {
    chrome.browserAction.setBadgeText({ text: (result.queue.length).toString() });
  });

  // Set default extension settings
  chrome.storage.local.set({ view: 'list' });

  chrome.contextMenus.create({
    title: 'Add to queue',
    contexts: ['image'],
    documentUrlPatterns: ['https://clickcritters.com/*', 'https://www.clickcritters.com/*'],
    id: 'addToQueue'
  });
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.queue) {
    chrome.browserAction.setBadgeText({ text: (changes.queue.newValue.length).toString() });
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const tabId = tab.id;
  if (info.menuItemId === 'addToQueue') {
    // Load script file
    chrome.scripting.executeScript({
      target: { tabId },
      files: ['/scripts/extension/quick-add.js']
    }, () => {
      // Pass arguments to script and run it
      chrome.scripting.executeScript({
        target: { tabId },
        args: [info],
        func: (...args) => quickAdd(...args)
      });
    });
  }
});
