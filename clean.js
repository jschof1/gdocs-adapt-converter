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

module.exports = (html) => {
  return sanitizeHtml(html, options);
};