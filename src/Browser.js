import Parser from './Parser';
import React from 'react';
import ObjectInspector from 'react-object-inspector';

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

    let parser = new Parser();
    let ast = parser.parse(scss, { bench: true });
    console.log(ast);

    console.timeEnd('SassTree');

    React.render(<ObjectInspector data={ast} />, canvas);
}

ready(function() {
    const input = document.getElementById('scss');
    const canvas = document.getElementById('tree');
    renderTree(input, canvas);

    const trigger = document.getElementById('rerun');
    trigger.addEventListener('click', function() {
        renderTree(input, canvas);
    });
});

