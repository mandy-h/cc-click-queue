// const View = (function () {
//   const renderQueue = () => {
//     chrome.storage.local.get({ queue: [] }, (result) => {
//       const queueTable = document.querySelector('#js-queue tbody');

//       // Clear table
//       queueTable.innerHTML = '';
//       // Create rows
//       const fragment = document.createDocumentFragment();
//       result.queue.forEach((el, index) => {
//         const item = document.createElement('tr');
//         item.innerHTML = `
//           <td>
//             ${el.id}
//           </td>
//           <td>
//             <img src="https://www.clickcritters.com/images/adoptables/${el.id}.gif" />
//           </td>
//           <td>
//             ${el.target}
//           </td>
//           <td>
//             <button class="js-move-to-front" data-index="${index}"><img src="../icons/arrow-top.svg" /></button>
//             <button class="js-remove-adopt" data-index="${index}"><img src="../icons/delete.svg" /></button>
//           </td>
//         `;
//         fragment.appendChild(item);
//       });
//       queueTable.appendChild(fragment);

//       document.querySelector('.js-queue-count').innerHTML
//         = `You have <strong>${result.queue.length}</strong> adoptables left to click!`;
//     });
//   };

//   return {
//     renderQueue
//   };
// })();

const ExtensionStorage = (function () {
  /**
   * Retrieves extension data.
   * @param {Object|String[]} [data] - Keys to be retrieved, with optional default values
   * @returns {Promise} - Promise with the extension data
   */
  const get = (data) => {
    return new Promise((resolve) => {
      chrome.storage.local.get(data || { queue: [], switchWithoutRedirect: true }, (result) => {
        resolve(result);
      });
    });
  };

  /**
   * Sets data in the browser storage.
   * @param {Object} data - Object with key/value pairs to update storage with
   * @returns {Promise}
   */
  const set = (data) => {
    return new Promise((resolve) => {
      chrome.storage.local.set(data, () => {
        resolve();
      });
    });
  };

  return {
    get,
    set
  };
})();

const Queue = (function () {
  const render = async () => {
    const result = await ExtensionStorage.get({ queue: [] });
    const queueTable = document.querySelector('#js-queue tbody');

    // Clear table
    queueTable.innerHTML = '';
    // Create rows
    const fragment = document.createDocumentFragment();
    result.queue.forEach((el, index) => {
      const item = document.createElement('tr');
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
      fragment.appendChild(item);
    });
    queueTable.appendChild(fragment);

    document.querySelector('.js-queue-count').innerHTML
      = `You have <strong>${result.queue.length}</strong> adoptables left to click!`;
  };

  const add = async (adoptableIds, targetLevel) => {
    const result = await ExtensionStorage.get({ queue: [] });
    const { queue } = result;

    adoptableIds.forEach((id) => {
      queue.push({
        id,
        target: targetLevel
      });
    });

    await ExtensionStorage.set({ queue });
    Queue.render();
  };

  const remove = async (itemIndex) => {
    const result = await ExtensionStorage.get(['queue']);
    const queue = result.queue.filter((el, index) => index !== itemIndex);
    await ExtensionStorage.set({ queue });
    Queue.render();
  };

  const moveToFront = async (itemIndex) => {
    const result = await ExtensionStorage.get(['queue']);
    const queue = [result.queue[itemIndex], ...result.queue.filter((el, index) => index !== itemIndex)];
    await ExtensionStorage.set({ queue });
    Queue.render();
  };

  const clear = async () => {
    await ExtensionStorage.set({ queue: [] });
    Queue.render();
  };

  return {
    add,
    remove,
    moveToFront,
    clear,
    render
  };
})();

(function () {
  function startQueue() {
    (ExtensionStorage.get(['queue'])).then((result) => {
      if (result.queue.length > 0) {
        window.open(`https://www.clickcritters.com/clickexchange.php?act=choose&adoptID=${result.queue[0].id}`);
      }
    });
  }

  function handleFormSubmit(event) {
    event.preventDefault();
    const addAdoptsForm = event.currentTarget;
    const formData = new FormData(addAdoptsForm);

    Queue.add(
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
    const droppedImageUrls = Array.from(parser.parseFromString(dropData, 'text/html').body
      .querySelectorAll('img[src*="/images/adoptables/"]')).map((image) => image.src);
    const adoptableIds = droppedImageUrls.map((url) => url.match(/\d+/));

    dropArea.classList.remove('image-drop-area--active');
    const fragment = document.createDocumentFragment();
    droppedImageUrls.forEach((url) => {
      const image = document.createElement('img');
      image.src = url;
      fragment.appendChild(image);
    });
    dropArea.appendChild(fragment);

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
    document.querySelector('.js-clear-queue').addEventListener('click', Queue.clear);
    document.querySelector('.js-start-queue').addEventListener('click', startQueue);
    document.querySelector('#js-queue').addEventListener('click', (event) => {
      if (event.target.classList.contains('js-remove-adopt')) {
        Queue.remove(Number(event.target.dataset.index));
      } else if (event.target.classList.contains('js-move-to-front')) {
        Queue.moveToFront(Number(event.target.dataset.index));
      }
    });

    /* =============== Code to run =============== */
    Queue.render();
  });
}());
