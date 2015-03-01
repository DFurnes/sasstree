require("babel/register");

var fs = require('fs');
var Parser = require('../lib/parser');
var parser = new Parser();


// Read input.
var input = fs.readFileSync(__dirname + '/../input.scss', 'utf-8');


module.exports = {
    name: 'Sasslint',
    maxTime: 15,
    tests: [
        {
            name: 'Parser',
            fn: function() {

                // Parse into an AST!
                var ast = parser.parse(input);
            }
        }
    ]
};