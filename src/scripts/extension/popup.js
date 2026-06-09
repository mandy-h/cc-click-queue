(function () {
  function startQueue() {
    chrome.storage.local.get('queue', (result) => {
      if (result.queue.length > 0) {
        window.open(`https://www.clickcritters.com/clickgym.php?act=choose&adoptID=${result.queue[0].id}`);
      }
    });
  }

  function openQueuePage() {
    chrome.tabs.create({ url: '../queue.html' });
  }

  function renderCurrentAdopt(queue) {
    const currentAdoptHtml = queue.length > 0 ?
      `<h2 style="font-size: 1rem; white-space: nowrap;">Currently Clicking</h2> 
      <img src="https://www.clickcritters.com/images/adoptables/${queue[0].id}.gif" alt="Adoptable" width="100" height="130" />
      <p>Target level: ${queue[0].target}</p>
      `
      : `<p>The queue is empty.</p>`;

    document.querySelector('.js-currently-clicking').innerHTML = currentAdoptHtml;
  }

  window.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.js-start-queue').addEventListener('click', startQueue);
    document.querySelector('.js-edit-queue').addEventListener('click', openQueuePage);

    chrome.storage.local.get('queue', (result) => {
      if (result.queue) {
        renderCurrentAdopt(result.queue);
      }
    });

    chrome.storage.onChanged.addListener((changes) => {
      if (changes.queue) {
        renderCurrentAdopt(changes.queue);
      }
    });
  });
}());
