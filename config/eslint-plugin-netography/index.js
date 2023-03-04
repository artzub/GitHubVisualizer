const functionParenNewline = require('./function-paren-newline');
const objectPropertyNewline = require('./object-property-newline');

module.exports = {
  rules: {
    'function-paren-newline': functionParenNewline,
    'object-property-newline': objectPropertyNewline,
  },
};
