'use strict';

const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    region: process.env.AWS_REGION
});


function getGame(gameId) {
    const params = {
        TableName: process.env.GAME_TABLE,
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
        TableName: process.env.GAME_TABLE,
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