'use strict';

const parseEvent = require('./parse-event');
const createGame = require('./create-game');

function success(host, gameId) {
    return {
        statusCode: 201,
        headers: {
            Location: `https://${host}/games/${gameId}`
        }
    }
}

const error = {
    statusCode: 500
};

exports.handler = function(event, context, callback) {
    const {gameId, host} = parseEvent(event);
    createGame(gameId)
        .then(() => {
            const response = success(host, gameId);
            callback(null, response);
        })
        .catch(err => {
            console.error(JSON.stringify(err));
            callback(null, error)
        });
};