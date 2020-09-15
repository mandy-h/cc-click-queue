window.addEventListener('DOMContentLoaded', () => {
  if (window.location.hash === '#next') {
    // Redirect back to main CE page after setting next adoptable
    window.location = 'https://www.clickcritters.com/clickexchange.php#next';
  }

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