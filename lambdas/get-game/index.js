'use strict';

const getGame = require('./get-game');
const response = require('./response');

function getGameId(event) {
    return event.pathParameters.gameId;
}


exports.handler = function(event, context, callback) {

    const gameId = getGameId(event);
    return getGame(gameId)
        .then(gameState => response.ok(gameState))
        .then(resp => callback(null, resp))
        .catch(err => {
            console.error(JSON.stringify(err));
            const resp = response.internalServerError();
            return callback(null, resp);
        });

};
