'use strict';

const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    region: process.env.AWS_REGION
});

const GAME_TABLE = process.env.GAME_TABLE;

function pruneDate(data) {
    const {Item: {players, state, winner, expirationTime, gameId}} = data;

    if (state === 'FIRST_MOVE') {
        // do not reveal first player's move
        delete players[0].move;
    }

    return {
        gameId,
        state,
        winner,
        players,
        expirationTime
    }
}

function getGame(gameId) {
    const params = {
        TableName : GAME_TABLE,
        Key: {
            gameId: gameId
        }
    };
    return documentClient
        .get(params)
        .promise()
        .then(pruneDate);
}

module.exports = getGame;