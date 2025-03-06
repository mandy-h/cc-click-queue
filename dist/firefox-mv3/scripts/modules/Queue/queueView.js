import * as queueService from './queueService.js';
import ExtensionStorage from '../ExtensionStorage.js';
import Events from '../Events.js';
import createModal from '../Modal.js';

function createQueueItem(id, target) {
  const item = document.createElement('div');
  item.classList.add('queue-item');
  item.dataset.id = id;
  item.dataset.target = target;
  item.innerHTML = `
      <div class="queue-item__id">${id}</div>
      <div class="queue-item__img"><a href="https://www.clickcritters.com/youradoptables.php?act=code&id=${id}"><img src="https://www.clickcritters.com/images/adoptables/${id}.gif" /></a></div>
      <div class="queue-item__target-wrapper editable">
        <button type="button" class="js-item-action--edit editable__trigger btn--invisible" aria-label="Edit" title="Click to edit"></button>
        <span class="queue-item__target editable__text">${target}</span>
      </div>
      <div class="item-actions">
        <button class="js-item-actions-toggle item-actions__toggle btn--no-bg" title="Open menu"><img src="/icons/more-horiz.svg" alt="Three horizontal dots" /></button>
        <div class="js-item-actions item-actions__buttons button-group button-group--no-margin">
          <button class="js-item-action--move-front item-actions__button" title="Move to front">
            <img src="/icons/arrow-top.svg" alt="Arrow pointing to top" />
          </button>
          <button class="js-item-action--move-end item-actions__button" title="Move to end">
            <img src="/icons/arrow-bottom.svg" alt="Arrow pointing to bottom" />
          </button>
          <button class="js-item-action--delete item-actions__button" title="Delete">
            <img src="/icons/delete.svg" alt="Trash can" />
          </button>
        </div>
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
    parent.removeChild(parent.firstElementChild);
    extras--;
  }

  let node;
  let newId;
  let newTarget;
  newData.forEach((newObj, index) => {
    node = parent.children[index];
    newId = newObj.id;
    newTarget = newObj.target;

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
    // Update target level
    if (newTarget !== node.dataset.target) {
      node.dataset.target = newTarget;
      node.querySelector('.queue-item__target').textContent = newTarget;
    }
  });
}

async function render() {
  const queue = await queueService.getQueue();
  const queueTable = document.querySelector('#js-queue .queue__body');
  queueDiff(queue, queueTable);

  document.querySelector('.js-queue-count').innerHTML
    = `You have <strong>${queue.length}</strong> adoptables left to click!`;
}

function changeView(view) {
  const queue = document.querySelector('#js-queue');
  if (view === 'list') {
    queue.classList.add('list');
    queue.classList.remove('grid');
    document.querySelector('#js-btn--list-view').classList.add('is-active');
    document.querySelector('#js-btn--grid-view').classList.remove('is-active');
  } else if (view === 'grid') {
    queue.classList.add('grid');
    queue.classList.remove('list');
    document.querySelector('#js-btn--grid-view').classList.add('is-active');
    document.querySelector('#js-btn--list-view').classList.remove('is-active');
  }
}

function initEventHandlers() {
  const handlers = [
    {
      selector: '#js-sort-all-form',
      eventName: 'submit',
      handler: async (event) => {
        event.preventDefault();
        const data = new FormData(event.target);
        await queueService.sort(data.get('param'), data.get('order'));
      }
    },
    {
      selector: '#js-edit-all-form',
      eventName: 'submit',
      handler: async (event) => {
        event.preventDefault();
        const data = new FormData(event.target);
        await queueService.updateAllTargetLevels(data.get('target'));
        event.target.reset();
      }
    },
    {
      selector: '#js-btn--clear-queue',
      eventName: 'click',
      handler: () => {
        if (window.confirm('Do you really want to clear the queue?')) {
          queueService.clear();
        }
      }
    },
    {
      selector: '#js-btn--start-queue',
      eventName: 'click',
      handler: async () => {
        const queue = await queueService.getQueue();
        if (queue.length > 0) {
          window.open(`https://www.clickcritters.com/clickexchange.php?act=choose&adoptID=${queue[0].id}`);
        }
      }
    },
    {
      selector: '#js-btn--list-view',
      eventName: 'click',
      handler: async () => {
        await ExtensionStorage.set({ view: 'list' });
      }
    },
    {
      selector: '#js-btn--grid-view',
      eventName: 'click',
      handler: async () => {
        await ExtensionStorage.set({ view: 'grid' });
      }
    }
  ];

  handlers.forEach(({ selector, eventName, handler }) => {
    document.querySelector(selector)?.addEventListener(eventName, handler);
  });

  // Using event delegation for buttons that are dynamically added to the DOM
  document.querySelector('#js-queue').addEventListener('click', handleQueueItemAction);

  // Add adopts to queue when Add Adopts form is submitted
  Events.subscribe('imageDrop/form-submitted', ({ adoptIds, targetLevel }) => {
    queueService.add(adoptIds, targetLevel);
  });
}

