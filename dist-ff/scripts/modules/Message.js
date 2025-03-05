const Message = (function () {
  /**
   * Creates a custom toast message.
   * @param {String} message
   * @param {String} [modifierClass] - A class that sets styles for a specific type of toast message
   * @returns {HTMLElement}
   */
  const createToast = (message, modifierClass) => {
    const el = document.createElement('div');
    el.classList.add('js-toast-message', 'toast-message');
    if (modifierClass !== '') {
      el.classList.add(modifierClass);
    }
    el.innerText = message;

    return el;
  };

  return {
    createToast
  };
})();