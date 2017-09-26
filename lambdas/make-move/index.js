'use strict';

const parseEvent = require('./parse-event');
const gameRepo = require('./game-repo');
const gameEngine = require('./game-engine');
const response = require('./response');


exports.handler = function(event, context, callback) {

    switch (event.httpMethod) {

        case 'POST': {
            const {gameId, playerId, move} = parseEvent(event);
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
        }

        case 'OPTIONS': {
            const resp = response.ok();
            return callback(null, resp);
        }

        default: {
            console.error(`Method not allowed: ${event.httpMethod}`);
            const resp = response.methodNotAllowed();
            return callback(null, resp);
        }
    }
};