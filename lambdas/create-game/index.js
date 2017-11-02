'use strict';

const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    region: process.env.AWS_REGION
});


function getGameId(event) {
    return JSON.parse(event.body).gameId;
}


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
        .promise(() => params.Item);
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


exports.handler = function(event, context, callback) {

    const gameId = getGameId(event);

    return saveGame(gameId)
        .then(toResponse)
        .then(response => callback(null, response))
        .catch(err => {
            console.error(err);
            const resp = createResponse(500, {message: err.message});
            callback(null, resp);
        });
};
