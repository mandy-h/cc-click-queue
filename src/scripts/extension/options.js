document.addEventListener('DOMContentLoaded', () => {
  function showStatus(message, timeout = 2000) {
    const status = document.getElementById('status');
    status.textContent = message;

    if (timeout > 0) {
      setTimeout(() => { status.textContent = ''; }, timeout);
    }
  }

  function setUpProgressBarOptions() {
    const form = document.getElementById('extension-options');

    function restoreOptions() {
      chrome.storage.local.get(['progressBar'], (items) => {
        const value = items.progressBar;
        const el = document.querySelector(`input[name="progress-bar"][value="${value}"]`);
        if (el) {
          el.checked = true;
        }
      });
    }

    function saveOptions(event) {
      event.preventDefault();

      const selected = document.querySelector('input[name="progress-bar"]:checked');
      const value = selected.value;

      chrome.storage.local.set({ progressBar: value }, () => {
        if (chrome.runtime.lastError) {
          showStatus('Error saving options');
          console.error(chrome.runtime.lastError);
          return;
        }
        showStatus('Options saved');
      });
    }

    form.addEventListener('change', saveOptions);
    restoreOptions();
  }

  function setUpDataButtons() {
    const importDataButton = document.querySelector('#import-data-button');
    const exportDataButton = document.querySelector('#export-data-button');

    importDataButton.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json,application/ld+json,.json';
      input.style.display = 'none';
      document.body.appendChild(input);

      input.addEventListener('change', () => {
        const file = input.files && input.files[0];
        if (!file) {
          document.body.removeChild(input);
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          try {
            const parsed = JSON.parse(reader.result);
            if (typeof parsed !== 'object' || parsed === null) {
              showStatus('Invalid JSON file');
              document.body.removeChild(input);
              return;
            }

            chrome.storage.local.set(parsed, () => {
              if (chrome.runtime.lastError) {
                showStatus('Error importing data');
                console.error(chrome.runtime.lastError);
              } else {
                showStatus('Imported data');
              }
              document.body.removeChild(input);
            });
          } catch (err) {
            showStatus('Error parsing JSON');
            console.error(err);
            document.body.removeChild(input);
          }
        };

        reader.onerror = () => {
          showStatus('Error reading file');
          document.body.removeChild(input);
        };

        reader.readAsText(file);
      });

      input.click();
    });

    exportDataButton.addEventListener('click', () => {
      chrome.storage.local.get(null, (data) => {
        const json = JSON.stringify(data);

        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'queue-data.json';
        document.body.appendChild(a);
        a.click();

        a.remove();
        URL.revokeObjectURL(url);
      });
    });
  }

  setUpProgressBarOptions();
  setUpDataButtons();
});