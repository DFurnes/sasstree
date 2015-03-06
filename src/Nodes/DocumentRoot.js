import Node from './Node';

/**
 * @class Node
 */
class DocumentRoot extends Node {
    constructor() {
        super('DocumentRoot', null)

        delete this.source;
    }


}

export default DocumentRoot;
