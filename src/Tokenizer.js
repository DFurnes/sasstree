import TOKENS from "./Tokens";
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
         * @type {Array}
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
     * @returns {*}
     */
    nextChar(string) {
        if(this.pos === string.length) return false;

        return string.charCodeAt(this.pos);
    }

    /**
     * Given a SCSS string, return its tokens.
     * @param string
     * @returns {Array}
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
            if(char == TOKENS.newline) {
                this.offset = this.pos;
                this.line += 1;
            }

            // Tokenize by comparing character codes (because it's way way faster
            // than either regex or string comparison).
            switch(char) {
                case TOKENS.space:
                case TOKENS.tab:
                case TOKENS.newline:
                case TOKENS.carriageReturn:
                case TOKENS.formFeed:
                    this.tokenizeWhiteSpace();
                    break;

                case TOKENS.colon:
                    this.pushCharacterToken('COLON', ':');
                    break;

                case TOKENS.semicolon:
                    this.pushCharacterToken('SEMICOLON', ';');
                    break;

                case TOKENS.comma:
                    this.pushCharacterToken('COMMA', ',');
                    break;

                case TOKENS.openBracket:
                    this.pushCharacterToken('OPEN_BRACKET', '[');
                    break;

                case TOKENS.closeBracket:
                    this.pushCharacterToken('CLOSE_BRACKET', ']');
                    break;

                case TOKENS.openCurlyBracket:
                    this.pushCharacterToken('OPEN_CURLY', '{');
                    break;

                case TOKENS.closeCurlyBracket:
                    this.pushCharacterToken('CLOSE_CURLY', '}');
                    break;

                case TOKENS.openParen:
                    this.pushCharacterToken('OPEN_PAREN', '(');
                    break;

                case TOKENS.closeParen:
                    this.pushCharacterToken('CLOSE_PAREN', ')');
                    break;

                case TOKENS.singleQuote:
                case TOKENS.doubleQuote:
                    this.tokenizeQuotedString();
                    break;

                case TOKENS.exponent:
                    this.pushCharacterToken('EXPONENT', '^');
                    break;

                case TOKENS.dash:
                    this.pushCharacterToken('DASH', '-');
                    break;

                case TOKENS.bang:
                    this.pushCharacterToken('BANG', '!');
                    break;

                case TOKENS.dollar:
                    this.pushCharacterToken('DOLLAR', '$');
                    break;

                case TOKENS.percent:
                    this.pushCharacterToken('PERCENT', '%');
                    break;

                case TOKENS.atSymbol:
                    this.pushCharacterToken('AT', '@');
                    break;

                case TOKENS.hash:
                    this.pushCharacterToken('HASH', '#');
                    break;

                case TOKENS.plus:
                    this.pushCharacterToken('PLUS', '+');
                    break;

                case TOKENS.tilde:
                    this.pushCharacterToken('TILDE', '~');
                    break;

                case TOKENS.equals:
                    this.pushCharacterToken('EQUAL', '=');
                    break;

                case TOKENS.greaterThan:
                    this.pushCharacterToken('GREATER_THAN', '>');
                    break;

                case TOKENS.period:
                    this.pushCharacterToken('PERIOD', '.');
                    break;

                case TOKENS.asterisk:
                    this.pushCharacterToken('ASTERISK', '*');
                    break;

                default:
                    // Parse comments first by halting on '/*' or '//'
                    let nextChar = string.charCodeAt(this.pos + 1);
                    if(char === TOKENS.forwardSlash && nextChar === TOKENS.asterisk) {
                        this.tokenizeMultilineComment();
                        break;
                    }

                    if(char === TOKENS.forwardSlash && nextChar === TOKENS.forwardSlash) {
                        this.tokenizeComment();
                        break;
                    }

                    if(char === TOKENS.forwardSlash) {
                        this.pushCharacterToken('FORWARD_SLASH', char);
                        break;
                    }

                    if(char === TOKENS.backSlash && nextChar === TOKENS.nine) {
                        this.pushCharacterToken('HACK', '\\9');
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

            if (char == TOKENS.newline) {
                this.offset = next;
                this.line  += 1;
            }
        } while (!(char === TOKENS.asterisk && nextChar === TOKENS.forwardSlash));

        this.pushBlockToken(
            'MULTILINE_COMMENT',
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
        } while (char !== TOKENS.newline);

        this.pushCharacterToken('COMMENT', this.string.slice(this.pos, next));
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

        this.pushCharacterToken('WHITESPACE', this.string.slice(this.pos, next));
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

        this.pushCharacterToken('WORD', this.string.slice(this.pos, next));
        this.pos = next - 1;
    }

    /**
     * Find quoted string tokens.
     */
    tokenizeQuotedString() {
        let openingQuote = this.string.charCodeAt(this.pos);
        let next = this.pos;
        let char, prevChar;

        do {
            next++;
            char = this.string.charCodeAt(next);
            prevChar = this.string.charCodeAt(next - 1);
        } while (!(char === openingQuote && prevChar !== '\\'));

        this.pushCharacterToken('STRING', this.string.slice(this.pos, next + 1));
        this.pos = next;
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

        this.pushCharacterToken('WORD', this.string.slice(this.pos, next));
        this.pos = next - 1;
    }

}


export default Tokenizer;