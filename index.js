// Import stylesheets
import './style.css';

const sanitizeHtml = require('sanitize-html');
const fileInput = document.getElementById('html-file-input');
fileInput.addEventListener('change', handleFileSelect, false);

const finalStructure = [];

const options = {
  allowedTags: ['h1', 'h2,', 'p', 'ul', 'ol', 'li', 'a', 'th', 'table', 'tr'],
  allowedAttributes: {
    a: ['href'],
  },
  exclusiveFilter: (frame) => {
    return frame.tag === 'span' && !frame.text.trim();
  },
};

function sanitize(html) {
  return sanitizeHtml(html, options);
}

function handleFileSelect(event) {
  const reader = new FileReader();
  reader.onload = function (event) {
    const htmlString = event.target.result;
    const object = buildObjectFromHtml(sanitize(htmlString));
    console.log(object);
  };
  reader.readAsText(event.target.files[0]);
}

function buildObjectFromHtml(htmlString) {
  const object = {};
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  let blockIndex = 1;
  let blockText = '';

  doc.querySelectorAll('*').forEach((element) => {
    if (element.nodeName === 'H1') {
      const title = element.textContent.trim();
      if (blockText !== '') {
        object[`block${blockIndex}`] = {
          title: title,
          text: blockText,
        };
        blockIndex++;
        blockText = '';
      } else {
        blockText += element.outerHTML;
      }
    } else if (blockText !== '') {
      blockText += element.outerHTML;
    }
  });

  if (blockText !== '') {
    const title = 'Untitled';
    object[`block${blockIndex}`] = {
      title: title,
      text: blockText,
    };
  }

  Object.keys(object).forEach((key) => {
    const block = object[key];

    const textLayout = key.slice(5) % 2 == 0 ? 'right' : 'left';
    const graphicLayout = key.slice(5) % 2 == 0 ? 'left' : 'right';

    const textComponent = {
      _id: `c-${key.slice(5)}-01`,
      _parentId: `b-${key.slice(5)}`,
      _type: 'component',
      _component: 'text',
      _classes: '',
      _layout: `${textLayout}`,
      title: block.title,
      displayTitle: block.title,
      body: block.text,
      instruction: '',
      _pageLevelProgress: {
        _isEnabled: true,
      },
    };
    const graphicComponent = {
      _id: `c-${key.slice(5)}-02`,
      _parentId: `b-${key.slice(5)}`,
      _type: 'component',
      _component: 'graphic',
      _classes: '',
      _layout: `${graphicLayout}`,
      title: `graphic for ${block.title}`,
      displayTitle: '',
      body: '',
      instruction: '',
      _graphic: {
        alt: '',
        longdescription: '',
        large: 'https://via.placeholder.com/600x400',
        small: 'https://via.placeholder.com/600x400',
        attribution: 'Copyright © 2019',
        _url: '',
        _target: '',
      },
      _isScrollable: false,
      _defaultScrollPercent: 0,
      _pageLevelProgress: {
        _isEnabled: true,
      },
    };
    const questionComponent = {
      _id: `c-${key.slice(5)}-01`,
      _parentId: `b-${key.slice(5)}`,
      _type: 'component',
      _component: 'mcq',
      _classes: '',
      _layout: 'left',
      title: 'MCQ',
      displayTitle: 'MCQ',
      body: 'Which of the following options would you consider to be correct?',
      instruction:
        'Choose {{#if _isRadio}}one option{{else}}one or more options{{/if}} then select Submit.',
      ariaQuestion: 'Question text specifically for screen readers.',
      _attempts: 1,
      _shouldDisplayAttempts: false,
      _isRandom: false,
      _hasItemScoring: false,
      _questionWeight: 1,
      _selectable: 1,
      _canShowModelAnswer: true,
      _canShowFeedback: true,
      _canShowMarking: true,
      _recordInteraction: true,
      _items: [
        {
          text: 'This is option 1 (Correct)',
          _shouldBeSelected: true,
          _isPartlyCorrect: false,
        },
        {
          text: 'This is option 2',
          _shouldBeSelected: false,
          feedback: 'Option two incorrect feedback',
          _isPartlyCorrect: false,
        },
        {
          text: 'This is option 3',
          _shouldBeSelected: false,
          _isPartlyCorrect: false,
        },
        {
          text: 'This is option 4',
          _shouldBeSelected: false,
          _isPartlyCorrect: false,
        },
      ],
      _feedback: {
        title: 'Feedback',
        correct: 'Congratulations, this is the correct feedback.',
        _incorrect: {
          notFinal: '',
          final:
            'This feedback will appear if you answered the question incorrectly.',
        },
        _partlyCorrect: {
          notFinal: '',
          final:
            'This feedback will appear if you answered the question correctly.',
        },
      },
      _comment:
        'You only need to include _buttons if you want to override the button labels that are set in course.json',
      _buttons: {
        _submit: {
          buttonText: 'Submit',
          ariaLabel: 'Select here to submit your answer.',
        },
        _reset: {
          buttonText: 'Reset',
          ariaLabel: '',
        },
        _showCorrectAnswer: {
          buttonText: 'Correct Answer',
          ariaLabel: '',
        },
        _hideCorrectAnswer: {
          buttonText: 'My Answer',
          ariaLabel: '',
        },
        _showFeedback: {
          buttonText: 'Show feedback',
          ariaLabel: '',
        },
        remainingAttemptsText: 'attempts remaining',
        remainingAttemptText: 'final attempt',
      },
      _pageLevelProgress: {
        _isEnabled: true,
      },
    };
    if (
      block.title.slice(0, 2) == 'Q:' ||
      block.title.slice(0, 7) == 'Question' ||
      block.title.charAt(block.title.length - 1) == '?'
    ) {
      finalStructure.push(questionComponent);
      finalStructure.push(graphicComponent);
    } else {
      finalStructure.push(textComponent);
      finalStructure.push(graphicComponent);
    }
  });

  let finalBlocks = finalStructure;

  const genBlockObj = Object.entries(finalBlocks)
    .filter(([key, value], i, arr) => {
      return (
        arr.findIndex(([k, v]) => v['_parentId'] === value['_parentId']) === i
      );
    })
    .map(([key, value]) => ({
      _id: value['_parentId'],
      _parentId: 'a-50',
      _type: 'block',
      _classes: '',
      title: value['title'],
      body: '',
    }));

  function downloadJSON(obj) {
    const json = JSON.stringify(obj);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    return url;
  }

  const downloadButton = document.getElementById('block');
  downloadButton.href = downloadJSON(genBlockObj);

  const downloadButton2 = document.getElementById('component');
  downloadButton2.href = downloadJSON(finalBlocks);
}
const accessKey = '9LXDDGlaugPL-wa3s3wDSs5iNZOfdy8WW5DSLqg8-e0';

