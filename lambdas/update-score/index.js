'use strict';

const AWS = require('aws-sdk');

const documentClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    region: process.env.AWS_REGION
});


function getWinners(event) {
    return event.Records
        .filter(record => {
            return (record.dynamodb.NewImage || {}).winner;
        })
        .map(record => record.dynamodb.NewImage.winner.S);
}


function addScore(winner) {
    const params = {
        TableName: process.env.SCORE_TABLE,
        Key: {
            playerId: winner,
        },
        UpdateExpression: 'ADD #score :score SET #gameTitle = :gameTitle',
        ExpressionAttributeNames: {
            '#score': 'score',
            '#gameTitle': 'gameTitle'
        },
        ExpressionAttributeValues: {
            ':score': 10,
            ':gameTitle': 'Rock Paper Scissors'
        }
    };
    return documentClient
        .update(params)
        .promise();
}


exports.handler = function(event, context, callback) {

    const promises = getWinners(event)
        .map(addScore);

    Promise.all(promises)
        .then(res => callback(null, res))
        .catch(err => {
            console.error(err);
            callback(err);
        });
};
