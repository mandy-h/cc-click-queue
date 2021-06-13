const ImageDrop = (function () {
  function handleDragover(event) {
    event.preventDefault();
    document.querySelector('#js-image-drop-area').classList.add('image-drop-area--active');
  }

  function handleDrop(event) {
    event.preventDefault();
    const dropArea = document.querySelector('#js-image-drop-area');
    const dropData = event.dataTransfer.getData('text/html');
    const parser = new DOMParser();
    const droppedImageUrls = Array.from(parser.parseFromString(dropData, 'text/html')
      .body.querySelectorAll('img[src*="/images/adoptables/"]'))
      .map((image) => image.src);
    const adoptableIds = droppedImageUrls.map((url) => url.match(/\d+/));

    dropArea.classList.remove('image-drop-area--active');
    const fragment = document.createDocumentFragment();
    droppedImageUrls.forEach((url) => {
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

  function init() {
    document.querySelector('#js-add-adopts').addEventListener('submit', handleFormSubmit);
    document.addEventListener('drop', handleDrop);
    document.addEventListener('dragover', handleDragover);
  }

  return {
    init
  };
})();