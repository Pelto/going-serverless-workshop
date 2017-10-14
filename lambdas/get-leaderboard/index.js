'use strict';

const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    region: process.env.AWS_REGION
});

const response = require('./response');


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


exports.handler = function(event, context, callback) {

    return getLeaderboard()
        .then(leaderboard => response.ok(leaderboard))
        .then(resp => callback(null, resp))
        .catch(err => {
            console.error(JSON.stringify(err));
            const resp = response.internalServerError();
            callback(null, resp);
        });
};