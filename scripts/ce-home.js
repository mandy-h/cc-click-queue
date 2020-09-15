window.addEventListener('DOMContentLoaded', () => {
  if (window.location.hash === '#next') {
    let el = document.createElement('div');
    el.style.cssText = `
      background-color: lightgreen;
      margin-bottom: 10px;
      padding: 5px;
    `;
    el.innerText = 'Switched to next adoptable in queue';
    const mainContent = document.querySelector('center');
    mainContent.insertBefore(el, mainContent.firstChild);
  }

  // const currentAdoptId = document.querySelector('img[src*="/images/adoptables/"]').src.match(/\d+/)[0];
  // chrome.storage.local.get({queue: []}, (result) => {
  //   const queueIds = result.queue.map((el) => el.id);
  //   if (queueIds.indexOf(currentAdoptId) === -1) {
  //     // Adopt ID isn't in queue, so stop clicking queue
  //   }
  // });
});