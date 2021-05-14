const ExtensionStorage = (function () {
  /**
   * Retrieves extension data.
   * @param {Object|String[]|String} [data] - Keys to be retrieved, with optional default values
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
