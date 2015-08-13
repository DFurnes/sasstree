import { CHARS, TOKENS } from "./Tokens";
import { isWhitespace, isNewline, isLetter, isDigit } from "./util";

/**
 * @class Tokenizer
 *
 * The tokenizer breaks string input into a series of tokens (lexical
 * analysis), which it passes off to the parser.
 */
class Tokenizer {

    constructor() {
        /**
         * The string being tokenized.
         * @type {string}
         */
        this.string = '';

        /**
         * The tokens!
         * @type {array}
         */
        this.tokens = [];

        /**
         * Offset from the beginning of the string.
         * @type {number}
         */
        this.pos = 0;

        /**
         * The beginning of the current column.
         * @type {number}
         */
        this.offset = 0;

        /**
         * The line of CSS we're parsing.
         * @type {number}
         */
        this.line = 1;
    }


    /**
     * Add a token to the tokens array.
     * @param token
     * @param lexeme
     */
    pushCharacterToken(token, lexeme) {
        this.tokens.push({
            type: token,
            lexeme: lexeme,
            source: {
                line: this.line,
                column: this.pos - this.offset
            }
        });
    }

    /**
     * Add a multi-character token to the tokens array.
     * @param token
     * @param lexeme
     * @param startPos
     * @param startOffset
     * @param startLine
     */
    pushBlockToken(token, lexeme, startPos, startOffset, startLine) {
        this.tokens.push({
            type: token,
            lexeme: lexeme,
            source: {
                start: {
                    line: startLine,
                    column: startPos - startOffset,
                    offset: startOffset
                },
                end: {
                    line: this.line,
                    column: this.pos - this.offset,
                    offset: this.offset
                }
            }
        });
    }

    /**
     * Return next character in string input, or false.
     * @param string
     * @returns {number} character code
     */
    nextChar(string) {
        if(this.pos === string.length) return false;

        return string.charCodeAt(this.pos);
    }

    /**
     * Given a SCSS string, return its tokens.
     * @param string
     * @returns {array}
     */
    tokenize(string) {
        let char;

        // Remove UTF Byte Order Mark
        string = string.replace(/^\uFEFF/, '');

        // Save the string we're tokenizing for future reference.
        this.string = string;

        // Iterate through characters and tokenize.
        while(char = this.nextChar(string)) {
            // If we hit a newline, increment line number & update offset.
            if(char == CHARS.newline) {
                this.offset = this.pos;
                this.line += 1;
            }

            // Tokenize by comparing character codes (because it's way way faster
            // than either regex or string comparison).
            switch(char) {
                case CHARS.space:
                case CHARS.tab:
                case CHARS.newline:
                case CHARS.carriageReturn:
                case CHARS.formFeed:
                    this.tokenizeWhiteSpace();
                    break;

                case CHARS.colon:
                    this.pushCharacterToken(TOKENS.colon, ':');
                    break;

                case CHARS.semicolon:
                    this.pushCharacterToken(TOKENS.semicolon, ';');
                    break;

                case CHARS.comma:
                    this.pushCharacterToken(TOKENS.comma, ',');
                    break;

                case CHARS.openBracket:
                    this.pushCharacterToken(TOKENS.openBracket, '[');
                    break;

                case CHARS.closeBracket:
                    this.pushCharacterToken(TOKENS.closeBracket, ']');
                    break;

                case CHARS.openCurlyBracket:
                    this.pushCharacterToken(TOKENS.openCurlyBracket, '{');
                    break;

                case CHARS.closeCurlyBracket:
                    this.pushCharacterToken(TOKENS.closeCurlyBracket, '}');
                    break;

                case CHARS.openParen:
                    this.pushCharacterToken(TOKENS.openParen, '(');
                    break;

                case CHARS.closeParen:
                    this.pushCharacterToken(TOKENS.closeParen, ')');
                    break;

                case CHARS.singleQuote:
                case CHARS.doubleQuote:
                    this.tokenizeQuotedString();
                    break;

                case CHARS.ampersand:
                    this.pushCharacterToken(TOKENS.ampersand, '&');
                    break;

                case CHARS.exponent:
                    this.pushCharacterToken(TOKENS.exponent, '^');
                    break;

                case CHARS.dash:
                    this.pushCharacterToken(TOKENS.dash, '-');
                    break;

                case CHARS.bang:
                    this.pushCharacterToken(TOKENS.bang, '!');
                    break;

                case CHARS.dollar:
                    this.pushCharacterToken(TOKENS.dollar, '$');
                    break;

                case CHARS.percent:
                    this.pushCharacterToken(TOKENS.percent, '%');
                    break;

                case CHARS.atSymbol:
                    this.tokenizeAtSymbol();
                    break;

                case CHARS.hash:
                    this.pushCharacterToken(TOKENS.hash, '#');
                    break;

                case CHARS.plus:
                    this.pushCharacterToken(TOKENS.plus, '+');
                    break;

                case CHARS.tilde:
                    this.pushCharacterToken(TOKENS.tilde, '~');
                    break;

                case CHARS.equals:
                    this.pushCharacterToken(TOKENS.equals, '=');
                    break;

                case CHARS.greaterThan:
                    this.pushCharacterToken(TOKENS.greaterThan, '>');
                    break;

                case CHARS.period:
                    this.pushCharacterToken(TOKENS.period, '.');
                    break;

                case CHARS.asterisk:
                    this.pushCharacterToken(TOKENS.asterisk, '*');
                    break;

                case CHARS.underscore:
                    this.pushCharacterToken(TOKENS.underscore, '_');
                    break;

                default:
                    // Parse comments first by halting on '/*' or '//'
                    let nextChar = string.charCodeAt(this.pos + 1);
                    if(char === CHARS.forwardSlash && nextChar === CHARS.asterisk) {
                        this.tokenizeMultilineComment();
                        break;
                    }

                    if(char === CHARS.forwardSlash && nextChar === CHARS.forwardSlash) {
                        this.tokenizeComment();
                        break;
                    }

                    if(char === CHARS.forwardSlash) {
                        this.pushCharacterToken(TOKENS.forwardSlash, char);
                        break;
                    }

                    if(char === CHARS.backslash && nextChar === CHARS.nine) {
                        this.pushCharacterToken(TOKENS.hack, '\\9');
                        break;
                    }

                    if(isLetter(char)) {
                        this.tokenizeWord();
                        break;
                    }

                    if(isDigit(char)) {
                        this.tokenizeInteger();
                        break;
                    }

                    console.error(`Unrecognized token at ${this.line}:${this.pos - this.offset} --> ${this.string.charAt(this.pos)}`);

                    break;
            }

            this.pos++;
        }

        return this.tokens;
    };


