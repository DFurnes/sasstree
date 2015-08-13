import Tokenizer from './Tokenizer';
import { TOKENS } from './Tokens';

import Node from './Nodes/Node';
import AtRule from './Nodes/AtRule';
import Block from './Nodes/Block';
import Comment from './Nodes/Comment';
import DocumentRoot from './Nodes/DocumentRoot';
import Declaration from './Nodes/Declaration';
import Ruleset from './Nodes/Ruleset';

/**
 * @class Parser
 *
 * The parser analyzes the the tokens passed from the tokenizer,
 * and builds an abstract syntax tree (AST) that linters can use.
 */
class Parser {
    constructor() {
        /**
         * The tokens passed from the Tokenizer.
         * @type {Array}
         */
        this.tokens = [];

        /**
         * The AST. This is where we store AST nodes as we construct the tree.
         * @type {Array}
         */
        this.ast = new DocumentRoot();

        /**
         * Marks the current position in the AST. This is where we add child nodes to.
         * @type {Node}
         */
        this.current = this.ast;

        /**
         * The last node that was added to the tree. This is where we attach whitespace to.
         * @type {Node}
         */
        this.latest = this.ast;

        /**
         * Index of the current token being consumed.
         * @type {number}
         */
        this.pos = -1;
    }

    /**
     * Parse an array of tokens.
     * @param {string} scss
     * @param {object} options
     */
    parse(scss, options = {}) {
        // Start a new tokenizer
        var tokenizer = new Tokenizer();

        if(options && options.bench) {
            console.time('tokenize');
        }

        // Use the Tokenizer to parse SCSS string into an array of tokens.
        this.tokens = tokenizer.tokenize(scss);

        if(options && options.bench) {
            console.timeEnd('tokenize');
            console.time('parse');
        }

        //Loop through tokens & parse.
        let token;
        while(token = this.nextToken()) {
            this.parseToken(token);
        }

        if(options && options.bench) {
            console.timeEnd('parse');
        }

        return this.ast;
    }

    nextToken() {
        if(this.pos === this.tokens.length) return false;
        this.pos++;

        return this.tokens[this.pos];
    }

    peek() {
        if(this.pos === this.tokens.length) return false;
        return this.tokens[this.pos + 1];
    }

    expect(type) {
        return this.peek().type === type;
    }

    prevToken() {
        if(this.pos === 0) return false;
        this.pos--;

        return this.tokens[this.pos];
    }

    parseToken(token) {
        switch (token.type) {
            case TOKENS.whitespace:
                this.attachWhitespace(token.lexeme);
                break;

            case TOKENS.atSymbol:
                this.parseAtRule(token);
                break;

            case TOKENS.period:
            case TOKENS.dollar:
            case TOKENS.hash:
            case TOKENS.word:
            case TOKENS.dash:
            case TOKENS.openBracket:
            case TOKENS.asterisk:
            case TOKENS.percent:
                this.parseStatement(token);
                break;

            case TOKENS.multilineComment:
            case TOKENS.comment:
                this.parseComment(token);
                break;

            default:
                this.throwException(token);
                break;
        }

    }

    /**
     * Attach a child to the current node & set as latest.
     * @param node
     */
    addNode(node) {
        this.current.attachChild(node);
        node.parent = this.current;
        node.previousNode = this.latest;

        this.latest = node;
    }

    /**
     * Set a node as the current "parent" node that nodes should be added to.
     * @param node
     */
    setParent(node) {
        this.current = node;
    }

    /**
     * Unset current parent, moving back up towards the root of the AST.
     */
    unsetParent() {
        let newParent = this.current.parent;

        if(newParent) {
            this.current = newParent;
            this.latest = newParent;
        }
    }

    /**
     * Throw an exception when the parser finds an unexpected token.
     * @TODO: This could use some friendlier reporting.
     * @param token
     * @param expected
     */
    throwException(token, expected) {
        function ParserException() {
            this.name = 'ParserException';
            this.message = `Unexpected input token ${token.type} at ${token.source.line}:${token.source.column}.`;

            if(expected) {
                this.message += ` Expected ${expected}.`
            }

        }

        throw new ParserException();
    }


    /**
     * Attach whitespace to previous rule.
     */
    attachWhitespace(whitespace) {
        this.latest.after += whitespace;
    }

