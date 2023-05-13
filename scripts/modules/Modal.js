function open(el) {
  el.classList.add('is-active');
  el.tabIndex = '0';
  document.body.classList.add('modal-open');
}

function close(el) {
  el.classList.remove('is-active');
  el.tabIndex = '-1';
  document.body.classList.remove('modal-open');
}

function createElement(id, position, header = '', body = '') {
  let el = document.createElement('template');
  el.innerHTML = `
      <div id="${id}" class="modal modal--${position}" role="dialog" tabindex="-1">
        <div class="modal-window">
          <div class="modal-window__header">${header}<button class="modal-window__close btn--no-bg"><img src="/icons/close.svg" alt="Close"></button></div>
          <div class="modal-window__body">${body}</div>
        </div>
        <div class="scrim"></div>
      </div>
    `;

  return el.content.querySelector('.modal');
}

/**
 * 
 * @param {Object} args - id, position, header, body, toggle
 * @returns {HTMLElement}
 */
export default function createModal(args) {
  const { id, position, header, body, toggle } = args;
  let el;
  if (document.getElementById(id)) {
    // Modal is in the HTML file
    el = document.getElementById(id);
  } else {
    // Create a new modal with JS
    el = createElement(id, position, header, body);
  }

  // Event handlers
  [el.querySelector('.scrim'), el.querySelector('.modal-window__close')].forEach((target) => {
    target.addEventListener('click', () => close(el));
  });
  window.addEventListener('keydown', (event) => {
    if (event.code === 'Escape') {
      close(el);
    }
  });
  toggle.addEventListener('click', () => open(el));

  return el;
}