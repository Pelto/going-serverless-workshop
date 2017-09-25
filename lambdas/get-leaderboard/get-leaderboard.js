'use strict';

const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    region: process.env.AWS_REGION
});

const SCORE_TABLE = process.env.SCORE_TABLE;


function getLeaderboard() {
    const params = {
        TableName: SCORE_TABLE,
        IndexName: 'scoreIndex',
        AttributesToGet: ['playerId', 'score'],
        KeyConditions: {
            game: {
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

module.exports = getLeaderboard;