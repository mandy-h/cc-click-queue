const Queue = (function () {
  async function add(adoptableIds, targetLevel) {
    const result = await ExtensionStorage.get({ queue: [] });
    const { queue } = result;

    // Remove duplicate IDs from user input
    const uniqueIds = new Set(adoptableIds);
    // Filter out IDs that are already in the queue
    const ids = [];
    const duplicateIds = [];
    uniqueIds.forEach((id) => {
      const idIsInQueue = queue.findIndex((item) => item.id === id) > -1;
      if (idIsInQueue) {
        duplicateIds.push(id);
      } else {
        ids.push(id);
      }
    });

    // Add to queue
    ids.forEach((id) => {
      queue.push({
        id,
        target: targetLevel
      });
    });

    ExtensionStorage.set({ queue });

    Events.publish('queue/added-adopts', { ids, duplicateIds });
  }

  async function remove(id) {
    const result = await ExtensionStorage.get(['queue']);
    const queue = result.queue.filter((el) => el.id !== id);
    ExtensionStorage.set({ queue });
  }

  async function moveToFront(id) {
    const result = await ExtensionStorage.get(['queue']);
    const itemToMove = result.queue.find((el) => el.id === id);
    const queue = [itemToMove, ...result.queue.filter((el) => el.id !== id)];
    ExtensionStorage.set({ queue });
  }

  function clear() {
    ExtensionStorage.set({ queue: [] });
  }

  function startQueue() {
    (ExtensionStorage.get(['queue'])).then((result) => {
      if (result.queue.length > 0) {
        window.open(`https://www.clickcritters.com/clickexchange.php?act=choose&adoptID=${result.queue[0].id}`);
      }
    });
  }

  function createQueueItem(id, target) {
    const item = document.createElement('tr');
    item.classList.add('queue-item');
    item.dataset.id = id;
    item.dataset.target = target;
    item.innerHTML = `
      <td class="queue-item__id">${id}</td>
      <td class="queue-item__img"><img src="https://www.clickcritters.com/images/adoptables/${id}.gif" /></td>
      <td class="queue-item__target">${target}</td>
      <td>
        <button class="js-move-to-front" title="Move to top"><img src="/icons/arrow-top.svg" alt="Arrow pointing to top" /></button>
        <button class="js-remove-adopt" title="Delete"><img src="/icons/delete.svg" alt="Trash can" /></button>
      </td>
    `;

    return item;
  }

  /**
   * Diffing algorithm for queue rendering.
   * @param {Array} newData - New data to display
   * @param {HTMLElement} parent - Parent node that holds the queue items
   */
  function queueDiff(newData, parent) {
    // Remove extra elements from DOM
    let extras = parent.children.length - newData.length;
    while (extras > 0) {
      parent.removeChild(parent.lastChild);
      extras--;
    }

    newData.forEach((newObj, index) => {
      const node = parent.children[index];
      const newId = newObj.id;
      const newTarget = newObj.target;

      // A new item needs to be added
      if (!node) {
        parent.appendChild(createQueueItem(newId, newTarget));
        return;
      }
      // Replace the row content if ID doesn't match
      if (newId !== node.dataset.id) {
        node.dataset.id = newId;
        node.dataset.target = newTarget;
        node.querySelector('.queue-item__id').textContent = newId;
        node.querySelector('.queue-item__target').textContent = newTarget;
        node.querySelector('.queue-item__img > img').src = `https://www.clickcritters.com/images/adoptables/${newId}.gif`;
      }
    });
  }

  async function render() {
    const result = await ExtensionStorage.get({ queue: [] });
    const queueTable = document.querySelector('#js-queue tbody');
    queueDiff(result.queue, queueTable);

    document.querySelector('.js-queue-count').innerHTML
      = `You have <strong>${result.queue.length}</strong> adoptables left to click!`;
  }

  function init() {
    render();

    document.querySelector('.js-clear-queue').addEventListener('click', clear);
    document.querySelector('.js-start-queue').addEventListener('click', startQueue);
    document.querySelector('#js-queue').addEventListener('click', (event) => {
      const target = event.target;
      const queueItem = event.target.closest('.queue-item');
      if (target.classList.contains('js-remove-adopt')) {
        remove(queueItem.dataset.id);
      } else if (target.classList.contains('js-move-to-front')) {
        moveToFront(queueItem.dataset.id);
      }
    });

    Events.subscribe('imageDrop/form-submitted', (data) => {
      add(data.adoptIds, data.targetLevel);
    });

    chrome.storage.onChanged.addListener((changes) => {
      if (changes.queue) {
        render();
      }
    });
  }

  return {
    init
  };
})();
