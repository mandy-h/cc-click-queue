window.addEventListener('DOMContentLoaded', () => {
  if (window.location.hash === '#next') {
    const toast = Message.createToast('Switched to next adoptable in queue', 'success');
    const mainContent = document.querySelector('center');
    mainContent.insertBefore(toast, mainContent.firstChild);
  }
});
