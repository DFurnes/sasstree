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

console.log('');

// File is a required parameter
if(program.args.length === 0) {
    console.error(`You must provide a source file. See 'sasstree -h' for details.`);
    process.exit(1);
}

/**
 * Read input.
 */
const file = path.resolve(program.args[0]);

// The file must exist!
if(!fs.existsSync(file)) {
    console.error(`Couldn't load '${file}'.`);
    process.exit(1);
}

const input = fs.readFileSync(file, 'utf-8');

/**
 * Parse into an AST!
 */
if(program.bench) {
    console.time('SassTree');
}

const parser = new Parser();
const ast = parser.parse(input, { bench: program.bench });

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
