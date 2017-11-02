'use strict';

const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    region: process.env.AWS_REGION
});

function extractGameId(event) {
    return event.pathParameters.gameId;
}

function getGame(gameId) {
    
    const params = {
        TableName: process.env.GAME_TABLE,
        Key: {
            gameId: gameId
        }
    };
    
    return documentClient
        .get(params)
        .promise(data => data.Item)
}

function toResponse(data) {
    let response = {};

    if (data) {
        response.statusCode = 200;
        response.body = JSON.stringify(data);
    } else {
        response.statusCode = 404;
        response.body = "";
    }

    return response;
}

function returnError(callback) {
    return function(err) {
        console.error(err);
        callback(null, {
            statusCode: 500,
            body: JSON.stringify({
                message: err.message
            })
        });
    };
}

exports.handler = function(event, context, callback) {
    const gameId = extractGameId(event);
    return getGame(gameId)
        .then(toResponse)
        .then(response => callback(null, response))
        .catch(returnError(callback));
};
