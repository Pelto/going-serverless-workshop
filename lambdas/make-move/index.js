'use strict';

const gameRepo = require('./game-repo');
const gameEngine = require('./game-engine');


function parseRequestBody(event) {
    return JSON.parse(event.body);
}


function createResponse(httpStatus, responseBody) {
    const response = {
        statusCode: httpStatus
    };
    if (responseBody) {
        response.body = JSON.stringify(body);
    }
    return response;
}


exports.handler = function(event, context, callback) {

    const {gameId, playerId, move} = parseRequestBody(event);

    return gameRepo.getGame(gameId)
        .then(gameState => gameEngine.makeMove(gameState, playerId, move))
        .then(gameRepo.saveGame)
        .then(newGameState => {
            const resp = createResponse(200, newGameState);
            return callback(null, resp);
        })
        .catch(err => {
            console.error(JSON.stringify(err));
            const resp = createResponse(500);
            return callback(null, resp);
        });
};