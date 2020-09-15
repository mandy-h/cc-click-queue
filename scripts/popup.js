function startQueue() {
  chrome.storage.local.get('queue', (result) => {
    if (result.queue.length > 0) {
      window.open(`https://www.clickcritters.com/clickexchange.php?act=choose&adoptID=${result.queue[0].id}`);
    }
  });
}

window.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.js-start-queue').addEventListener('click', startQueue);
  document.querySelector('.js-edit-queue').addEventListener('click', () => {
    window.open(
      '../queue.html',
      '_blank',
      'scrollbars=yes,resizable=yes'
    );
  });
});