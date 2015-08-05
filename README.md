# SassTree [![NPM Version](https://img.shields.io/npm/v/sasstree.svg)](https://www.npmjs.com/sasstree) [![wercker status](https://app.wercker.com/status/552d7dfd13e8ed721afaab4360e229a4/s/master "wercker status")](https://app.wercker.com/project/bykey/552d7dfd13e8ed721afaab4360e229a4)

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
```

### Development
```sh
npm install
./bin/sasstree tests/input.scss
```
