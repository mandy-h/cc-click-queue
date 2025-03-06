window.addEventListener('DOMContentLoaded', () => {
  if (window.location.hash === '#done') {
    const toast = Message.createToast('Queue finished', 'success');
    const mainContent = document.querySelector('#megaContent center');
    mainContent.insertBefore(toast, mainContent.firstChild);
  }
});
