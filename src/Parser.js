import Tokenizer from './Tokenizer';
import Node from './Node';

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
        this.ast = [];

        // Create a document root node.
        var root = new Node('DocumentRoot', '', null);
        this.ast.push(root);

        /**
         * Marks the current position in the AST. This is where we add child nodes to.
         * @type {Node}
         */
        this.current = root;

        /**
         * The last node that was added to the tree.
         * @type {Node}
         */
        this.latest = root;

        /**
         * Index of the current token being consumed.
         * @type {number}
         */
        this.pos = -1;
    }

    /**
     * Parse an array of tokens.
     * @param {string} scss
     */
    parse(scss) {
        // Start a new tokenizer
        var tokenizer = new Tokenizer();

        console.time('tokenize');
        // Use the Tokenizer to parse SCSS string into an array of tokens.
        this.tokens = tokenizer.tokenize(scss);
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
        if(this.pos === this.tokens.length) return false;
        this.pos++;

        return this.tokens[this.pos];
    }

    prev() {
        if(this.pos === 0) return false;
        this.pos--;

        return this.tokens[this.pos];
    }

    parseToken(token) {
        switch (token.type) {
            case 'WHITESPACE':
                this.attachWhitespace(token.lexeme);
                break;

            case 'AT':
                this.parseAtRule(token);
                break;

            default:
                var node = new Node(token.type, token.source);
                node.setContent(token.lexeme);
                this.addNode(node);
                break;
        }

    }

    /**
     * Attach a child to the current node & set as latest.
     * @param node
     */
    addNode(node) {
        this.current.attachChild(node);
        this.latest = node;
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
    parseAtRule(token) {
        var node = new Node('AT-RULE', token.lexeme, token.source);

        let next = this.nextToken();
        if(next.type === 'WORD') {
            node.content = next.lexeme;
        }

        /**
         * @TODO Parse value, block of child nodes, & semicolon.
         */

        this.addNode(node);
    }


}

export default Parser;
