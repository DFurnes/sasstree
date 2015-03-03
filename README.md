# SassTree ![NPM Version](https://img.shields.io/npm/v/sasstree.svg)

:construction: __Under construction! Not ready for public use.__ :construction:

SassTree is a JavaScript SCSS parser. 


### Usage
As a Node module:
```js
var Parser = require('sasstree');
var parser = new Parser();
parser.parse('.test { color: red }');

```

From the command line:
```sh
npm install -g sasstree
sasstree <INPUT_FILE>
cat output.json
```

### Development
```sh
npm install
./bin/sasstree tests/input.scss
```
