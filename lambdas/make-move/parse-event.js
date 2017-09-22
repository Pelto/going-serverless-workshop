'use strict';

function parse(event) {
    const {body} = event;
    return JSON.parse(body);
}

module.exports = parse;