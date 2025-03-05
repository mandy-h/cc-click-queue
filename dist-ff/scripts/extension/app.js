import { init as initQueue } from '/scripts/modules/Queue/Queue.js';
import { init as initImageDrop } from '/scripts/modules/ImageDrop.js';

(async function () {
  // Initialize queue page
  initQueue();
  initImageDrop();
})();
