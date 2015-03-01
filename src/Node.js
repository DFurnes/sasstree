class Node {
    constructor(type, content, map) {
        this.type = type;
        this.content = content;
        this.map = map;

        this.children = [];
    }

    attachChild(child) {
        this.children.push(child);
    }
}

export default Node;
