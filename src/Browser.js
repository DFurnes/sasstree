import Parser from './Parser';

function ready(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    document.attachEvent('onreadystatechange', function() {
      if (document.readyState !== 'loading') {
        fn();
      }
    });
  }
}

/**
 * Read input & parse into an AST!
 */
function readAndParse() {
  const element = document.getElementById('scss');
  const input = element.value;

  /**
   * Parse into an AST!
   */
  console.time('SassTree');

  let parser = new Parser();
  let ast = parser.parse(input, { bench: true });
  console.log(ast);

  console.timeEnd('SassTree');

  return ast;
}

/**
 * Render a visualization of the AST.
 */
function renderTree(ast, el) {

  // @TODO

}

ready(function() {
  const trigger = document.getElementById('rerun');
  trigger.addEventListener('click', readAndParse);

  const ast = readAndParse();
  const canvas = document.getElementById('tree');
  renderTree(ast, canvas);
});

