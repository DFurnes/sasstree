import TOKENS from "./Tokens";
import { isWhitespace } from "./util";

/**
 * @class Tokenizer
 *
 * The tokenizer breaks string input into a series of tokens (lexical
 * analysis), which it passes off to the parser.
 */
class Tokenizer {

    constructor() {
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
     */
    pushBlockToken(token, lexeme, startPos, startOffset, startLine) {
        this.tokens.push({
            type: token,
            lexeme: lexeme,
            source: {
                start: {
                    line: startLine,
                    column: startPos - startOffset
                },
                end: {
                    line: this.line,
                    column: this.pos - this.offset
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

        return string.charAt(this.pos);
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
                    this.pushCharacterToken('COLON', char);
                    break;

                case TOKENS.semicolon:
                    this.pushCharacterToken('SEMICOLON', char);
                    break;

                case TOKENS.comma:
                    this.pushCharacterToken('COMMA', char);
                    break;

                case TOKENS.openBracket:
                    this.pushCharacterToken('OPEN_BRACKET', char);
                    break;

                case TOKENS.closeBracket:
                    this.pushCharacterToken('CLOSE_BRACKET', char);
                    break;

                case TOKENS.openCurlyBracket:
                    this.pushCharacterToken('OPEN_CURLY', char);
                    break;

                case TOKENS.closeCurlyBracket:
                    this.pushCharacterToken('CLOSE_CURLY', char);
                    break;

                case TOKENS.openParen:
                    this.pushCharacterToken('OPEN_PAREN', char);
                    break;

                case TOKENS.closeParen:
                    this.pushCharacterToken('CLOSE_PAREN', char);
                    break;

                case TOKENS.singleQuote:
                case TOKENS.doubleQuote:
                    this.tokenizeQuotedString();
                    break;

                case TOKENS.exponent:
                    this.pushCharacterToken('EXPONENT', char);
                    break;

                case TOKENS.dash:
                    this.pushCharacterToken('DASH', char);
                    break;

                case TOKENS.bang:
                    this.pushCharacterToken('BANG', char);
                    break;

                case TOKENS.dollar:
                    this.pushCharacterToken('DOLLAR', char);
                    break;

                case TOKENS.percent:
                    this.pushCharacterToken('PERCENT', char);
                    break;

                case TOKENS.atSymbol:
                    this.pushCharacterToken('AT', char);
                    break;

                case TOKENS.hash:
                    this.pushCharacterToken('HASH', char);
                    break;

                case TOKENS.plus:
                    this.pushCharacterToken('PLUS', char);
                    break;

                case TOKENS.tilde:
                    this.pushCharacterToken('TILDE', char);
                    break;

                case TOKENS.equals:
                    this.pushCharacterToken('EQUAL', char);
                    break;

                case TOKENS.greaterThan:
                    this.pushCharacterToken('GREATER_THAN', char);
                    break;

                case TOKENS.period:
                    this.pushCharacterToken('PERIOD', char);
                    break;

                case TOKENS.asterisk:
                    this.pushCharacterToken('ASTERISK', char);
                    break;

                default:
                    // Parse comments first by halting on '/*' or '//'
                    let nextChar = string.charAt(this.pos + 1);
                    if(char === '/' && nextChar === '*') {
                        this.tokenizeMultilineComment();
                        break;
                    }

                    if(char === '/' && nextChar === '/') {
                        this.tokenizeComment();
                        break;
                    }

                    if(char === '/') {
                        this.pushCharacterToken('FORWARD_SLASH', char);
                        break;
                    }

                    if(char === '\\' && nextChar === '9') {
                        this.pushCharacterToken('HACK', char + nextChar);
                        break;
                    }

                    if(char.match(/[A-Za-z]/)) {
                        this.tokenizeWord();
                        break;
                    }

                    if(char.match(/[0-9]/)) {
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
            char = this.string.charAt(next);
            nextChar = this.string.charAt(next + 1);

            if (char == TOKENS.newline) {
                this.offset = next;
                this.line  += 1;
            }
        } while (!(char === '*' && nextChar === '/'));

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
            char = this.string.charAt(next);
        } while (char !== '\n');

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
            char = this.string.charAt(next);

            if (char == TOKENS.newline) {
                this.offset = next;
                this.line  += 1;
            }
        } while (char.match(/\s/));

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
            char = this.string.charAt(next);
        } while (char.match(/[A-Za-z]/));

        this.pushCharacterToken('WORD', this.string.slice(this.pos, next));
        this.pos = next - 1;
    }

    /**
     * Find quoted string tokens.
     */
    tokenizeQuotedString() {
        let openingQuote = this.string.charAt(this.pos);
        let next = this.pos;
        let char, prevChar;

        do {
            next++;
            char = this.string.charAt(next);
            prevChar = this.string.charAt(next - 1);
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
            char = this.string.charAt(next);
        } while (char.match(/[0-9]/));

        this.pushCharacterToken('WORD', this.string.slice(this.pos, next));
        this.pos = next - 1;
    }

}


export default Tokenizer;