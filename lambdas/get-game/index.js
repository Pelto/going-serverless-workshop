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
        .promise()
}


function createResponse(httpStatus, responseBody) {
    return {
        statusCode: httpStatus,
        body: responseBody
            ? JSON.stringify(responseBody)
            : ""
    };
}


exports.handler = function (event, context, callback) {

    const gameId = extractGameId(event);

    return getGame(gameId)
        .then(data => {
            const resp = data.Item
                ? createResponse(200, data.Item)
                : createResponse(404);
            callback(null, resp);
        })
        .catch(err => {
            console.error(err);
            const resp = createResponse(500, {message: err.message});
            callback(null, resp);
        });
};
