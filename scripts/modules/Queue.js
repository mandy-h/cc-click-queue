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

  async function move(id, position) {
    const result = await ExtensionStorage.get(['queue']);
    const itemToMove = result.queue.find((el) => el.id === id);
    let queue;

    if (position === 'front') {
      queue = [itemToMove, ...result.queue.filter((el) => el.id !== id)];
    } else if (position === 'end') {
      queue = [...result.queue.filter((el) => el.id !== id), itemToMove];
    }

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
    const item = document.createElement('div');
    item.classList.add('queue-item');
    item.dataset.id = id;
    item.dataset.target = target;
    item.innerHTML = `
      <div class="queue-item__id">${id}</div>
      <div class="queue-item__img"><a href="https://www.clickcritters.com/youradoptables.php?act=code&id=${id}"><img src="https://www.clickcritters.com/images/adoptables/${id}.gif" /></a></div>
      <div class="queue-item__target">${target}</div>
      <div class="item-actions">
        <button class="js-item-actions-toggle item-actions__toggle btn--no-bg" title="Open Menu"><img src="/icons/more-horiz.svg" alt="Three horizontal dots" /></button>
        <!--<ul class="js-item-actions item-actions__buttons">
          <li><button class="js-item-action--edit item-actions__button" title="Edit">
            <img src="/icons/edit.svg" alt="Edit" /></button></li>
          <li><button class="js-item-action--move-front item-actions__button" title="Move to front">
            <img src="/icons/arrow-top.svg" alt="Arrow pointing to top" /></button></li>
          <li><button class="js-item-action--move-end item-actions__button" title="Move to end">
            <img src="/icons/arrow-bottom.svg" alt="Arrow pointing to bottom" /></button></li>
          <li><button class="js-item-action--delete item-actions__button" title="Delete">
            <img src="/icons/delete.svg" alt="Trash can" /></button></li>
        </ul>-->
      </div>
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
        node.querySelector('.queue-item__img img').src = `https://www.clickcritters.com/images/adoptables/${newId}.gif`;
        node.querySelector('.queue-item__img a').href = `https://www.clickcritters.com/youradoptables.php?act=code&id=${newId}`;
      }
      // Update target
      if (newTarget !== node.dataset.target) {
        node.dataset.target = newTarget;
        node.querySelector('.queue-item__target').textContent = newTarget;
      }
    });
  }

  async function render() {
    const result = await ExtensionStorage.get({ queue: [] });
    const queueTable = document.querySelector('#js-queue .queue__body');
    queueDiff(result.queue, queueTable);

    document.querySelector('.js-queue-count').innerHTML
      = `You have <strong>${result.queue.length}</strong> adoptables left to click!`;
  }

  function renderView(view) {
    const queue = document.querySelector('#js-queue');
    if (view === 'list') {
      queue.classList.add('list')
      queue.classList.remove('grid');
      document.querySelector('#js-btn--list-view').classList.add('is-active');
      document.querySelector('#js-btn--grid-view').classList.remove('is-active');
    } else if (view === 'grid') {
      queue.classList.add('grid')
      queue.classList.remove('list');
      document.querySelector('#js-btn--grid-view').classList.add('is-active');
      document.querySelector('#js-btn--list-view').classList.remove('is-active');
    }
  }

  function handleSortAllFormSubmit(sortParam, order) {
    ExtensionStorage.get('queue').then((result) => {
      const queue = result.queue;
      if (order === 'ascending') {
        queue.sort((a, b) => a[sortParam] - b[sortParam]);
      } else if (order === 'descending') {
        queue.sort((a, b) => b[sortParam] - a[sortParam]);
      }
      return queue;
    }).then((result) => {
      ExtensionStorage.set({ queue: result });
    });
  }

  function handleEditAllFormSubmit(target) {
    ExtensionStorage.get('queue').then((result) => {
      const queue = result.queue.map((el) => {
        return { id: el.id, target }
      });
      return queue;
    }).then((result) => {
      ExtensionStorage.set({ queue: result });
    });
  }

  function init() {
    // Set list/grid view
    ExtensionStorage.get('view').then((result) => {
      renderView(result.view);
    });
    // Render queue
    render();
    // Initialize modals
    Modal.create({ id: 'js-modal--add-adopts', toggle: document.querySelector('#js-btn--add-adopts') });
    Modal.create({ id: 'js-modal--sort-all', toggle: document.querySelector('#js-btn--sort-all') });
    Modal.create({ id: 'js-modal--edit-all', toggle: document.querySelector('#js-btn--edit-all') });
    // Form submits
    document.querySelector('#js-sort-all-form').addEventListener('submit', function (event) {
      event.preventDefault();
      const data = new FormData(this);
      const param = data.get('param');
      const order = data.get('order');
      handleSortAllFormSubmit(param, order);
    });
    document.querySelector('#js-edit-all-form').addEventListener('submit', function (event) {
      event.preventDefault();
      const data = new FormData(this);
      const target = data.get('target');
      handleEditAllFormSubmit(target);
      this.reset();
    });

    // Buttons
    document.querySelector('#js-btn--clear-queue').addEventListener('click', clear);
    document.querySelector('#js-btn--start-queue').addEventListener('click', startQueue);
    document.querySelector('#js-btn--list-view').addEventListener('click', () => ExtensionStorage.set({ view: 'list' }));
    document.querySelector('#js-btn--grid-view').addEventListener('click', () => ExtensionStorage.set({ view: 'grid' }));
    document.querySelector('#js-queue').addEventListener('click', (event) => {
      const target = event.target;
      const queueItem = event.target.closest('.queue-item');
      if (target.classList.contains('js-item-action--delete')) {
        remove(queueItem.dataset.id);
      } else if (target.classList.contains('js-item-action--move-front')) {
        move(queueItem.dataset.id, 'front');
      } else if (target.classList.contains('js-item-action--move-end')) {
        move(queueItem.dataset.id, 'end');
      }
    });

    // Add adopts to queue when Add Adopts form is submitted
    Events.subscribe('imageDrop/form-submitted', (data) => {
      add(data.adoptIds, data.targetLevel);
    });

    // Re-render parts of the page when storage has changed
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.queue) {
        render();
      }
      if (changes.view) {
        renderView(changes.view.newValue);
      }
    });
  }

  return {
    init
  };
})();
