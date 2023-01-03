/**
 * Functionality to add adopts to the queue via context menu.
 * @param {Object} info - info object passed from chrome.contextMenus.onClicked
 */
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

  // Copied from ImageDrop.js
  function parseIdsAndImagesFromHtml(htmlString) {
    const parser = new DOMParser();
    const imageUrls = Array.from(parser.parseFromString(htmlString, 'text/html')
      .body.querySelectorAll('img[src*="/images/adoptables/"]'))
      .map((image) => image.src);
    const adoptableIds = imageUrls.map((url) => url.match(/\d+/)?.[0]);

    return { adoptableIds, imageUrls };
  }

  /**
   * Returns HTML of a highlighted selection.
   * [Source]{@link https://stackoverflow.com/a/5084044}
   */
  function getHtmlOfSelection() {
    let range;
    if (document.selection && document.selection.createRange) {
      range = document.selection.createRange();
      return range.htmlText;
    } else if (window.getSelection) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        range = selection.getRangeAt(0);
        const clonedSelection = range.cloneContents();
        const div = document.createElement('div');
        div.appendChild(clonedSelection);
        return div.innerHTML;
      } else {
        return '';
      }
    } else {
      return '';
    }
  }

  (function init() {
    const targetLevel = window.prompt('Enter target level:');
    const selection = getHtmlOfSelection();

    if (selection) {
      // User right-clicked on a highlighted selection
      const selection = getHtmlOfSelection();
      const { adoptableIds } = parseIdsAndImagesFromHtml(selection);
      add(adoptableIds, targetLevel);
    } else {
      // User right-clicked on an image
      const adoptableId = info.srcUrl.includes('/images/adoptables/') && info.srcUrl.match(/\d+/);
      if (typeof adoptableId?.[0] === 'string' && targetLevel) {
        add(adoptableId, targetLevel);
      }
    }
  }());
}