function initModals() {
  const modals = [
    {
      id: 'js-modal--add-adopts',
      toggleSelector: '#js-btn--add-adopts'
    },
    {
      id: 'js-modal--sort-all',
      toggleSelector: '#js-btn--sort-all'
    },
    {
      id: 'js-modal--edit-all',
      toggleSelector: '#js-btn--edit-all'
    }
  ];

  modals.forEach(({ id, toggleSelector }) => {
    createModal({
      id,
      toggle: document.querySelector(toggleSelector)
    });
  });
}

// Re-render parts of the page when storage has changed
function addStorageListener() {
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.queue || changes.loop) {
      render();
    }
    if (changes.view) {
      changeView(changes.view.newValue);
    }
  });
}

function showEdit(id, target) {
  const queueItem = document.querySelector(`.queue-item[data-id="${id}"]`);
  // If that queue item's edit field is already present, don't do anything
  if (queueItem.querySelector('.js-target-edit')) {
    return;
  }

  // Create input element
  const el = document.createElement('input');
  el.classList.add('js-target-edit', 'editable__input');
  el.type = 'number';
  el.value = target;
  el.min = '1';
  el.required = true;

  // Set up event handlers
  el.addEventListener('blur', (event) => {
    const editField = event.currentTarget;
    if (editField.reportValidity()) {
      queueService.updateTargetLevel(editField.closest('.queue-item').dataset.id, editField.value);
      editField.remove();
    }
  });
  el.addEventListener('keydown', (event) => {
    if (event.code === 'Enter') {
      event.currentTarget.blur();
    }
  });

  // Append to DOM and focus
  queueItem.querySelector('.queue-item__target-wrapper').appendChild(el);
  el.focus();
}

async function handleQueueItemAction(event) {
  const target = event.target;
  if (!target.matches('button')) {
    return;
  }

  const queueItem = target.closest('.queue-item');
  const targetClasses = target.classList;

  if (targetClasses.contains('js-item-action--delete')) {
    await queueService.remove(queueItem.dataset.id);
  } else if (targetClasses.contains('js-item-action--move-front')) {
    await queueService.move(queueItem.dataset.id, 'front');
  } else if (targetClasses.contains('js-item-action--move-end')) {
    await queueService.move(queueItem.dataset.id, 'end');
  } else if (targetClasses.contains('js-item-action--edit')) {
    showEdit(queueItem.dataset.id, queueItem.dataset.target);
  } else if (targetClasses.contains('js-item-actions-toggle')) {
    target.classList.toggle('is-active');
  }

  // Hide the pop-out menu for a queue item after clicking on a button inside the menu
  if (target.closest('.item-actions__buttons')) {
    target.closest('.item-actions')
      .querySelector('.js-item-actions-toggle')
      .classList.remove('is-active');
  }
}

export default async function init() {
  addStorageListener();
  
  // Set list/grid view
  await ExtensionStorage.get('view').then((result) => {
    changeView(result.view);
  });
  
  // Render queue
  render();

  initEventHandlers();
  initModals();
}
