(function () {
  function saveOptions() {
    chrome.storage.local.set({
      switchWithoutRedirect: document.getElementById('switch-without-redirect').checked
    }, () => {
      // Update status to let user know options were saved.
      const status = document.querySelector('.js-status');
      status.textContent = 'Options saved.';
      setTimeout(() => {
        status.textContent = '';
      }, 2000);
    });
  }

  /**
   * Sets input states from stored preferences.
   */
  function restoreOptions() {
    chrome.storage.local.get({
      switchWithoutRedirect: true
    }, (options) => {
      document.getElementById('switch-without-redirect').checked = options.switchWithoutRedirect;
    });
  }

  document.addEventListener('DOMContentLoaded', restoreOptions);
  document.querySelector('.js-save').addEventListener('click', saveOptions);
}());
