'use strict';

const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    region: process.env.AWS_REGION
});

const GAME_TABLE = process.env.GAME_TABLE;

function generateExpirationTime() {
    const date = new Date();
    // add one day
    date.setDate(date.getDate() + 1);
    const epochMilliSeconds = date.getTime();
    const epochSeconds = epochMilliSeconds / 1000;
    return Math.floor(epochSeconds);
}

function createGame(gameId) {
    const expirationTime = generateExpirationTime();
    const params = {
        TableName : GAME_TABLE,
        Item: {
            GameId: gameId,
            State: 'CREATED',
            ExpirationTime: expirationTime
        },
        ConditionExpression: 'attribute_not_exists(GameId)',
    };
    return documentClient
        .put(params)
        .promise();
}

module.exports = createGame;