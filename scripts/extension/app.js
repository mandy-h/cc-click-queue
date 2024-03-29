(async function () {
  // Initialize queue page
  const result = await ExtensionStorage.get({ queue: [] });
  window.App = {
    state: {
      queue: result.queue,
      queueLength: result.queue.length
    }
  };

  Queue.init();
  ImageDrop.init();
})();
