function renderQueue() {
  chrome.storage.local.get({ queue: [] }, (result) => {
    const queueTable = document.querySelector('#js-queue tbody');

    // Clear table
    queueTable.innerHTML = '';
    // Create rows
    result.queue.forEach((el, index) => {
      let item = document.createElement('tr');
      item.innerHTML = `
        <td>
          ${el.id}
        </td>
        <td>
          <img src="https://www.clickcritters.com/images/adoptables/${el.id}.gif" />
        </td>
        <td>
          ${el.target}
        </td>
        <td>
          <button class="js-move-to-front" data-index="${index}"><img src="../icons/arrow-top.svg" /></button>
          <button class="js-remove-adopt" data-index="${index}"><img src="../icons/delete.svg" /></button>
        </td>
      `;
      queueTable.appendChild(item);
    });
  });
}

function addToQueue(adoptableIds, targetLevel) {
  chrome.storage.local.get({ queue: [] }, (result) => {
    const queue = result.queue;

    adoptableIds.forEach((id) => {
      queue.push({
        id,
        target: targetLevel
      });
    });

    chrome.storage.local.set({ queue: queue }, () => {
      renderQueue();
    });
  });
}

function removeFromQueue(itemIndex) {
  chrome.storage.local.get('queue', (result) => {
    const queue = result.queue.filter((el, index) => index != itemIndex);
    chrome.storage.local.set({ queue: queue }, () => {
      renderQueue();
    });
  });
}

function moveToFrontOfQueue(itemIndex) {
  chrome.storage.local.get('queue', (result) => {
    const queue = [result.queue[itemIndex], ...result.queue.filter((el, index) => index != itemIndex)];
    chrome.storage.local.set({ queue: queue }, () => {
      renderQueue();
    });
  });
}

function clearQueue() {
  chrome.storage.local.set({ queue: [] }, () => {
    renderQueue();
  });
}

function startQueue() {
  chrome.storage.local.get('queue', (result) => {
    if (result.queue.length > 0) {
      window.open(`https://www.clickcritters.com/clickexchange.php?act=choose&adoptID=${result.queue[0].id}`);
    }
  });
}

function handleFormSubmit(event) {
  event.preventDefault();
  const addAdoptsForm = event.currentTarget;
  const formData = new FormData(addAdoptsForm);

  addToQueue(
    formData.get('adopt-ids').split(','),
    formData.get('target-level')
  );
  addAdoptsForm.reset();
  document.querySelector('#js-image-drop-area').innerHTML = '';
}

// Drop area

function handleDragover(event) {
  event.preventDefault();
  document.querySelector('#js-image-drop-area').classList.add('image-drop-area--active');
}

function handleDrop(event) {
  event.preventDefault();
  const dropArea = document.querySelector('#js-image-drop-area');
  const dropData = event.dataTransfer.getData('text/html');
  const parser = new DOMParser();
  const droppedImages = parser.parseFromString(dropData, 'text/html').body
    .querySelectorAll('img[src*="/images/adoptables/"]');
  const adoptableIds = Array.from(droppedImages).map((el) => el.src.match(/\d+/));

  dropArea.classList.remove('image-drop-area--active');
  droppedImages.forEach((el) => {
    dropArea.appendChild(el);
  });

  const adoptIdsInput = document.querySelector('#js-add-adopts input[name="adopt-ids"]');
  if (adoptIdsInput.value === '') {
    adoptIdsInput.value += adoptableIds;
  } else {
    adoptIdsInput.value += `,${adoptableIds}`;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  /* =============== Event listeners =============== */
  document.querySelector('#js-add-adopts').addEventListener('submit', handleFormSubmit);
  document.addEventListener('drop', handleDrop);
  document.addEventListener('dragover', handleDragover);
  document.querySelector('.js-clear-queue').addEventListener('click', clearQueue);
  document.querySelector('.js-start-queue').addEventListener('click', startQueue);
  document.querySelector('#js-queue').addEventListener('click', (event) => {
    if (event.target.classList.contains('js-remove-adopt')) {
      removeFromQueue(event.target.dataset.index);
    } else if (event.target.classList.contains('js-move-to-front')) {
      moveToFrontOfQueue(event.target.dataset.index);
    }
  });

  /* =============== Code to run =============== */
  renderQueue();
});