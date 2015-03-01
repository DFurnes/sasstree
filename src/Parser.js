/**
 * The parser analyzes the semantics of the tokens passed from
 * the tokenizer, and builds an AST that linters can use.
 */

import Tokenizer from './Tokenizer';
import Node from './Node';

class Parser {
    constructor() {
        this.tokens = [];
        this.ast = [];

        var root = new Node('DocumentRoot', '', null);
        this.ast.push(root);

        /**
         * Current position in the AST... this is where we add child nodes to.
         * @type {Node}
         */
        this.current = root;

        this.latest = root;

        /**
         * Current token being consumed.
         * @type {null}
         */
        this.pos = null;
    }

    /**
     * Parse an array of tokens.
     * @param css
     */
    parse(css) {
        // Start a new tokenizer
        var tokenizer = new Tokenizer();

        // If given a string, parse into an array of tokens. Otherwise copy, and continue.
        this.tokens = Array.isArray(css) ? css.slice() : tokenizer.tokenize(css);

        //Loop through tokens & parse.
        let token, rule;
        while(token = this.next()) {
            this.parseToken(token);
        }

        return this.ast;
    }

    next() {
        this.pos = this.tokens.shift();
        return this.pos;
    }

    prev() {
        // @TODO
        this.tokens.unshift(this.current);
    }

    parseToken(token) {
        switch (token.type) {
            case 'WHITESPACE':
                this.attachWhitespace(token.lexeme);
                break;

            default:
                var node = new Node(token.type, token.lexeme, token.source);
                this.addNode(node);
                break;
        }

    }

    addNode(rule) {
        this.current.attachChild(rule);
        this.latest = rule;
    }

    /**
     * Attach whitespace to previous rule.
     */
    attachWhitespace(whitespace) {
        if(this.latest) {
            this.latest.after = whitespace;
        } else {
            console.error('Can\'t attach whitespace!');
        }
    }

    /**
     * Attempt to parse an at-rule node.
     */
    parseAtRule() {
        // no-op for now...
    }


}

export default Parser;
