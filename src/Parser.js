/**
 * The parser analyzes the semantics of the tokens passed from
 * the tokenizer, and builds an AST that linters can use.
 */

import Tokenizer from "./Tokenizer";

class Parser {
    constructor() {
        this.tokens = [];
        this.ast = [];
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

        // Loop through tokens & parse.
        //let token, rule;
        //while(token = this.next()) {
        //    rule = this.parseToken(token);
        //    this.addRule(rule);
        //}

        // @TODO Make a real AST!
        this.ast = this.tokens;

        return this.ast;
    }

    next() {
        // ...
    }

    parseToken(token) {
        // ...
    }

    addRule(rule) {
        // ...
    }
}

export default Parser;
