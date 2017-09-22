'use strict';

function parse(event) {
    const {pathParameters} = event;
    return pathParameters;
}

module.exports = parse;