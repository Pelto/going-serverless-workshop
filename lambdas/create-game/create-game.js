'use strict';

const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    region: process.env.AWS_REGION
});

const GAME_TABLE = process.env.GAME_TABLE;

function createGame(gameId) {
    const params = {
        TableName : GAME_TABLE,
        Item: {
            GameId: gameId,
            State: { state: 'CREATED' },
        },
        ConditionExpression: 'attribute_not_exists(GameId)',
    };
    return documentClient
        .update(params)
        .promise();
}

module.exports = createGame;