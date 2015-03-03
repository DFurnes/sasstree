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

            case 'PERIOD':
            case 'HASH':
            case 'WORD':
                this.parseRule(token);
                break;

            case 'MULTILINE_COMMENT':
            case 'COMMENT':
                this.parseComment(token);
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

    setCurrentParent(node) {
        this.current = node;
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
        var node = new Node('AtRule', token.source);
        node.rule = token.lexeme;

        this.addNode(node);

        let _prevParent = this.current;
        this.setCurrentParent(node);

        node.value = '';

        let child;
        while(child = this.nextToken()) {
            if(child.type === 'WHITESPACE') {
                node.between = child.lexeme;
            } else if(child.type === 'STRING') {
                node.value += child.lexeme;
            } else if(child.type === 'DASH') {
                node.value += child.lexeme;
            } else if(child.type === 'COLON') {
                node.value += child.lexeme;
            } else if(child.type === 'COMMA') {
                node.value += child.lexeme;
            } else if(child.type === 'WORD') {
                node.value += child.lexeme;
            } else if(child.type === 'OPEN_CURLY') {
                this.parseBlock(child);
                break;
            } else if (child.type === 'OPEN_PAREN') {
                node.value += '(';
            } else if (child.type === 'CLOSE_PAREN') {
                node.value += ')';
            } else if (child.type === 'SEMICOLON') {
                node.after = ';';
                break;
            } else {
                console.log(node);
                this.throwException(child);
            }
        }

        this.setCurrentParent(_prevParent);
    }

    /**
     * Attempt to parse a rule node.
     */
    parseRule(token) {
        var node = new Node('Rule', token.source);
        this.addNode(node);

        let _prevParent = this.current;
        this.setCurrentParent(node);

        this.prev();
        let _text = '';

        let next;
        while (next = this.nextToken()) {

            if(next.type === 'OPEN_CURLY') {
                this.parseBlock(next);
                break;
            } else if(next.type === 'SEMICOLON') {
                node.type = 'Declaration';
                node.after += ';';
                break;
            } else {
                _text += next.lexeme;
            }
        }

        node.value = _text;

        this.setCurrentParent(_prevParent);
    }

    /**
     * Parse a block "{ ... }".
     * @param token
     */
    parseBlock(token) {
        var node = new Node('Block', token.source);
        this.addNode(node);

        let _prevParent = this.current;
        this.setCurrentParent(node);

        let child;
        while(child = this.nextToken()) {
            if(child.type === 'CLOSE_CURLY') {
                break;
            } else if(child.type === 'OPEN_CURLY') {
                this.parseBlock(child);
            } else {
                this.parseToken(child);
            }
        }

        this.setCurrentParent(_prevParent);
    }

    /**
     * Parse comment token into an AST node.
     * @param token
     */
    parseComment(token) {
        var node = new Node('Comment', token.source);
        this.addNode(node);

        node.multiline = (token.type === 'MULTILINE_COMMENT');
        node.content = token.lexeme;
    }

    /**
     * Throw an exception when the parser finds an unexpected token.
     * @TODO: This could use some friendlier reporting.
     * @param token
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


}

export default Parser;
