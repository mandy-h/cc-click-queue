/**
 * Core functionality for the CE-DO feature
 */
export function getAdoptableLevel() {
  const levelText = document.querySelector('center').innerText.match(/Total: \d+/);
  if (levelText) {
    const level = parseInt(levelText[0].substring(7), 10) + 1;
    return level;
  }
}

export function renderLevelProgress(currentLevel, targetLevel) {
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

export async function handleQueueUpdate(ExtensionStorage, currentLevel, queue) {
  if (queue.length === 0) {
    return;
  }

  const targetLevel = queue[0].target;
  renderLevelProgress(currentLevel, targetLevel);

  if (currentLevel >= targetLevel) {
    queue.shift();
    await ExtensionStorage.set({ queue });

    if (queue.length > 0) {
      return switchToNextAdoptable(queue[0].id);
    } else {
      window.location = 'https://www.clickcritters.com/clickexchange.php?act=choose#done';
    }
  }
}

async function switchToNextAdoptable(adoptId) {
  const mainContent = document.querySelector('center');
  const loadingToast = Message.createToast('Loading...', 'info');
  mainContent.insertBefore(loadingToast, mainContent.firstChild);

  try {
    const response = await fetch(
      `https://www.clickcritters.com/clickexchange.php?act=choose&adoptID=${adoptId}`,
      { method: 'GET' }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to switch adoptable: ${response.status}`);
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
} 