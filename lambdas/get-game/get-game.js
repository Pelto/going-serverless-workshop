'use strict';

const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    region: process.env.AWS_REGION
});

const GAME_TABLE = process.env.GAME_TABLE;

function pruneDate(data) {
    const {Item: {Players, State, Winner}} = data;
    let players;

    switch (State) {
        case 'FIRST_MOVE':
            // do not reveal first player's move
            players = Players.map(player => {
                const {playerId} = player;
                return playerId
            });
            break;

        case 'DRAW':
        case 'WINNER':
            players = Players;
            break;
    }

    return {
        state: State,
        winner: Winner,
        players
    }
}

function getGame(gameId) {
    const params = {
        TableName : GAME_TABLE,
        Key: {
            GameId: gameId
        }
    };
    return documentClient
        .get(params)
        .promise()
        .then(pruneDate);
}

module.exports = getGame;