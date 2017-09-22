'use strict';

const parseEvent = require('./parse-event');
const gameRepo = require('./game-repo');
const gameEngine = require('./game-engine');


function success(body) {
    return {
        statusCode: 200,
        body: JSON.stringify(body)
    }
}

const error = {
    statusCode: 500
};

exports.handler = function(event, context, callback) {
    const {gameId, playerId, move} = parseEvent(event);
    gameRepo.getGame(gameId)
        .then(gameState => gameEngine.makeMove(gameState, playerId, move))
        .then(gameRepo.saveGame)
        .then(newGameState => {
            const response = success(newGameState);
            callback(null, response);
        })
        .catch(err => {
            console.error(JSON.stringify(err));
            callback(null, error);
        });
};