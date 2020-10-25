function getAdoptableLevel() {
  const levelText = document.querySelector('center').innerText.match(/Total: \d+/);
  if (levelText) {
    const level = parseInt(levelText[0].substring(7)) + 1; // Adding 1 because the total level displayed is usually off by 1
    return level;
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  const promise = new Promise((resolve, reject) => {
    chrome.storage.local.get({ queue: [] }, (result) => {
      resolve(result);
    });
  });
  const result = await promise;

  if (result.queue.length > 0) { // Don't do anything if queue is empty
    const queue = result.queue;
    const currentLevel = getAdoptableLevel();

    if (currentLevel >= queue[0].target) {
      // Remove first adopt in queue
      queue.shift();

      // Update storage
      chrome.storage.local.set({ queue: queue }, () => {
        // Send message to update extension icon
        chrome.runtime.sendMessage({ queueLength: queue.length });

        if (queue.length > 0) {
          // Choose next adopt in queue and then redirect back to main CE page (see ce-chose-adopt.js)
          window.location = `https://www.clickcritters.com/clickexchange.php?act=choose&adoptID=${queue[0].id}#next`;
        } else {
          // Otherwise, load choose adopt page
          window.location = 'https://www.clickcritters.com/clickexchange.php?act=choose#done';
        }
      });
    }
  }
});