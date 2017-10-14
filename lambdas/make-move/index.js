'use strict';

const gameRepo = require('./game-repo');
const gameEngine = require('./game-engine');
const response = require('./response');


function parseRequestBody(event) {
    const requestBody = JSON.parse(event.body);
    return requestBody;
}


exports.handler = function(event, context, callback) {

    const {gameId, playerId, move} = parseRequestBody(event);

    return gameRepo.getGame(gameId)
        .then(gameState => gameEngine.makeMove(gameState, playerId, move))
        .then(gameRepo.saveGame)
        .then(newGameState => response.ok(newGameState))
        .then(resp => callback(null, resp))
        .catch(err => {
            console.error(JSON.stringify(err));
            const resp = response.internalServerError();
            callback(null, resp);
        });
};