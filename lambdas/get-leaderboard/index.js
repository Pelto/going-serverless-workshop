'use strict';

const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    region: process.env.AWS_REGION
});


function getLeaderboard() {
    const params = {
        TableName: process.env.SCORE_TABLE,
        IndexName: 'scoreIndex',
        AttributesToGet: ['playerId', 'score'],
        KeyConditions: {
            gameTitle: {
                ComparisonOperator: "EQ",
                AttributeValueList: ["Rock Paper Scissors"]
            }
        },
        ScanIndexForward: false
    };
    return documentClient
        .query(params)
        .promise()
        .then(data => data.Items);
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

    return getLeaderboard()
        .then(leaderboard => {
            const resp = createResponse(200, leaderboard);
            callback(null ,resp);
        })
        .catch(err => {
            console.error(JSON.stringify(err));
            const resp = createResponse(500);
            callback(null, resp);
        });
};