'use strict';

function parse(event) {
    const {headers: {Host}, body} = event;
    const gameId = JSON.parse(body).gameId;
    return {
        host: Host,
        gameId
    }
}

module.exports = parse;