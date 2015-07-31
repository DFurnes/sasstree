import Parser from './Parser';
import fs from 'fs';
import path from 'path';
import program from 'commander';
import util from 'util';

/**
 * Hello, CLI.
 */
program
  .version(require('../package.json').version)
  .usage('[options] <file>')
  .option('-o, --output [filename]', 'output the tree as JSON')
  .option('-b, --bench', 'measure and output timing data')
  .parse(process.argv);


/**
 * Read input.
 */
var file = program.args[0];
var input = fs.readFileSync(path.resolve(file), 'utf-8');

console.log('');

/**
 * Parse into an AST!
 */
if(program.bench) {
  console.time('SassTree');
}

let parser = new Parser();
let ast = parser.parse(input, { bench: program.bench });

if(program.bench) {
  console.timeEnd('SassTree');
}

/**
 * Output the AST to a JSON file.
 */
if(program.output) {
  fs.writeFile(program.output, JSON.stringify(ast), function (err) {
    if (err) throw err;
    console.log(`Saved output to '${program.output}'.`);
  });
} else {
  console.log('Parsed abstract syntax tree:');
  console.log(util.inspect(ast, {depth: null, colors: true}));
}
