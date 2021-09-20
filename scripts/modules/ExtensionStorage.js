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
