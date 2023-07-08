import Events from '/scripts/modules/Events.js';

function parseIdsAndImagesFromHtml(htmlString) {
  const parser = new DOMParser();
  const imageUrls = Array.from(parser.parseFromString(htmlString, 'text/html')
    .body.querySelectorAll('img[src*="/images/adoptables/"]'))
    .map((image) => image.src);
  const adoptableIds = imageUrls.map((url) => url.match(/\d+/)?.[0]);

  return { adoptableIds, imageUrls };
}

function handleDragover(event) {
  event.preventDefault();
  if (document.querySelector('#js-modal--add-adopts.is-active')) {
    document.querySelector('#js-image-drop-area').classList.add('image-drop-area--active');
  }
}

function handleDrop(event) {
  event.preventDefault();
  if (document.querySelector('#js-modal--add-adopts.is-active')) {
    const dropArea = document.querySelector('#js-image-drop-area');
    const dropData = event.dataTransfer.getData('text/html');
    const { adoptableIds, imageUrls } = parseIdsAndImagesFromHtml(dropData);

    dropArea.classList.remove('image-drop-area--active');
    const fragment = document.createDocumentFragment();
    imageUrls.forEach((url) => {
      const image = document.createElement('img');
      image.src = url;
      fragment.appendChild(image);
    });
    dropArea.appendChild(fragment);

    const adoptIdsInput = document.querySelector('#js-add-adopts input[name="adopt-ids"]');
    if (adoptIdsInput.value === '') {
      adoptIdsInput.value += adoptableIds;
    } else {
      adoptIdsInput.value += `,${adoptableIds}`;
    }
  }
}

function handleFormSubmit(event) {
  event.preventDefault();
  const addAdoptsForm = event.currentTarget;
  const formData = new FormData(addAdoptsForm);

  Events.publish('imageDrop/form-submitted', {
    adoptIds: formData.get('adopt-ids').split(','),
    targetLevel: formData.get('target-level')
  });

  addAdoptsForm.reset();
  document.querySelector('#js-image-drop-area').innerHTML = '';
}

export function init() {
  document.querySelector('#js-add-adopts').addEventListener('submit', handleFormSubmit);
  document.addEventListener('drop', handleDrop);
  document.addEventListener('dragover', handleDragover);
}