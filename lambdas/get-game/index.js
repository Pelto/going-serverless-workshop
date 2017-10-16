'use strict';

const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    region: process.env.AWS_REGION
});


function createResponse(httpStatus, responseBody) {
    return {
        statusCode: httpStatus,
        body: responseBody ? JSON.stringify(responseBody) : ""
    };
}

function extractGameId(event) {
    return event.pathParameters.gameId;
}

exports.handler = function (event, context, callback) {

    const gameId = extractGameId(event);

    const params = {
        TableName: process.env.GAME_TABLE,
        Key: {
            gameId: gameId
        }
    };

    documentClient.get(params)
        .promise()
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
