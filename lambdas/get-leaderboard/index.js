'use strict';

const getLeaderboard = require('./get-leaderboard');

function success(body) {
    return {
        statusCode: 200,
        body: JSON.stringify(body)
    }
}

const error = {
    statusCode: 500
};

exports.handler = function(event, context, callback) {
    getLeaderboard()
        .then(leaderboard => {
            const response = success(leaderboard);
            callback(null, response);
        })
        .catch(err => {
            console.error(JSON.stringify(err));
            callback(null, error);
        })
};