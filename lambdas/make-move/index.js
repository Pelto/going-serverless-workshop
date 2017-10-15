'use strict';

const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    region: process.env.AWS_REGION
});

const WINNING_COMBINATIONS = {
    ROCK: 'SCISSORS',
    PAPER: 'ROCK',
    SCISSORS: 'PAPER'
};

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

function canMakeMove(gameState) {
    if (gameState.state === 'WINNER' || gameState.state === 'DRAW') {
        throw new Error(`Unable to make move once state equals ${gameState.state}`);
    }
    return gameState;
}

function addPlayer(playerId, move) {
    return function (gameState) {
        console.info(gameState);
        if (!gameState.players) {
            gameState.players = [];
        }
        const player = { playerId, move };
        gameState.players.push(player);
        return gameState;
    }
}

function updateState(gameState) {

    if (gameState.players.length === 1) {
        gameState.state = 'FIRST_MOVE';
        return gameState;
    }

    const playerA = gameState.players[0];
    const playerB = gameState.players[1];

    if (playerA.move === playerB.move) {
        gameState.state = 'DRAW';
        return gameState;
    }

    gameState.state = 'WINNER';
    gameState.winner = (WINNING_COMBINATIONS[playerA.move] === playerB.move)
        ? playerA.playerId
        : playerB.playerId;

    return gameState;
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

exports.handler = function (event, context, callback) {

    const { gameId, playerId, move } = JSON.parse(event.body);

    return getGame(gameId)
        .then(canMakeMove)
        .then(addPlayer(playerId, move))
        .then(updateState)
        .then(saveGame)
        .then(gameState => callback(null, {
            statusCode: 200,
            body: JSON.stringify(gameState)
        }))
        .catch(error => {
            console.error(error);
            callback(null, {
                statusCode: 500,
                body: JSON.stringify({
                    message: error.message
                })
            })
        });
};
