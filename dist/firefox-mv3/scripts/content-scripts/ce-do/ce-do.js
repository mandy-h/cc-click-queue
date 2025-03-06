(async function () {
  const extensionStorageScript = chrome.runtime.getURL('/scripts/modules/ExtensionStorage.js');
  const coreModuleScript = chrome.runtime.getURL('/scripts/content-scripts/ce-do/ce-do-core.js');
  
  const [{ default: ExtensionStorage }, { getAdoptableLevel, handleQueueUpdate }] = await Promise.all([
    import(extensionStorageScript),
    import(coreModuleScript)
  ]);

  const { queue = [] } = await ExtensionStorage.get({ queue: [] });
  if (queue.length === 0) {
    return;
  }
  
  // window.addEventListener('DOMContentLoaded', async () => {
  const currentLevel = getAdoptableLevel();
  await handleQueueUpdate(currentLevel);
  // });
}());