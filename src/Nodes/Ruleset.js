import Node from './Node';

/**
 * @class Node
 */
class Ruleset extends Node {
    constructor(token, selector) {
        super('Ruleset', token.source);

        this.selector = selector;
    }
}

export default Ruleset;
