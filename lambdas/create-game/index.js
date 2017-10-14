'use strict';

const createLocation = require('./create-location');
const persistGame = require('./persist-game');
const response = require('./response');


function parseEvent(event) {
    const host = event.headers.Host;
    const path = event.requestContext.path;
    const gameId = JSON.parse(event.body).gameId;
    return {
        host,
        path,
        gameId
    }
}


exports.handler = function(event, context, callback) {

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
};
