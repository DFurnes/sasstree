import fs from 'fs';
import path from 'path';
import Parser from './Parser';

/**
 * Read input.
 */
var fileName = process.argv[2];
var input = fs.readFileSync(path.join(process.cwd(), fileName), 'utf-8');

/**
 * Parse into an AST!
 */
console.log('');
console.time('SassTree');

let parser = new Parser();
let ast = parser.parse(input);

console.timeEnd('SassTree');

/**
 * Output the AST to a JSON file.
 */
fs.writeFile('output.json', JSON.stringify(ast), function (err) {
    if (err) throw err;
    console.log('Saved output to `output.json`.');
});
