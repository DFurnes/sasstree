import test from 'tape-catch';
import Parser from '../src/Parser';

const { raw } = String;

test('Parser', function(t) {
    t.plan(2);


    t.test('simple rule', function(t) {
        t.plan(8);

        const parser = new Parser();
        const ast = parser.parse(raw`
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


    t.test('string escaping', function(t) {
        t.plan(2);

        let parser = new Parser();
        let ast = parser.parse(raw`$silly_escape: "\"";`);
        t.equals(ast.children[0].value, raw` "\""`, 'parses correct escaped quote value');

        parser = new Parser();
        ast = parser.parse(raw`$another_silly_escape: "\\";`);
        t.equals(ast.children[0].value, raw` "\\"`, 'parses correct escaped backslash value');
    });

});
