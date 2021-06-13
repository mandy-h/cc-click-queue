(async function () {
  function subscribeToEvents() {
    Events.subscribe('queue/added-adopts', (data) => {
      const { newIds, duplicateIds } = data;
      if (newIds) {
        console.log(`Added ${newIds.length} adoptables`);
        // document.body.appendChild(Message.createToast(`Added ${newIds.length} adoptables`, 'success'));
      }
      if (duplicateIds) {
        console.log(`Did not add ${duplicateIds.length} duplicate adoptables`);
        // document.body.appendChild(Message.createToast('Did not add duplicate adoptables', 'error'));
      }
    });
  }

  // Initialize queue page
  const result = await ExtensionStorage.get({ queue: [] });
  window.App = {
    state: {
      queue: result.queue,
      queueLength: result.queue.length
    }
  };

  subscribeToEvents();
  Queue.init();
  ImageDrop.init();
})();
