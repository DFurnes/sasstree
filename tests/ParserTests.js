import test from 'tape';
import Parser from '../src/Parser';

test('Parser', function(t) {
    t.plan(1);

    t.test('simple rule', function(t) {
        t.plan(8);

        const parser = new Parser();
        const ast = parser.parse(`
          p {
            color: red;
          }
        `);

        t.equals(ast.type, 'DocumentRoot', 'AST starts with DocumentRoot');
        t.equals(ast.children.length, 1, 'Root has one child');

        const rule = ast.children[0];
        t.equals(rule.type, 'Ruleset', 'Recognizes ruleset');
        t.equals(rule.selector, 'p ', 'Recognizes selector'); // @TODO: Should the whitespace be included here?

        const block = rule.children[0];
        t.equals(block.children.length, 1, 'Recognizes block\'s children');

        const declaration = block.children[0];
        t.equals(declaration.type, 'Declaration', 'Recognizes declaration');
        t.equals(declaration.property, 'color', 'Recognizes property');
        t.equals(declaration.value, ' red', 'Recognizes value');  // @TODO: Should the whitespace be included here?
    });

});
