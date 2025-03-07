/**
 * Creates the modal HTML structure.
 * @param {string} id - Modal ID
 * @param {string} position - Modal position
 * @param {string} header - Modal header content
 * @param {string} body - Modal body content
 * @returns {HTMLElement}
 */
function createModalElement(id, position, header = '', body = '') {
  const template = document.createElement('template');
  template.innerHTML = `
    <div id="${id}" class="modal modal--${position}" role="dialog" tabindex="-1">
      <div class="modal-window">
        <div class="modal-window__header">${header}<button class="modal-window__close btn--no-bg"><img src="/icons/close.svg" alt="Close"></button></div>
        <div class="modal-window__body">${body}</div>
      </div>
      <div class="scrim"></div>
    </div>
  `;

  return template.content.querySelector('.modal');
}

/**
 * Opens the modal.
 * @param {HTMLElement} modalEl - The modal element
 */
function openModal(modalEl) {
  modalEl.classList.add('is-active');
  modalEl.tabIndex = 0;
  document.body.classList.add('modal-open');
}

/**
 * Closes the modal.
 * @param {HTMLElement} modalEl - The modal element
 */
function closeModal(modalEl) {
  modalEl.classList.remove('is-active');
  modalEl.tabIndex = -1;
  document.body.classList.remove('modal-open');
};

/**
 * Attaches event handlers to the modal.
 * @param {HTMLElement} modalEl - The modal element
 * @param {HTMLElement} [toggleEl] - Optional toggle element
 */
function attachEventHandlers(modalEl, toggleEl) {
  // Close button and scrim click handlers
  [modalEl.querySelector('.scrim'), modalEl.querySelector('.modal-window__close')].forEach((target) => {
    target?.addEventListener('click', () => closeModal(modalEl));
  });

  // Escape key handler
  window.addEventListener('keydown', (event) => {
    if (event.code === 'Escape') {
      closeModal(modalEl);
    }
  });

  // Toggle button handler
  if (toggleEl) {
    toggleEl.addEventListener('click', () => openModal(modalEl));
  }
};

/**
 * Creates and sets up a modal.
 * @param {object} config - Modal configuration
 * @param {string} config.id - Modal ID
 * @param {string} config.position - Modal position
 * @param {string} [config.header] - Modal header content
 * @param {string} [config.body] - Modal body content
 * @param {HTMLElement} [config.toggle] - Toggle element
 * @returns {object} Modal controls and cleanup function
 */
export default function createModal({ id, position, header = '', body = '', toggle }) {
  let modalEl = document.getElementById(id);

  if (!modalEl) {
    modalEl = createModalElement(id, position, header, body);
    document.body.appendChild(modalEl);
  }

  attachEventHandlers(modalEl, toggle);

  return {
    element: modalEl,
    open: () => openModal(modalEl),
    close: () => closeModal(modalEl)
  };
}