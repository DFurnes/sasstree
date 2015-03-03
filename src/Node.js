/**
 * @class Node
 *
 * This is the base class for all AST nodes.
 */
class Node {
    constructor(type, source) {
        this.type = type;
        this.source = source;

        /**
         * Text content after the node, such as whitespace or semicolons.
         * @type {string}
         */
        this.after = '';
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
