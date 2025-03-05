(async function () {
  const extensionStorageScript = chrome.runtime.getURL('/scripts/modules/ExtensionStorage.js');
  const coreModuleScript = chrome.runtime.getURL('/scripts/content-scripts/ce-do/ce-do-core.js');
  // const extensionStorageScript = chrome.runtime.getURL('ExtensionStorage.js');
  // const coreModuleScript = chrome.runtime.getURL('ce-do-core.js');

  const [{ default: ExtensionStorage }, { getAdoptableLevel, handleQueueUpdate }] = await Promise.all([
    import(/* @vite-ignore */ extensionStorageScript),
    import(/* @vite-ignore */ coreModuleScript)
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