function searchImages() {
  const searchTerms = document.getElementById('searchTerms').value;
  const termsArray = searchTerms.split('\n');
  const imageMetadata = [];
  let results = document.querySelector('.dl-results').value;
  const dimensions = document.getElementById('cropDimensions').value;
  const [targetWidth, targetHeight] = dimensions.split('x').map(Number);

  termsArray.forEach((term) => {
    fetch(
      `https://api.unsplash.com/search/photos?query=${term}&per_page=${results}&client_id=${accessKey}`
    )
      .then((response) => response.json())
      .then((data) => {
        data.results.forEach((result) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = result.urls.raw;

          img.onload = function () {
            const resizedImage = resizeImage(img, targetWidth, targetHeight);

            resizedImage.onload = () => {
              const url = resizedImage.src;

              imageMetadata.push({
                name: result.alt_description || result.id,
                author: result.user.name,
                url: result.links.html,
              });

              const a = document.createElement('a');
              a.href = url;
              a.download = `${term}-${result.id}.jpg`;
              a.click();

              if (
                imageMetadata.length ===
                data.results.length * termsArray.length
              ) {
                createMetadataFile(imageMetadata);
              }
            };
          };
        });
      })
      .catch((error) => console.log(error));
  });
}

function resizeImage(image, targetWidth, targetHeight) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

  const resizedImage = new Image();
  resizedImage.src = canvas.toDataURL('image/jpeg');
  return resizedImage;
}

