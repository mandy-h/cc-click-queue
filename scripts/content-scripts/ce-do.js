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
      // Create message
      const el = document.createElement('div');
      el.classList.add('js-queue-loading-message', 'loading-overlay');
      el.innerText = 'Switching to next adoptable in queue...';

      // Append message
      const mainContent = document.querySelector('center');
      mainContent.insertBefore(el, mainContent.firstChild);
    }
  }

  window.addEventListener('DOMContentLoaded', async () => {
    const result = await ExtensionStorage.get({ queue: [], switchWithoutRedirect: true });
    const { queue, switchWithoutRedirect } = result;
    const currentLevel = getAdoptableLevel();

    if (result.queue.length > 0 && currentLevel >= queue[0].target) {
      // Remove first adopt in queue
      queue.shift();
      // Update storage
      await ExtensionStorage.set({ queue });

      if (queue.length > 0) {
        // Switch adopt
        const httpRequest = new XMLHttpRequest();
        const mainContent = document.querySelector('center');
        httpRequest.onreadystatechange = function () {
          if (this.readyState === 4 && this.status === 200) {
            // Done loading
            if (switchWithoutRedirect) {
              document.querySelector('.js-toast-message').remove();
              const toast = Message.createToast('Switched to next adoptable in queue', 'success');
              mainContent.insertBefore(toast, mainContent.firstChild);
            } else {
              window.location = 'https://www.clickcritters.com/clickexchange.php#next';
            }
          } else {
            // Still loading
            if (switchWithoutRedirect) {
              if (!document.querySelector('.js-toast-message')) {
                const toast = Message.createToast('Loading...', 'info');
                mainContent.insertBefore(toast, mainContent.firstChild);
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
    }
  });
}());
