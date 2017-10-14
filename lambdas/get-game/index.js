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


exports.handler = function (event, context, callback) {

    const params = {
        TableName: process.env.GAME_TABLE,
        Key: {
            gameId: event.pathParameters.gameId
        }
    };

    documentClient.get(params)
        .promise()
        .then(data => {
            let resp;
            if (data.Item) {
                resp = createResponse(200, data.Item)
            } else {
                resp = createResponse(404);
            }
            callback(null, resp);
        })
        .catch(error => {
            console.error(error);
            const resp = createResponse(500);
            callback(null, resp);
        });
};
