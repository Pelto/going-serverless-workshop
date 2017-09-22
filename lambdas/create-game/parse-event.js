'use strict';

function parse(event) {
    const {headers: {Host}, body, requestContext: {path}} = event;
    const gameId = JSON.parse(body).gameId;
    return {
        host: Host,
        gameId,
        path
    }
}

module.exports = parse;