'use strict';

const url = require('url');
const parseEvent = require('./parse-event');
const createGame = require('./create-game');
const response = require('./response');


function createLocation({gameId, host, path}) {
    return url.format({
        protocol: 'https:',
        host,
        pathname: `${path}/${gameId}`
    });
}


exports.handler = function(event, context, callback) {

    switch (event.httpMethod) {

        case 'POST': {
            const {gameId, host, path} = parseEvent(event);
            return createGame(gameId)
                .then(() => createLocation({gameId, host, path}))
                .then(location => response.createLocationResponse(response.CREATED, location))
                .then(resp => callback(null, resp))
                .catch(err => {
                    console.error(JSON.stringify(err));
                    const resp = response.createResponse(response.INTERNAL_SERVER_ERROR);
                    return callback(null, resp);
                });
        }

        case 'OPTIONS': {
            const resp = response.createResponse(response.OK);
            return callback(null, resp);
        }

        default: {
            const resp = response.createResponse(response.METHOD_NOT_ALLOWED);
            return callback(null, resp);
        }
    }
};
