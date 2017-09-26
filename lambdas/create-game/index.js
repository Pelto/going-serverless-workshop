'use strict';

const parseEvent = require('./parse-event');
const createLocation = require('./create-location');
const persistGame = require('./persist-game');
const response = require('./response');


exports.handler = function(event, context, callback) {

    switch (event.httpMethod) {

        case 'POST': {
            const {gameId, host, path} = parseEvent(event);
            return persistGame(gameId)
                .then(() => createLocation({gameId, host, path}))
                .then(location => response.created(location))
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
