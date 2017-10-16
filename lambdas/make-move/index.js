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


function addPlayer(playerId, move) {
    return function (gameState) {
        if (!gameState.players) {
            gameState.players = [];
        }
        const player = { playerId, move };
        gameState.players.push(player);
        return gameState;
    }
}


function updateState(gameState) {

    if (gameState.state === 'CREATED') {
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
    gameState.winner = WINNING_COMBINATIONS[playerA.move] === playerB.move
        ? playerA.playerId
        : playerB.playerId;

    return gameState;
}


function saveGame(gameState) {
    const params = {
        TableName: process.env.GAME_TABLE,
        Item: gameState,
        ConditionExpression: '#state IN (:created, :firstMove)',
        ExpressionAttributeNames: {
            '#state': 'state'
        },
        ExpressionAttributeValues: {
            ':created': 'CREATED',
            ':firstMove': 'FIRST_MOVE'
        }
    };
    return documentClient
        .put(params)
        .promise()
        .then(() => gameState);
}


function createResponse(httpStatus, responseBody) {
    return {
        statusCode: httpStatus,
        body: responseBody ? JSON.stringify(responseBody) : ""
    };
}


exports.handler = function (event, context, callback) {

    const { gameId, playerId, move } = JSON.parse(event.body);

    return getGame(gameId)
        .then(addPlayer(playerId, move))
        .then(updateState)
        .then(saveGame)
        .then(gameState => {
            const resp = createResponse(200, gameState);
            callback(null, resp);
        })
        .catch(err => {
            console.error(err);
            const resp = createResponse(500, {message: err.message});
            callback(null, resp);
        });
};
