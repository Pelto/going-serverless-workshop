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
    const {gameId, players, state, winner} = gameState;

    let updateExpression = 'SET #state = :state, #players = :players';
    const attributeNames = {
        '#state': 'state',
        '#players': 'players',
    };
    const attributeValues = {
        ':players': players,
        ':state': state,
    };
    if (winner) {
        updateExpression += ', #winner = :winner';
        attributeNames['#winner'] = 'winner';
        attributeValues[':winner'] = winner;
    }

    const params = {
        TableName: GAME_TABLE,
        Key: {gameId: gameId},
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: attributeNames,
        ExpressionAttributeValues: attributeValues,
        ReturnValues: 'ALL_NEW'
    };
    return documentClient
        .update(params)
        .promise()
        .then(data => data.Attributes);
}

module.exports = {
    getGame,
    saveGame
};