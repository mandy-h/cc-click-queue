const Queue = (function () {
  async function add(adoptableIds, targetLevel) {
    const result = await ExtensionStorage.get({ queue: [] });
    const { queue } = result;

    // Remove duplicate IDs from user input
    const uniqueIds = new Set(adoptableIds);
    // Filter out IDs that are already in the queue
    const newIds = [];
    const duplicateIds = [];
    uniqueIds.forEach((id) => {
      const idIsInQueue = queue.findIndex((item) => item.id === id) > -1;
      if (idIsInQueue) {
        duplicateIds.push(id);
      } else {
        newIds.push(id);
      }
    });

    // Add to queue
    newIds.forEach((id) => {
      queue.push({
        id,
        target: targetLevel
      });
    });

    ExtensionStorage.set({ queue });

    Events.publish('queue/added-adopts', { newIds, duplicateIds });
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

  }

  function diff(newData, oldData) {
    newData.forEach((el, index) => {

    });
  }

  async function render() {
    const result = await ExtensionStorage.get({ queue: [] });
    const queueTable = document.querySelector('#js-queue tbody');

    // Clear table
    queueTable.innerHTML = '';
    // Create rows
    const fragment = document.createDocumentFragment();
    result.queue.forEach((el, index) => {
      const item = document.createElement('tr');
      item.classList.add('queue-item');
      item.dataset.id = el.id;
      item.dataset.target = el.target;
      item.innerHTML = `
        <td>${el.id}</td>
        <td><img src="https://www.clickcritters.com/images/adoptables/${el.id}.gif" /></td>
        <td>${el.target}</td>
        <td>
          <button class="js-move-to-front" title="Move to top"><img src="/icons/arrow-top.svg" alt="Arrow pointing to top" /></button>
          <button class="js-remove-adopt" title="Delete"><img src="/icons/delete.svg" alt="Trash can" /></button>
        </td>
      `;
      fragment.appendChild(item);
    });
    // Append rows
    queueTable.appendChild(fragment);

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
