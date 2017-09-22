'use strict';

const url = require('url');
const parseEvent = require('./parse-event');
const createGame = require('./create-game');


function success({gameId, host, path}) {
    const location = url.format({
        host,
        pathname: `${path}/${gameId}`
    });
    return {
        statusCode: 201,
        headers: {
            Location: location
        }
    }
}

const error = {
    statusCode: 500
};

exports.handler = function(event, context, callback) {
    const {gameId, host, path} = parseEvent(event);
    createGame(gameId)
        .then(() => {
            const response = success({gameId, host, path});
            callback(null, response);
        })
        .catch(err => {
            console.error(JSON.stringify(err));
            callback(null, error)
        });
};