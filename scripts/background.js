chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.local.get({ queue: [] }, (result) => {
    chrome.browserAction.setBadgeText({ text: (result.queue.length).toString() });
  });
});

chrome.storage.onChanged.addListener(function (changes, namespace) {
  if (changes.queue) {
    chrome.browserAction.setBadgeText({ text: (changes.queue.newValue.length).toString() });
  }
});