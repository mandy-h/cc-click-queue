(function () {
  /**
   * Returns the total level (current level + credits).
   * @returns {Number}
   */
  function getAdoptableLevel() {
    const levelText = document.querySelector('center').innerText.match(/Total: \d+/);
    if (levelText) {
      const level = parseInt(levelText[0].substring(7), 10) + 1; // Adding 1 because the total level displayed is usually off by 1
      return level;
    }
  }

  /**
   * Renders the level progress section.
   * @param {Number} currentLevel 
   * @param {Number} targetLevel 
   */
  function renderLevelProgress(currentLevel, targetLevel) {
    const progress = document.createElement('div');
    progress.innerHTML = `
      <p>Level progress: ${currentLevel} / ${targetLevel} (<strong>${Math.max(0, targetLevel - currentLevel)}</strong> more credits to go!)</p>
      <div class="progress-bar">
        <div class="progress-bar__foreground" style="width: ${(currentLevel / targetLevel * 100).toFixed(2)}%;"></div>
      </div>
    `;

    const changeAdoptLink = document.querySelector('[href*="clickexchange.php?act=choose"]');
    if (changeAdoptLink) {
      document.querySelector('center').insertBefore(progress, changeAdoptLink.nextElementSibling);
    }
  }

  window.addEventListener('DOMContentLoaded', async () => {
    const result = await ExtensionStorage.get(['queue', 'loop']);
    const { queue, loop } = result;
    if (queue.length === 0) {
      return;
    }

    const currentLevel = getAdoptableLevel();
    const targetLevel = queue[0].target;
    renderLevelProgress(currentLevel, targetLevel);

    if (queue.length > 0 && currentLevel >= targetLevel) {
      let switchMessage = 'Switched to next adoptable in queue';

      // Remove first adopt in queue
      const removedAdopt = queue.shift();
      // If looping is enabled, add the adopt back to the end of the queue with the new target level
      if (loop.enabled && targetLevel < loop.target) {
        removedAdopt.target = Math.min(loop.target, (Number(targetLevel) + Number(loop.increment)));
        queue.push(removedAdopt);
        switchMessage = `Switched to next adoptable in queue and added the previous adopt back to the queue`;
      }
      // Update storage
      await ExtensionStorage.set({ queue });

      if (queue.length > 0) {
        // Switch adopt
        const httpRequest = new XMLHttpRequest();
        const mainContent = document.querySelector('center');
        httpRequest.onreadystatechange = function () {
          if (this.readyState === 4 && this.status === 200) {
            // Done loading
            document.querySelector('.js-toast-message').remove();
            const toast = Message.createToast(switchMessage, 'success');
            mainContent.insertBefore(toast, mainContent.firstChild);
          } else {
            // Still loading
            if (!document.querySelector('.js-toast-message')) {
              const toast = Message.createToast('Loading...', 'info');
              mainContent.insertBefore(toast, mainContent.firstChild);
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
