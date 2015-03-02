class Node {
    constructor(type, content, map) {
        this.type = type;
        this.content = content;
        this.map = map;
    }

    attachChild(child) {
        if(!this.children) {
            this.children = [];
        }

        this.children.push(child);
    }
}

export default Node;
