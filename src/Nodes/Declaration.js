import Node from './Node';

/**
 * @class Node
 */
class Declaration extends Node {
    constructor(token, text) {
        super('Declaration', token.source)

        this.content = text;
    }


}

export default Declaration;
