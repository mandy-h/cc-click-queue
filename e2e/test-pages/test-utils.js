// All JS code for test pages have to be located in an external JS file (i.e. this one), since chrome-extension:// pages do not allow inline JS.

window.addEventListener('DOMContentLoaded', () => {
  if (window.location.href.includes('clickexchange.html') || window.location.href.includes('clickexchange-do.html')) {
    // Proxy to keep track of level
    const levelProxy = new Proxy({ currentLevel: 1 }, {
      get: (obj, property) => {
        if (property === 'currentLevel') {
          return obj.currentLevel;
        }
      },
      set: (obj, property, value) => {
        obj[property] = value;
        if (property === 'currentLevel') {
          document.querySelector('[data-testid="total"]').textContent = value;
        }
        return true;
      },
    });

    document.querySelector('#increment-button')?.addEventListener('click', () => {
      levelProxy.currentLevel++;
    });
  }
});
