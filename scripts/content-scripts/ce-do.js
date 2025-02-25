(async function () {
  const extensionStorageScript = chrome.runtime.getURL('/scripts/modules/ExtensionStorage.js');
  const coreModuleScript = chrome.runtime.getURL('/scripts/modules/ce-do-core.js');
  
  const [{ default: ExtensionStorage }, { getAdoptableLevel, handleQueueUpdate }] = await Promise.all([
    import(extensionStorageScript),
    import(coreModuleScript)
  ]);

  // window.addEventListener('DOMContentLoaded', async () => {
    const { queue = [] } = await ExtensionStorage.get({ queue: [] });
    if (queue.length === 0) {
      return;
    }

    const currentLevel = getAdoptableLevel();
    await handleQueueUpdate(ExtensionStorage, currentLevel, queue);
  // });
}());