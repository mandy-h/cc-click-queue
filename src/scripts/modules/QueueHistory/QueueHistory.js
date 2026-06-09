import ExtensionStorage from '../ExtensionStorage.js';
import { add as addToQueue } from '../Queue/queueService.js';

function createQueueHistoryItem(id) {
  const item = document.createElement('div');
  item.classList.add('queue-history-item');
  item.dataset.id = id;
  item.innerHTML = `
    <div class="queue-item__id">${id}</div>
    <div class="queue-item__img"><a href="https://www.clickcritters.com/youradoptables.php?act=code&id=${id}"><img src="https://www.clickcritters.com/images/adoptables/${id}.gif" alt="Adoptable" width="100" height="130" /></a></div>
    <div class="item-actions">
      <button type="button" class="js-item-action--quick-add btn--secondary">Re-click</button>
    </div>
  `;

  return item;
}

async function renderQueueHistory() {
  const { queueHistory } = await ExtensionStorage.get({ queueHistory: [] });
  const queueHistoryWrapper = document.querySelector('#js-queue-history');

  queueHistoryWrapper.innerHTML = '';

  const fragment = document.createDocumentFragment();
  queueHistory.forEach((item) => {
    fragment.appendChild(createQueueHistoryItem(item.id));
  });

  queueHistoryWrapper.appendChild(fragment);
}

// Same as the code in quick-add.js, but I can't import/export from there due to JS module restrictions
function promptForTargetLevel() {
  let targetLevel = window.prompt('Target level:');
  const isInteger = /^(\d)+$/;
  while (true) {
    if (isInteger.test(targetLevel) || targetLevel === null) {
      // A number was entered, or the Cancel button was clicked
      break;
    } else {
      targetLevel = window.prompt('Your input was invalid. Please enter an integer. \nTarget level:');
    }
  }

  return targetLevel;
}

export function init() {
  document.querySelector('#js-queue-history').addEventListener('click', (event) => {
    const target = event.target;
    if (!target.matches('button') && target.classList.contains('js-item-action--quick-add')) {
      return;
    }

    const targetLevel = promptForTargetLevel();

    if (targetLevel !== null) {
      const id = target.closest('.queue-history-item').dataset.id;
      addToQueue([id], targetLevel);
    }
  });

  // Re-render when stored history changes
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.queueHistory) {
      renderQueueHistory();
    }
  });

  // Render for initial page load
  renderQueueHistory();
}