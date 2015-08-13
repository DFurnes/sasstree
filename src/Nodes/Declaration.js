import Node from './Node';

/**
 * @class Node
 */
class Declaration extends Node {
    constructor(token, property, value) {
        super('Declaration', token.source)

        this.property = property;
        this.value = value;
    }


}

export default Declaration;
