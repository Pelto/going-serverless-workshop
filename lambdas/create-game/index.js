'use strict';

const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    region: process.env.AWS_REGION
});


function saveGame(gameId) {
    const params = {
        TableName : process.env.GAME_TABLE,
        Item: {
            gameId: gameId,
            state: 'CREATED'
        },
        ConditionExpression: 'attribute_not_exists(gameId)',
    };
    return documentClient
        .put(params)
        .promise()
        .then(() => params.Item);
}


function getGameId(event) {
    return JSON.parse(event.body).gameId;
}


function createResponse(statusCode, body) {
    return {
        statusCode: statusCode,
        body: JSON.stringify(body)
    }
}


function successfulResponse(callback) {
    return game => {
        console.info(game);
        callback(null, createResponse(200, game));
    }
}


function failedResponse(callback) {
    return err => {
        console.error(err);
        return callback(null, createResponse(500, { message: err.message }));
    }
}


exports.handler = function(event, context, callback) {

    const gameId = getGameId(event);

    return saveGame(gameId)
        .then(successfulResponse(callback))
        .catch(failedResponse(callback));
};
