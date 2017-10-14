'use strict';

const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    region: process.env.AWS_REGION
});


function getGameId(event) {
    return event.pathParameters.gameId;
}


function getGame(gameId) {
    const params = {
        TableName : process.env.GAME_TABLE,
        Key: {
            gameId: gameId
        }
    };
    return documentClient
        .get(params)
        .promise()
        .then(data => data.Item);
}


function createResponse(httpStatus, responseBody) {
    const response = {
        statusCode: httpStatus
    };
    if (responseBody) {
        response.body = JSON.stringify(body);
    }
    return response;
}


exports.handler = function(event, context, callback) {

    const gameId = getGameId(event);

    return getGame(gameId)
        .then(gameState => {
            const resp = createResponse(200, gameState);
            return callback(null, resp);
        })
        .catch(err => {
            console.error(JSON.stringify(err));
            const resp = createResponse(500);
            return callback(null, resp);
        });

};
