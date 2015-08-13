import Parser from './Parser';

/**
 * Parse SCSS into an AST.
 * @param {string} scss - Input SCSS
 * @param {object} options
 * @returns {*}
 */
function parse(scss, options = {}) {
    const parser = new Parser();
    return parser.parse(scss, options);
}

export default { parse };
