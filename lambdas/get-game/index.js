'use strict';

const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    region: process.env.AWS_REGION
});


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
            const response = {};

            if (data.Item) {
                response.statusCode = 200;
                response.body = JSON.stringify(data.Item);
            } else {
                response.statusCode = 404;
                response.body = "";
            }

            return callback(null, response);
        })
        .catch(error => {
            console.error(error);
            return callback(null, {
                statusCode: 500,
                body: JSON.stringify({
                    message: error.message
                })
            })
        });
};