function createMetadataFile(metadata) {
  const metadataString = metadata
    .map((image) => `${image.url},${image.name},${image.author},CC0`)
    .join('\n');

  const metadataBlob = new Blob([metadataString], { type: 'text/plain' });

  const a = document.createElement('a');
  a.href = URL.createObjectURL(metadataBlob);
  a.download = 'metadata.txt';
  a.click();

  URL.revokeObjectURL(a.href);
  a.remove();
}

document.querySelector('.search').addEventListener('click', searchImages);
function trackingIdEditor() {
  // Get the textarea by its ID (replace 'textareaId' with the actual ID)
  const textarea = document.getElementById('insertIdBlocks');

  // Parse the textarea's value into an array
  let arr;
  try {
    arr = JSON.parse(textarea.value.trim());
  } catch (e) {
    console.error('Invalid JSON in textarea:', e);
    return;
  }

  // Ensure the parsed JSON is actually an array
  if (!Array.isArray(arr)) {
    console.error('Parsed JSON is not an array:', arr);
    return;
  }

  // Modify the array
  arr.forEach((obj, index) => {
    obj._trackingId = index + 1;
  });

  // Generate the new JSON string
  const newJson = JSON.stringify(arr, null, 2);

  // Replace the textarea's content with the new JSON
  textarea.value = newJson;

  // Copy the new JSON to the clipboard
  navigator.clipboard.writeText(newJson).then(
    () => {
      console.log('New JSON copied to clipboard');
    },
    () => {
      console.error('Failed to copy new JSON to clipboard');
      // If the clipboard write failed, select the text in the textarea
      textarea.select();
    }
  );
}

document
  .getElementById('trackingIdButton')
  .addEventListener('click', trackingIdEditor);

function updateParentAndChild() {
  const parentArea = document.getElementById('parentArea');
  const childArea = document.getElementById('childArea');

  // Parse the parent and child arrays from the textareas
  let parents;
  let children;
  try {
    parents = JSON.parse(parentArea.value.trim());
    children = JSON.parse(childArea.value.trim());
  } catch (e) {
    console.error('Invalid JSON in textarea:', e);
    return;
  }

  // Ensure the parsed JSON are arrays and have the correct properties
  if (!Array.isArray(parents) || !Array.isArray(children)) {
    console.error('Parsed JSON does not match the expected format');
    return;
  }

  let parentIdChildrenMap = {};

  // First pass - build the parent ID to children map
  children.forEach((child) => {
    if (!parentIdChildrenMap[child._parentId]) {
      parentIdChildrenMap[child._parentId] = [];
    }
    parentIdChildrenMap[child._parentId].push(child);
  });

  // Loop through the parent objects
  parents.forEach((parent) => {
    // Check if each parent object has the necessary properties
    if (!(parent instanceof Object) || !parent._id) {
      console.error(
        'Parent object does not match the expected format:',
        parent
      );
      return;
    }

    // Loop through the child objects related to the parent
    parentIdChildrenMap[parent._id]?.forEach((child) => {
      // If the child's parent ID matches the parent's ID, replace the parent's title with the child's title
      if (child.title && child._component !== 'graphic') {
        parent.title = child.title;
      }
    });
  });

  // Second pass - update the titles of the graphic components
  Object.values(parentIdChildrenMap).forEach((children) => {
    let siblingTitle;
    let graphicChild;
    children.forEach((child) => {
      if (child._component === 'graphic') {
        graphicChild = child;
      } else if (child.title) {
        siblingTitle = child.title;
      }
    });
    if (graphicChild && siblingTitle) {
      graphicChild.title = 'Graphic for ' + siblingTitle;
    }
  });

  // Write the updated parent array and child array back to their textareas
  parentArea.value = JSON.stringify(parents, null, 2);
  childArea.value = JSON.stringify(children, null, 2);
}

