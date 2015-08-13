import test from 'tape-catch';
import Parser from '../src/Parser';

const { raw } = String;

test('Parser - simple rule', function(t) {
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


test('Parser - string escaping', function(t) {
    t.plan(2);

    let parser = new Parser();
    let ast = parser.parse(raw`$silly_escape: "\"";`);
    t.equals(ast.children[0].value, raw` "\""`, 'parses correct escaped quote value');

    parser = new Parser();
    ast = parser.parse(raw`$another_silly_escape: "\\";`);
    t.equals(ast.children[0].value, raw` "\\"`, 'parses correct escaped backslash value');
});

test('Parser - declaration with missing semicolon', function(t) {
    t.plan(2);

    const parser = new Parser();
    const ast = parser.parse(raw`p { color: red }`);

    const declaration = ast.find('Declaration')[0];
    t.ok(typeof declaration != 'undefined', 'Recognizes declaration');
    t.equals(declaration.property, 'color', 'Recognizes property');
});

test('Parser - get whitespace before a node', function(t) {
    t.plan(2);

    const parser = new Parser();
    const ast = parser.parse(raw`p { color: red; border: 0 }  `);

    const declarations = ast.find('Declaration');
    t.equals(declarations[0].parent.after, declarations[0].before, 'before matches parent\'s after');
    t.equals(declarations[0].after, declarations[1].before, 'before matches previous sibling\'s after');
});

test('Parser - strings and numbers', function(t) {
    t.plan(1);

    const parser = new Parser();
    const ast = parser.parse(raw`p { color: #0af; }  `);

    const declaration = ast.find('Declaration')[0];
    t.equals(declaration.value, ' #0af', 'reads hexadecimal value');
});

test('Parser - declarations', function(t) {
    t.plan(1);

    const parser = new Parser();
    const ast = parser.parse(raw`p { -webkit-transition: opacity 1s; }  `);

    const declaration = ast.find('Declaration')[0];
    t.equals(declaration.property, '-webkit-transition', 'reads vendor prefixed property');
});

