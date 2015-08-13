import CodeMirror from 'codemirror';
import ObjectInspector from 'react-object-inspector';
import Parser from './Parser';
import React from 'react';
import 'codemirror/mode/sass/sass';

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
 * Render a visualization of the AST.
 */
function renderTree(input, canvas) {
    const scss = input.value;

    console.time('SassTree');

    let ast;
    try {
        let parser = new Parser();
        ast = parser.parse(scss, { bench: true });
        console.log(ast);
    } catch(e) {
        console.error(e);
        ast = "Parsing error."
    }

    console.timeEnd('SassTree');

    React.render(<ObjectInspector data={ast} />, canvas);
}

ready(function() {
    const input = document.getElementById('scss');
    const canvas = document.getElementById('tree');
    renderTree(input, canvas);

    var sourceEditor = CodeMirror.fromTextArea(input, { mode: 'sass' });
    sourceEditor.on('change', function(editor) {
        editor.save();
        renderTree(input, canvas);
    });
});