// Attach the event listener to the button
document
  .getElementById('updateButton')
  .addEventListener('click', updateParentAndChild);

function updateAssesmentNames() {
  const parentArea = document.getElementById('parentAssementArea');
  const childArea = document.getElementById('childBlockArea');

  // Parse the parent and child arrays from the textareas
  let parents;
  let children;
  try {
    parents = JSON.parse(parentArea.value.trim());
    children = JSON.parse(childArea.value.trim());
  } catch (e) {
    console.error('Invalid JSON in textarea:', e);
    return;
  }

  // Ensure the parsed JSON are arrays and have the correct properties
  if (!Array.isArray(parents) || !Array.isArray(children)) {
    console.error('Parsed JSON does not match the expected format');
    return;
  }

  let parentIdChildrenMap = {};

  // First pass - build the parent ID to children map
  children.forEach((child) => {
    if (!parentIdChildrenMap[child._parentId]) {
      parentIdChildrenMap[child._parentId] = [];
    }
    parentIdChildrenMap[child._parentId].push(child);
  });

  // Loop through the parent objects
  parents.forEach((parent) => {
    // Check if each parent object has the necessary properties
    if (!(parent instanceof Object) || !parent._id || !parent._assessment) {
      // Ignore parent objects where the _assessment property does not exist
      return;
    }

    // Loop through the child objects related to the parent
    parentIdChildrenMap[parent._id]?.forEach((child) => {
      // If the child's parent ID matches the parent's ID, replace the parent's _assessment._id with the child's title (with spaces replaced by underscores)
      if (child.title) {
        parent._assessment._id = child.title.replace(/ /g, '_');
      }
    });
  });

  // Write the updated parent array back to the textarea
  parentArea.value = JSON.stringify(parents, null, 2);
}

// Attach the event listener to the button
document
  .getElementById('updateArticleButton')
  .addEventListener('click', updateAssesmentNames);

async function updateComponentsAndAssets() {
  let assetsJson = JSON.parse(assetsTextarea.value);
  let componentsJson = JSON.parse(componentsTextarea.value);

  for (let component of componentsJson) {
    if (component._component !== 'graphic') {
      let searchTerm = component.title.split(' ')[0]; // Use first word of the title

      let response = await fetch(
        `https://api.unsplash.com/search/photos?query=${searchTerm}&per_page=1&client_id=${accessKey}`
      );

      if (response.ok) {
        let data = await response.json();
        let result = data.results[0];

        if (result) {
          let imgName = `${component._id}.jpg`;

          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = result.urls.raw;
          img.onload = function () {
            const resizedImage = resizeImage(img, targetWidth, targetHeight);
            resizedImage.onload = () => {
              const url = resizedImage.src;

              assetsJson[imgName] = {
                title: result.alt_description || result.id,
                description: '',
                source: url,
                licence: 'CC0',
                attribution: result.user.name,
                tags: [],
              };

              // Find the graphic sibling and update it
              let graphicSibling = componentsJson.find(
                (c) => c._component === 'graphic' && c._id === component._id
              );
              if (graphicSibling) {
                graphicSibling._graphic = {
                  alt: '',
                  large: `course/en/assets/${imgName}`,
                  small: `course/en/assets/${imgName}`,
                  attribution: `<a href=\"${assetsJson[imgName].source}\" target=\"_blank\">${assetsJson[imgName].title}</a> <span class='assetLicence'>[CC-BY-SA]</span>`,
                };
              }

              // Download the image
              const a = document.createElement('a');
              a.href = url;
              a.download = imgName;
              a.click();
            };
          };
        }
      } else {
        console.error('Image fetch failed:', response);
      }
    }
  }

  // Update the textarea's content with the new JSONs
  assetsTextarea.value = JSON.stringify(assetsJson, null, 2);
  componentsTextarea.value = JSON.stringify(componentsJson, null, 2);
}

document
  .getElementById('updateButton')
  .addEventListener('click', updateComponentsAndAssets);
