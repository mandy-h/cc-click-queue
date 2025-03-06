export const getAdoptableLevel = () => {
  const pageText = document.querySelector('center').innerText;
  const levelText = pageText.match(/Total: \d+/);
  if (levelText) {
    const level = parseInt(levelText[0].substring(7), 10) + 1; // Adding 1 because the total level displayed is off by 1
    const bonusLevels = (pageText.match(/(bonus credit!)|(instant level!)/g) || []).length;
    return level + bonusLevels;
  }
};

export const renderLevelProgress = (currentLevel, targetLevel) => {
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
};

export const switchToNextAdoptable = async (adoptId) => {
  const mainContent = document.querySelector('center');
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

    document.querySelector('.js-toast-message')?.remove();
    const successToast = Message.createToast('Switched to next adoptable in queue', 'success');
    mainContent.insertBefore(successToast, mainContent.firstChild);
  } catch (error) {
    document.querySelector('.js-toast-message')?.remove();
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