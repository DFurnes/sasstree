import Node from './Node';

/**
 * @class Node
 */
class Comment extends Node {
    constructor(token) {
        super('Comment', token.source);

        this.content = token.lexeme;
        this.multiline = (token.type === 'MULTILINE_COMMENT');
    }


}

export default Comment;
