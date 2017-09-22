'use strict';

const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    region: process.env.AWS_REGION
});

const GAME_TABLE = process.env.GAME_TABLE;

function getGame(gameId) {
    const params = {
        TableName : GAME_TABLE,
        Key: {
            GameId: gameId
        }
    };
    return documentClient
        .get(params)
        .promise();
}

module.exports = getGame;