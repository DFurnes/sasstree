/**
 * Token characters for the tokenizer.
 * @var {Object}
 */
let CHARS = {
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

// Token characters should be represented as character codes.
// This allows for faster comparison in the tokenizer stage.
Object.keys(CHARS).map(function(value) {
    CHARS[value] = CHARS[value].charCodeAt(0);
});

/**
 * Token types.
 * @type {object}
 */
let TOKENS = {
    whitespace: 'WHITESPACE',

    openBracket: 'OPEN_BRACKET',
    closeBracket: 'CLOSE_BRACKET',
    openCurlyBracket: 'OPEN_CURLY',
    closeCurlyBracket: 'CLOSE_CURLY',
    openParen: 'OPEN_PAREN',
    closeParen: 'CLOSE_PAREN',

    singleQuote: 'SINGLE_QUOTE',
    doubleQuote: 'DOUBLE_QUOTE',

    colon: 'COLON',
    comma: 'COMMA',
    semicolon: 'SEMICOLON',

    ampersand: 'AMPERSAND',
    asterisk: 'ASTERISK',
    atSymbol: 'AT',
    bang: 'BANG',
    dash: 'DASH',
    dollar: 'DOLLAR',
    equals: 'EQUALS',
    exponent: 'EXPONENT',
    forwardSlash: 'FORWARD_SLASH',
    greaterThan: 'GREATER_THAN',
    hash: 'HASH',
    percent: 'PERCENT',
    period: 'PERIOD',
    plus: 'PLUS',
    tilde: 'TILDE',
    underscore: 'UNDERSCORE',

    hack: 'HACK',

    word: 'WORD',
    string: 'STRING',

    comment: 'COMMENT',
    multilineComment: 'MULTILINE_COMMENT',
};

export default { CHARS, TOKENS };
