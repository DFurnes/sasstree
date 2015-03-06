/**
 * @module Tokens
 * Token characters for the tokenizer.
 */

var tokens = {
    // Whitespace
    space: ' ',
    newline: '\n',
    tab: '\t',
    carriageReturn: '\r',
    formFeed: '\f',

    // Brackets
    openBracket: '[',
    closeBracket: ']',
    openCurlyBracket: '{',
    closeCurlyBracket: '}',
    openParen: '(',
    closeParen: ')',

    // Quote
    singleQuote: '\'',
    doubleQuote: '"',

    // Separators
    colon: ':',
    comma: ',',
    semicolon: ';',

    // Symbols
    asterisk: '*',
    atSymbol: '@',
    bang: '!',
    dash: '-',
    dollar: '$',
    equals: '=',
    exponent: '^',
    forwardSlash: '/',
    greaterThan: '>',
    hash: '#',
    percent: '%',
    period: '.',
    plus: '+',
    tilde: '~',
    underscore: '_',

    // IE Hack
    backSlash: '\\',
    nine: '9'

};

/**
 * Token characters represented as character codes. This
 * allows for faster comparison in the tokenizer stage.
 * @type {Array}
 */
var tokenCodes = [];
Object.keys(tokens).map(function(value) {
   tokenCodes[value] = tokens[value].charCodeAt(0);
});

export default tokenCodes;
