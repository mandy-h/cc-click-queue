(async function () {
  const extensionStorageScript = chrome.runtime.getURL('/scripts/modules/ExtensionStorage.js');
  const coreModuleScript = chrome.runtime.getURL('/scripts/content-scripts/ce-do/ce-do-core.js');

  const [
    { default: ExtensionStorage },
    { getAdoptableLevel, handleQueueUpdate, displayToast, switchToNextAdoptable }
  ] = await Promise.all([
    import(extensionStorageScript),
    import(coreModuleScript)
  ]);

  const { queue = [] } = await ExtensionStorage.get({ queue: [] });
  if (queue.length === 0) {
    return;
  }

  const currentLevel = getAdoptableLevel();
  const params = new URLSearchParams(window.location.search);
  const isMainCePage = params.size === 0;
  const isQueueAdoptActive = document.querySelector(`[src*="/adoptables/${queue[0].id}.gif"]`);

  if (isMainCePage && !isQueueAdoptActive) {
    displayToast('Loading...', 'info');

    const successfullyLoaded = await switchToNextAdoptable(queue[0].id);

    if (successfullyLoaded) {
      displayToast('Queue is active, but the first adoptable was not found. Switched to first adoptable in queue.', 'info');
    } else {
      displayToast('Failed to switch adoptable', 'error');
    }
  } else if (currentLevel > -1) {
    await handleQueueUpdate(currentLevel);
  }
}());