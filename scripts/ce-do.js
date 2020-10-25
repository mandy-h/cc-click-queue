function getAdoptableLevel() {
  const levelText = document.querySelector('center').innerText.match(/Total: \d+/);
  if (levelText) {
    const level = parseInt(levelText[0].substring(7)) + 1; // Adding 1 because the total level displayed is usually off by 1
    return level;
  }
}

function addLoadingMessage() {
  if (!document.querySelector('.js-queue-loading-message')) {
    let el = document.createElement('div');
    el.classList.add('js-queue-loading-message');
    el.style.cssText = `
      align-items: center;
      background-color: rgba(245, 245, 245, 0.85);
      display: flex;
      font-size: 1.5rem;
      height: 100%;
      justify-content: center;
      left: 0;
      top: 0;
      position: absolute;
      width: 100%;
      z-index: 100;
    `;
    el.innerText = 'Switching to next adoptable in queue...';
    const mainContent = document.querySelector('center');
    mainContent.insertBefore(el, mainContent.firstChild);
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
        if (queue.length > 0) {
          // Switch adopt
          const httpRequest = new XMLHttpRequest();
          httpRequest.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
              window.location = 'https://www.clickcritters.com/clickexchange.php#next';
            } else {
              addLoadingMessage();
            }
          };

          httpRequest.open('GET', `https://www.clickcritters.com/clickexchange.php?act=choose&adoptID=${queue[0].id}`, true);
          httpRequest.send();
        } else {
          // Otherwise, load choose adopt page
          window.location = 'https://www.clickcritters.com/clickexchange.php?act=choose#done';
        }
      });
    }
  }
});