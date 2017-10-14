'use strict';

const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    region: process.env.AWS_REGION
});

const GAME_TABLE = process.env.GAME_TABLE;

function getGame(gameId) {
    const params = {
        TableName: GAME_TABLE,
        Key: {
            gameId: gameId
        }
    };
    return documentClient
        .get(params)
        .promise()
        .then(data => data.Item);
}

function saveGame(gameState) {
    const params = {
        TableName: GAME_TABLE,
        Item: gameState
    };
    return documentClient
        .put(params)
        .promise()
        .then(() => gameState);
}

module.exports = {
    getGame,
    saveGame
};