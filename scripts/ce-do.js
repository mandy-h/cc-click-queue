function getAdoptableLevel() {
  return parseInt(document.querySelector('center').innerText.match(/Total: \d+/)[0].substring(7));
}

window.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get({queue: []}, (result) => {
    if (result.queue.length === 0) {
      console.log('No adopts in queue');
    } else {
      const queue = result.queue;
      const currentLevel = getAdoptableLevel();

      if (currentLevel >= queue[0].target) {
        queue.shift();

        chrome.storage.local.set({queue: queue}, () => {
          // Send message to update extension icon
          chrome.runtime.sendMessage({queueLength: queue.length}, () => {
          });
          
          if (queue.length > 0) {
            // Choose next adopt in queue and then redirect back to main CE page (see ce-chose-adopt)
            window.location = `https://www.clickcritters.com/clickexchange.php?act=choose&adoptID=${queue[0].id}#next`;
          } else {
            // Otherwise, load choose adopt page
            window.location = 'https://www.clickcritters.com/clickexchange.php?act=choose#done';
          }
        });
      }
    }  
  });
});
