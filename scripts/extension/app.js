import ExtensionStorage from '/scripts/modules/ExtensionStorage.js';
import { init as initQueue } from '/scripts/modules/Queue.js';
import { init as initImageDrop } from '/scripts/modules/ImageDrop.js';

(async function () {
  // Initialize queue page
  const result = await ExtensionStorage.get({ queue: [] });
  window.App = {
    state: {
      queue: result.queue,
      queueLength: result.queue.length
    }
  };

  initQueue();
  initImageDrop();
})();
