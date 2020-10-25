window.addEventListener('DOMContentLoaded', () => {
  if (window.location.hash === '#done') {
    let el = document.createElement('div');
    el.style.cssText = `
      background-color: lightgreen;
      margin-bottom: 10px;
      padding: 5px;
    `;
    el.innerText = 'Queue finished';
    const mainContent = document.querySelector('center');
    mainContent.insertBefore(el, mainContent.firstChild);
  }
});