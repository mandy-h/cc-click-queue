window.addEventListener('DOMContentLoaded', () => {
  if (window.location.hash === '#next') {
    const el = document.createElement('div');
    el.style.cssText = `
      background-color: lightgreen;
      margin-bottom: 10px;
      padding: 5px;
    `;
    el.innerText = 'Switched to next adoptable in queue';
    const mainContent = document.querySelector('center');
    mainContent.insertBefore(el, mainContent.firstChild);
  }
});
