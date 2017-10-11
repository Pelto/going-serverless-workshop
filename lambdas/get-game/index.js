'use strict';

const parseEvent = require('./parse-event');
const getGame = require('./get-game');
const response = require('./response');


exports.handler = function(event, context, callback) {

    switch (event.httpMethod) {

        case 'GET': {
            const {gameId} = parseEvent(event);
            return getGame(gameId)
                .then(gameState => response.ok(gameState))
                .then(resp => callback(null, resp))
                .catch(err => {
                    console.error(JSON.stringify(err));
                    const resp = response.internalServerError();
                    return callback(null, resp);
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
