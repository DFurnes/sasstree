import TOKENS from './Tokens';

/**
 * Return whether the given character code is for a whitespace character.
 * @param {int} code
 * @returns {boolean}
 */
export var isWhitespace = function(code) {
    return code == TOKENS.space          ||
           code == TOKENS.newline        ||
           code == TOKENS.tab            ||
           code == TOKENS.carriageReturn ||
           code == TOKENS.formFeed;
};


/**
 * Return whether the given character code is for a newline character.
 * @param {int} code
 * @returns {boolean}
 */
export var isNewline = function(code) {
    return code == TOKENS.newline || code == TOKENS.carriageReturn;
};

/**
 * Return whether the given character code is for a digit [0-9].
 * @param {int} code
 * @returns {boolean}
 */
export var isDigit = function(code) {
    return (code >= 48 && code <= 57);
};

/**
 * Return whether the given character code is for a letter [A-Za-z].
 * @param {int} code
 * @returns {boolean}
 */
export var isLetter = function(code) {
    return (code >= 97 && code <= 122) || (code >= 65 && code <= 90);
};