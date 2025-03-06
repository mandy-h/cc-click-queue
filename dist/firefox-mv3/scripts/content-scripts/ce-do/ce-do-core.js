const SELECTORS = {
  REGULAR_CE_CONTENT: '#megaContent > center',
  LIGHT_CE_CONTENT: 'div > center',
  CHANGE_ADOPTABLE_LINK: '[href*="act=choose"]',
  TOAST_MESSAGE: '.js-toast-message',
};

export const getAdoptableLevel = () => {
  const pageText = document.querySelector(SELECTORS.REGULAR_CE_CONTENT)?.innerText
    || document.querySelector(SELECTORS.LIGHT_CE_CONTENT)?.innerText;
  const levelText = pageText.match(/Total: \d+/);
  if (!levelText) {
    return -1;
  }

  let level = parseInt(levelText[0].substring(7), 10);
  if (window.location.search.indexOf('act=doCE') > -1) {
    // On the 'doCE' page, the level is off by 1
    level += 1;
  }
  const bonusLevels = (pageText.match(/(bonus credit!)|(instant level!)/g) || []).length;
  return level + bonusLevels;
};

/**
 * Renders the level progress bar.
 * @param {number} currentLevel - The current level
 * @param {number} targetLevel - The target level
 */
export const renderLevelProgress = (currentLevel, targetLevel) => {
  const progress = document.createElement('div');
  progress.classList.add('progress-bar-wrapper');
  progress.innerHTML = `
    <p>Level progress: ${currentLevel} / ${targetLevel} (<strong>${Math.max(0, targetLevel - currentLevel)}</strong> more credits to go!)</p>
    <div class="progress-bar">
      <div class="progress-bar__foreground" style="width: ${(currentLevel / targetLevel * 100).toFixed(2)}%;"></div>
    </div>
  `;

  const changeAdoptLink = document.querySelector(SELECTORS.CHANGE_ADOPTABLE_LINK);
  if (changeAdoptLink) {
    if (window.location.search.indexOf('act=doCE') > -1) {
      // Only the light CE has a change adoptable link on the 'doCE' page
      document.querySelector(SELECTORS.LIGHT_CE_CONTENT).insertBefore(progress, changeAdoptLink.nextElementSibling);
    } else {
      // Both the light CE and regular CE have a change adoptable link on the first CE question page
      (changeAdoptLink).closest('table').after(progress);
    }
  }
};

export const switchToNextAdoptable = async (adoptId) => {
  const mainContent = document.querySelector(SELECTORS.REGULAR_CE_CONTENT)
    || document.querySelector(SELECTORS.LIGHT_CE_CONTENT);
  const loadingToast = Message.createToast('Loading...', 'info');
  mainContent.insertBefore(loadingToast, mainContent.firstChild);

  try {
    const response = await fetch(
      `https://www.clickcritters.com/clickexchange.php?act=choose&adoptID=${adoptId}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      throw new Error(`Failed to switch adoptable`);
    }

    document.querySelector(SELECTORS.TOAST_MESSAGE)?.remove();
    const successToast = Message.createToast('Switched to next adoptable in queue', 'success');
    mainContent.insertBefore(successToast, mainContent.firstChild);
  } catch (error) {
    document.querySelector(SELECTORS.TOAST_MESSAGE)?.remove();
    const errorToast = Message.createToast(`Error: ${error.message}`, 'error');
    mainContent.insertBefore(errorToast, mainContent.firstChild);
    throw error;
  }
};

export const handleQueueUpdate = async (
  currentLevel,
  extensionStorageDep,
  renderLevelProgressDep = renderLevelProgress,
  switchToNextAdoptableDep = switchToNextAdoptable
) => {
  // Use extensionStorageDep if provided, otherwise import the ExtensionStorage module
  let ExtensionStorage;
  if (extensionStorageDep) {
    ExtensionStorage = extensionStorageDep;
  } else {
    const { default: importedExtensionStorage } = await import('../../modules/ExtensionStorage.js');
    ExtensionStorage = importedExtensionStorage;
  }

  const { queue } = await ExtensionStorage.get({ queue: [] });
  const targetLevel = queue[0].target;
  renderLevelProgressDep(currentLevel, targetLevel);

  if (currentLevel >= targetLevel) {
    queue.shift();
    await ExtensionStorage.set({ queue });

    if (queue.length > 0) {
      switchToNextAdoptableDep(queue[0].id);
    } else {
      window.location = 'https://www.clickcritters.com/clickexchange.php?act=choose#done';
    }
  }
};