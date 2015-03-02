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
         * Index of the current token being consumed.
         * @type {number}
         */
        this.pos = -1;
    }

    /**
     * Parse an array of tokens.
     * @param css
     */
    parse(css) {
        // Start a new tokenizer
        var tokenizer = new Tokenizer();

        console.time('tokenize');
        // If given a string, parse into an array of tokens. Otherwise copy, and continue.
        this.tokens = Array.isArray(css) ? css.slice() : tokenizer.tokenize(css);
        console.timeEnd('tokenize');

        console.time('parse');
        //Loop through tokens & parse.
        let token;
        while(token = this.nextToken()) {
            this.parseToken(token);
        }
        console.timeEnd('parse');

        return this.ast;
    }

    nextToken() {
        this.pos++;
        if(this.pos === this.tokens.length) return false;

        return this.tokens[this.pos];
    }

    prev() {
        // @TODO
    }

    parseToken(token) {
        switch (token.type) {
            case 'WHITESPACE':
                this.attachWhitespace(token.lexeme);
                break;

            //case 'AT':
            //    this.parseAtRule();
            //    break;

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
        this.latest.after = whitespace;
    }

    /**
     * Attempt to parse an at-rule node.
     */
    parseAtRule() {
        // no-op for now...
    }


}

export default Parser;
