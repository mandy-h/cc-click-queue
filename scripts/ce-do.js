(function () {
  function getAdoptableLevel() {
    const levelText = document.querySelector('center').innerText.match(/Total: \d+/);
    if (levelText) {
      const level = parseInt(levelText[0].substring(7), 10) + 1; // Adding 1 because the total level displayed is usually off by 1
      return level;
    }
  }

  /**
   * Adds a loading message that covers entire question block.
   */
  function addLoadingMessage() {
    if (!document.querySelector('.js-queue-loading-message')) {
      const el = document.createElement('div');
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

  /**
   * Adds a custom toast message at the top of the page.
   */
  function addToastMessage(message, bgColor) {
    const el = document.createElement('div');
    el.classList.add('js-toast-message');
    el.style.cssText = `
      background-color: ${bgColor};
      font-size: 1.5em;
      margin: auto auto 8px;
      padding: 5px;
      width: 80%;
    `;
    el.innerText = message;
    const mainContent = document.querySelector('center');
    mainContent.insertBefore(el, mainContent.firstChild);
  }

  window.addEventListener('DOMContentLoaded', async () => {
    const promise = new Promise((resolve) => {
      chrome.storage.local.get({ queue: [], switchWithoutRedirect: true }, (result) => {
        resolve(result);
      });
    });
    const result = await promise;
    const { queue, switchWithoutRedirect } = result;
    const currentLevel = getAdoptableLevel();

    if (result.queue.length > 0 && currentLevel >= queue[0].target) {
      // Remove first adopt in queue
      queue.shift();

      // Update storage
      chrome.storage.local.set({ queue }, () => {
        if (queue.length > 0) {
          // Switch adopt
          const httpRequest = new XMLHttpRequest();
          httpRequest.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
              // Done loading
              if (switchWithoutRedirect) {
                document.querySelector('.js-toast-message').remove();
                addToastMessage('Switched to next adoptable in queue', 'lightgreen');
              } else {
                window.location = 'https://www.clickcritters.com/clickexchange.php#next';
              }
            } else {
              // Still loading
              if (switchWithoutRedirect) {
                if (!document.querySelector('.js-toast-message')) {
                  addToastMessage('Loading...', 'lightblue');
                }
              } else {
                addLoadingMessage();
              }
            }
          };

          httpRequest.open(
            'GET',
            `https://www.clickcritters.com/clickexchange.php?act=choose&adoptID=${queue[0].id}`,
            true
          );
          httpRequest.send();
        } else {
          // Otherwise, load choose adopt page
          window.location = 'https://www.clickcritters.com/clickexchange.php?act=choose#done';
        }
      });
    }
  });
}());
