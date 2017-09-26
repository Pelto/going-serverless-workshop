'use strict';

const getLeaderboard = require('./get-leaderboard');
const response = require('./response');


exports.handler = function(event, context, callback) {

    switch (event.httpMethod) {

        case 'GET': {
            return getLeaderboard()
                .then(leaderboard => response.ok(leaderboard))
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