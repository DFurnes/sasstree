import Node from './Node';

/**
 * @class Node
 */
class Block extends Node {
    constructor(token) {
        super('Block', token.source);
    }
}

export default Block;
