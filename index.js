const fileInput = document.getElementById('html-file-input');
const sanitizeHtml = require('sanitize-html');

const options = {
  allowedTags: ['h1', 'p', 'ul', 'ol', 'li', 'a'],
  allowedAttributes: {
    a: ['href'],
  },
  exclusiveFilter: (frame) => {
    return frame.tag === 'span' && !frame.text.trim();
  },
};

const titleTag = 'H1'; // Add this line to define titleTag

function sanitize(html) {
  return sanitizeHtml(html, options);
}

fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = (event) => {
    const result = event.target.result;
    const html = sanitize(result);
    const blocks = {};
    let blockCount = 0;
    let currentTitle = '';
    let currentText = '';

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const headers = doc.querySelectorAll(titleTag);

    headers.forEach((header, index) => {
      const paragraphs = [];

      let current = header.nextSibling;

      while (current && current.nodeName !== titleTag) {
        if (
          current.nodeName === 'P' ||
          current.nodeName === 'LI' ||
          current.nodeName === 'UL'
        ) {
          const content = current.outerHTML
            .replace(/<\/?span[^>]*>/g, '')
            .trim();
          if (content) {
            paragraphs.push(content);
          }
        }
        current = current.nextSibling;
      }

      if (paragraphs.length > 0) {
        blockCount++;
        currentTitle = header.textContent.trim();
        currentText = paragraphs.join('\n');

        blocks[`block${blockCount}`] = {
          title: currentTitle,
          text: currentText,
        };
      }
    });

    const finalStructure = [];

    Object.keys(blocks).forEach((key) => {
      const block = blocks[key];

      console.log(block);
      const textComponent = {
        _id: `c-${key.slice(5)}-01`,
        _parentId: `b-${key.slice(5)}`,
        _type: 'component',
        _component: 'text',
        _classes: '',
        _layout: 'left',
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
        _layout: 'left',
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
        block.title.slice(0, 7) == 'Question'
      ) {
        conosle.log(finalStructure)
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
  };

  reader.readAsText(file);
});
