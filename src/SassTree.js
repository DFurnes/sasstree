/**
 * Let's get started.
 */
import fs from 'fs';
import Parser from './parser';

let parser = new Parser();

/**
 * Read input.
 */
const input = fs.readFileSync(__dirname + '/../input.scss', 'utf-8');

/**
 * Parse into an AST!
 */
let ast = parser.parse(input);

// Print the token list.
console.log(ast);
console.log('\n\n\n');

// Mirror out the things we understood.
ast.forEach(function(element) {
   //process.stdout.write(element.lexeme);
});

console.log("*mic drop*");