    /**
     * Attempt to parse an at-rule node.
     */
    parseAtRule(token) {
        var atRule = new AtRule(token);

        this.addNode(atRule);

        atRule.value = '';

        let child;
        while(child = this.nextToken()) {
            if(child.type === TOKENS.whitespace) {
                atRule.between = child.lexeme;
            } else if (
                child.type === TOKENS.string     ||
                child.type === TOKENS.hash       ||
                child.type === TOKENS.dollar     ||
                child.type === TOKENS.percent    ||
                child.type === TOKENS.dash       ||
                child.type === TOKENS.underscore ||
                child.type === TOKENS.plus       ||
                child.type === TOKENS.period     ||
                child.type === TOKENS.colon      ||
                child.type === TOKENS.comma      ||
                child.type === TOKENS.word       ||
                child.type === TOKENS.openParen  ||
                child.type === TOKENS.closeParen
            ) {
                // Handle interpolation... e.g. #{$variable}
                if(child.type === TOKENS.hash && this.peek().type === TOKENS.openCurlyBracket) {
                    atRule.value += this.readInterpolation(child);
                } else {
                    atRule.value += child.lexeme;
                }
            } else if(child.type === TOKENS.atSymbol) {
                this.setParent(atRule);
                this.parseAtRule(child);
                this.unsetParent();
                break;
            } else if(child.type === TOKENS.openCurlyBracket) {
                this.setParent(atRule);
                this.parseBlock(child);
                this.unsetParent();
                break;
            } else if (child.type === TOKENS.semicolon) {
                atRule.after += ';';
                break;
            } else {
                this.throwException(child);
            }
        }
    }

    /**
     * Attempt to read an interpolation & return its text.
     * e.g. #{$variable}
     */
    readInterpolation(token) {
        let text = '#';

        let next;
        while (next = this.nextToken()) {
            text += next.lexeme;

            // On the next closing curly bracket, leave the interpolation.
            if(next.type === TOKENS.closeCurlyBracket) {
                break;
            }
        }

        return text;
    }

    /**
     * Attempt to parse a statement.
     * @TODO Is this the right terminology? Should this exist in AST?
     */
    parseStatement(token) {
        let text = '';

        do {
            if(token.type === TOKENS.openCurlyBracket) {
                // We're entering a block, so this must be a rule.
                this.parseRuleset(token, token, text);
                break;
            } else if (token.type === TOKENS.hash) {
                // We found a hash, which might be either an ID or interpolation...
                if(this.peek().type === TOKENS.openCurlyBracket) {
                    text += this.readInterpolation(token);
                } else {
                    text += token.lexeme;
                }
            } else if (token.type === TOKENS.semicolon) {
                // We found a semicolon, so this must be a declaration.
                this.parseDeclaration(token, text);
                break;
            } else if (token.type === TOKENS.closeCurlyBracket && text.length) {
                // We found a closing curly with an unterminated declaration before it
                this.parseDeclaration(token, text, false);
                break;
            } else {
                text += token.lexeme;
            }
        } while (token = this.nextToken());
    }

    /**
     * Parse a ruleset "selector { ... }"
     * @param token
     * @param block
     * @param selector
     */
    parseRuleset(token, block, selector) {
        let ruleset = new Ruleset(token, selector);

        this.addNode(ruleset);
        this.setParent(ruleset);

        this.parseBlock(block);

        this.unsetParent();
    }

    /**
     * Parse a declaration "property: value;"
     * @param token
     * @param text
     * @param terminated
     */
    parseDeclaration(token, text, terminated = true) {
        let separator = text.indexOf(':');
        let property = text.substring(0, separator);
        let value = text.substring(separator + 1);

        let declaration = new Declaration(token, property, value);
        if(terminated) {
            declaration.after += ';';
        }

        this.addNode(declaration);
    }

    /**
     * Parse a block "{ ... }".
     * @param token
     */
    parseBlock(token) {
        let block = new Block(token);
        this.addNode(block);

        this.setParent(block);

        let child;
        while(child = this.nextToken()) {
            if(child.type === TOKENS.closeCurlyBracket) {
                break;
            } else if(child.type === TOKENS.openCurlyBracket) {
                this.parseBlock(child);
            } else {
                this.parseToken(child);
            }
        }

        this.unsetParent();
    }

    /**
     * Parse comment token into an AST node.
     * @param token
     */
    parseComment(token) {
        let comment = new Comment(token);
        this.addNode(comment);
    }

}

export default Parser;
