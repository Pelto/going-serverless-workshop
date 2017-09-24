'use strict';

const url = require('url');
const parseEvent = require('./parse-event');
const createGame = require('./create-game');


function success({gameId, host, path}) {
    const location = url.format({
        protocol: 'https:',
        host,
        pathname: `${path}/${gameId}`
    });
    return {
        statusCode: 201,
        headers: {
            Location: location,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': 86400
        }
    }
}

const error = {
    statusCode: 500
};

exports.handler = function(event, context, callback) {

    console.info(event);

    if (event.httpMethod === 'OPTIONS') {
        return callback(null, {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': 86400
            }
        });
    }

    const {gameId, host, path} = parseEvent(event);
    createGame(gameId)
        .then(() => {
            const response = success({gameId, host, path});
            callback(null, response);
        })
        .catch(err => {
            console.error(JSON.stringify(err));
            callback(null, error);
        });
};
