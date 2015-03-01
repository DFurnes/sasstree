/**
 * The tokenizer breaks string input into a series of tokens, which
 * it passes off to the parser.
 */

import TOKENS from "./Tokens";
import { isWhitespace } from "./util";

// http://www.w3.org/TR/css3-syntax/#tokenization

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
        if(this.pos == string.length) return false;

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
                    this.pushCharacterToken('COLON', ':');
                    break;

                case TOKENS.semicolon:
                    this.pushCharacterToken('SEMICOLON', ';');
                    break;

                case TOKENS.openCurlyBracket:
                    this.pushCharacterToken('{', '{');
                    break;

                case TOKENS.closeCurlyBracket:
                    this.pushCharacterToken('}', '}');
                    break;

                case TOKENS.openParen:
                    this.pushCharacterToken('(', '(');
                    break;

                case TOKENS.closeParen:
                    this.pushCharacterToken(')', ')');
                    break;

                case TOKENS.singleQuote:
                case TOKENS.doubleQuote:
                    this.pushCharacterToken('QUOTE', char);
                    break;

                case TOKENS.percent:
                    this.pushCharacterToken('PERCENT', '%');
                    break;

                case TOKENS.atSymbol:
                    this.pushCharacterToken('AT', '@');
                    break;

                case TOKENS.period:
                    this.pushCharacterToken('PERIOD', '.');
                    break;

                case TOKENS.asterisk:
                    this.pushCharacterToken('ASTERISK', '*');
                    break;

                default:
                    // Parse comments first by halting on '/*' or '//'
                    let nextChar = string.charAt(this.pos + 1);
                    if(char === '/' && nextChar === '*') {
                        this.tokenizeMultilineComment();
                    }

                    if(char === '/' && nextChar === '/') {
                        this.tokenizeComment();
                    }

                    if(char.match(/[A-Za-z]/)) {
                        this.tokenizeWord();
                    }

                    if(char.match(/[0-9]/)) {
                        this.tokenizeInteger();
                    }

                    //console.log('UNTOKENIZED CHARACTER ---> ' + string.charAt(pos));

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

        this.pos = next;
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