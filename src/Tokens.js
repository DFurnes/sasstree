/**
 * @module Tokens
 * Token characters for the tokenizer.
 */

let tokens = {
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
    ampersand: '&',
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
    backslash: '\\',
    nine: '9'
};

/**
 * Token characters should be represented as character codes.
 * This allows for faster comparison in the tokenizer stage.
 */
Object.keys(tokens).map(function(value) {
    tokens[value] = tokens[value].charCodeAt(0);
});

export default tokens;
