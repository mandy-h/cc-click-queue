chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.local.get({ queue: [] }, (result) => {
    chrome.browserAction.setBadgeText({ text: (result.queue.length).toString() });
  });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.queueLength !== undefined) {
    chrome.browserAction.setBadgeText({ text: (request.queueLength).toString() });
  }
});