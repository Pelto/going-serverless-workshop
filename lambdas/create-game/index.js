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
        .promise();
}


function createResponse(httpStatus) {
    return {
        statusCode: httpStatus
    }
}


exports.handler = function(event, context, callback) {

    const gameId = getGameId(event);

    return saveGame(gameId)
        .then(() => {
            const resp = createResponse(200);
            callback(null, resp);
        })
        .catch(err => {
            console.error(JSON.stringify(err));
            const resp = createResponse(500);
            callback(null, resp);
        });
};