    /**
     * Find multiline comment tokens.
     */
    tokenizeMultilineComment() {
        let next = this.pos + 1;
        let char;
        let nextChar;

        const [_pos, _offset, _line] = [this.pos, this.offset, this.line];

        do {
            next++;
            char = this.string.charCodeAt(next);
            nextChar = this.string.charCodeAt(next + 1);

            if (char == CHARS.newline) {
                this.offset = next;
                this.line  += 1;
            }
        } while (!(char === CHARS.asterisk && nextChar === CHARS.forwardSlash));

        this.pushBlockToken(
            TOKENS.multilineComment,
            this.string.slice(this.pos, next + 2),
            _pos, _offset, _line
        );

        this.pos = next + 1;
    }

    /**
     * Find single-line comment tokens.
     */
    tokenizeComment() {
        let next = this.pos;
        let char;

        do {
            next++;
            char = this.string.charCodeAt(next);
        } while (char !== CHARS.newline);

        this.pushCharacterToken(TOKENS.comment, this.string.slice(this.pos, next));
        this.pos = next - 1;
    }

    /**
     * Find whole whitespace tokens.
     */
    tokenizeWhiteSpace() {
        let next = this.pos;
        let char;

        do {
            next++;
            char = this.string.charCodeAt(next);

            if (isNewline(char)) {
                this.offset = next;
                this.line  += 1;
            }
        } while (isWhitespace(char));

        this.pushCharacterToken(TOKENS.whitespace, this.string.slice(this.pos, next));
        this.pos = next - 1;
    }

    /**
     * Find whole word tokens.
     */
    tokenizeWord() {
        let next = this.pos;
        let char;

        do {
            next++;
            char = this.string.charCodeAt(next);
        } while (isLetter(char));

        this.pushCharacterToken(TOKENS.word, this.string.slice(this.pos, next));
        this.pos = next - 1;
    }

    /**
     * Find quoted string tokens.
     */
    tokenizeQuotedString() {
        const quote = this.string.charCodeAt(this.pos);
        const quoteChar = quote === CHARS.singleQuote ? '\'' : '"';
        let next = this.pos;
        let escaped;

        do {
            escaped = false;
            next = this.string.indexOf(quoteChar, next + 1);

            // If there's no matching quote, throw a tokenizer error.
            if ( next === -1 ) throw new Error('Unclosed quote: ' + quoteChar);

            // Is the char before the next matching quote a backslash? If so, is
            // _that_ backslash escaped by a backlash(...)? If it's a valid escaped quote
            // char, restart the loop so we can find the following quote and test it.
            let escapePos = next;
            while ( this.string.charCodeAt(escapePos - 1) === CHARS.backslash ) {
                escapePos -= 1;
                escaped = !escaped;
            }
        } while ( escaped );

        this.pushCharacterToken(TOKENS.string, this.string.slice(this.pos, next + 1));
        this.pos = next;
    }

    /**
     * Tokenize an at-word symbol.
     *
     * For example:
     *   `@charset "UTF-8";`
     *   `@font-face { ... }`
     */
    tokenizeAtSymbol() {
        let next = this.pos;
        let char;

        // At-symbols are followed by a keyword, and then either a string or block.

        do {
            next++;
            char = this.string.charCodeAt(next);
        } while (!(isWhitespace(char) || char == CHARS.openParen || char == CHARS.openCurlyBracket || char == CHARS.semicolon));

        this.pushCharacterToken(TOKENS.atSymbol, this.string.slice(this.pos, next));
        this.pos = next - 1;
    }

    /**
     * Find integer tokens.
     */
    tokenizeInteger() {
        let next = this.pos;
        let char;

        do {
            next++;
            char = this.string.charCodeAt(next);
        } while (isDigit(char));

        this.pushCharacterToken(TOKENS.word, this.string.slice(this.pos, next));
        this.pos = next - 1;
    }

}


export default Tokenizer;
