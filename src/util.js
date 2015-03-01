// Utility functions:

import TOKENS from './Tokens';

/**
 * Return whether the given code fragment is a whitespace character.
 * @param {string} char
 * @returns {boolean}
 */
export var isWhitespace = function(char) {
    return char == TOKENS.space          ||
           char == TOKENS.newline        ||
           char == TOKENS.tab            ||
           char == TOKENS.carriageReturn ||
           char == TOKENS.formFeed;
};

