import { clone } from 'lodash';

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

    attachChild(child) {
        if(!this.children) {
            this.children = [];
        }

        this.children.push(child);
    }

    walk(callback) {
        callback(this);

        if(this.children && this.children.length) {
            this.children.forEach(function(child) {
                child.walk(callback);
            });
        }
    }

    toJSON() {
        var copy = clone(this);
        var type = copy.type;

        delete copy.type;
        delete copy.source;
        delete copy.parent;

        return {
            [type]: copy
        };
    }
}

export default Node;
