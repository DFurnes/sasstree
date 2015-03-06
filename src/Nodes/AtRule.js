import Node from './Node';

/**
 * @class Node
 */
class AtRule extends Node {
    constructor(token) {
        super('AtRule', token.source);

        this.rule = token.lexeme;
    }
}

export default AtRule;
