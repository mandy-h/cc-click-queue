function quickAdd(info) {
  // Copied from ExtensionStorage.js
  const ExtensionStorage = {
    /**
     * Retrieves extension data.
     * @param {Object|String[]|String} [data] - Keys to be retrieved, with optional default values
     * @returns {Promise} - Promise with the extension data
     */
    get(data) {
      return new Promise((resolve) => {
        chrome.storage.local.get(data || ['queue', 'view'], (result) => {
          resolve(result);
        });
      });
    },
    /**
     * Sets data in the browser storage.
     * @param {Object} data - Object with key/value pairs to update storage with
     * @returns {Promise}
     */
    set(data) {
      return new Promise((resolve) => {
        chrome.storage.local.set(data, () => {
          resolve();
        });
      });
    }
  };

  // Function to add adopt to queue, copied from Queue.js
  async function add(adoptableIds, targetLevel) {
    // Null check in case the user doesn't enter a target level in the prompt
    if (!targetLevel) {
      return;
    }

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
  }

  const targetLevel = window.prompt('Enter target level:');
  const adoptableId = info.srcUrl.includes('/images/adoptables/') && info.srcUrl.match(/\d+/);
  if (typeof adoptableId?.[0] === 'string') {
    add(adoptableId, targetLevel);
  }
}
