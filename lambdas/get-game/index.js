'use strict';


const parseEvent = require('./parse-event');
const getGame = require('./get-game');


function success(body) {
    return {
        statusCode: 200,
        body: JSON.stringify(body)
    };
}

const error = {
    statusCode: 500
};

exports.handler = function(event, context, callback) {
    const {gameId} = parseEvent(event);
    getGame(gameId)
        .then(gameState => {
            const response = success(gameState);
            callback(null, response);
        })
        .catch(err => {
            console.error(JSON.stringify(err));
            callback(null, error);
        });
};