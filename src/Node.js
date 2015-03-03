/**
 * @class Node
 *
 * This is the base class for all AST nodes.
 */
class Node {
    constructor(type, map) {
        this.type = type;
        this.map = map;
    }

    setContent(content) {
        this.content = content;
    }

    attachChild(child) {
        if(!this.children) {
            this.children = [];
        }

        this.children.push(child);
    }
}

export default Node;
