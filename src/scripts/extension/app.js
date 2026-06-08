import { init as initImageDrop } from '/scripts/modules/ImageDrop.js';
import { init as initQueue } from '/scripts/modules/Queue/Queue.js';
import { init as initQueueHistory } from '/scripts/modules/QueueHistory/QueueHistory.js';

(async function () {
  // Initialize queue page
  initQueue();
  initImageDrop();
  initQueueHistory();
})();
