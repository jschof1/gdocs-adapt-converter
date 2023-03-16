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
const url = `https://api.unsplash.com/photos/random/?client_id=${accessKey}`;
function searchImages() {
  // Get the search terms from the text area
  const searchTerms = document.getElementById('searchTerms').value;

  // Split the search terms into an array
  const termsArray = searchTerms.split('\n');

  // Create an array to hold the image metadata
  const imageMetadata = [];
  let results = document.querySelector('.dl-results').value;

  // Loop through each search term and fetch the corresponding images
  termsArray.forEach((term) => {
    fetch(
      `https://api.unsplash.com/search/photos?query=${term}&per_page=${results}&client_id=${accessKey}`
    )
      .then((response) => response.json())
      .then((data) => {
        // Loop through each image URL and download the image
        data.results.forEach((result) => {
          // Create an <img> element with the src attribute set to the image URL
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = result.urls.raw;

          // Wait for the image to load and then create a canvas element to draw the image as a 500x500 square
          img.onload = function () {
            const canvas = document.createElement('canvas');
            const size = Math.min(img.width, img.height); // get the minimum dimension of the image
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            const x = (img.width - size) / 2; // calculate the x-coordinate for the top-left corner of the crop area
            const y = (img.height - size) / 2; // calculate the y-coordinate for the top-left corner of the crop area
            ctx.drawImage(img, x, y, size, size, 0, 0, size, size); // draw the cropped image on the canvas

            // Convert the canvas element to a Blob object and create a URL for the Blob
            canvas.toBlob(
              (blob) => {
                const url = URL.createObjectURL(blob);

                // Add the image metadata to the imageMetadata array
                imageMetadata.push({
                  name: result.alt_description || result.id,
                  author: result.user.name,
                  url: result.links.html,
                });

                // Use the download attribute of an <a> element to download the image
                const a = document.createElement('a');
                a.href = url;
                a.download = `${term}-${result.id}.jpg`;
                a.click();

                // Clean up the URL and the <a> element
                URL.revokeObjectURL(url);
                a.remove();

                // If this is the last image for this search term, create the metadata file
                if (
                  imageMetadata.length ===
                  data.results.length * termsArray.length
                ) {
                  createMetadataFile(imageMetadata);
                }
              },
              'image/jpeg',
              1
            );
          };
        });
      })
      .catch((error) => console.log(error));
  });
}

function createMetadataFile(metadata) {
  // Convert the metadata array to a string
  const metadataString = metadata
    .map((image) => `${image.url},${image.name},${image.author},CC0`)
    .join('\n');

  // Create a Blob object for the metadata string
  const metadataBlob = new Blob([metadataString], { type: 'text/plain' });

  // Use the download attribute of an <a> element to download the metadata file
  const a = document.createElement('a');
  a.href = URL.createObjectURL(metadataBlob);
  a.download = 'metadata.txt';
  a.click();

  // Clean up the URL and the <a> element
  URL.revokeObjectURL(a.href);
  a.remove();
}
document.querySelector('.search').addEventListener('click', searchImages);
