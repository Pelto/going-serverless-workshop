'use strict';

const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    region: process.env.AWS_REGION
});

const SCORE_TABLE = process.env.SCORE_TABLE;


function persistScore(playerScore) {
    const {playerId, score} = playerScore;
    const params = {
        TableName: SCORE_TABLE,
        Key: {
            playerId: playerId
        },
        UpdateExpression: 'ADD #score :score SET #dummy = :dummy',
        ExpressionAttributeNames: {
            '#score': 'score',
            '#dummy': 'dummy'
        },
        ExpressionAttributeValues: {
            ':score': score,
            ':dummy': 'a'
        }
    };
    return documentClient
        .update(params)
        .promise();
}

module.exports = persistScore;