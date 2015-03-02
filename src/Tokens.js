import { getCharCode } from './util';

/**
 * @module Tokens
 * Token characters for the tokenizer.
 */
export default {

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
    greaterThan: '>',
    hash: '#',
    percent: '%',
    period: '.',
    plus: '+',
    backSlash: '\\',
    forwardSlash: '/',
    tilde: '~'

};
