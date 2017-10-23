'use strict';

const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    region: process.env.AWS_REGION
});


function updateGame(game, playerId, move) {

    const WINNING_COMBINATIONS = {
        ROCK: 'SCISSORS',
        PAPER: 'ROCK',
        SCISSORS: 'PAPER'
    };

    function addPlayer(game, playerId, move) {
        if (!game.players) {
            game.players = [];
        }
        const player = { playerId, move };
        game.players.push(player);
        return game;
    }

    function updateState(game) {

        if (game.state === 'CREATED') {
            game.state = 'FIRST_MOVE';
            return game;
        }

        const playerA = game.players[0];
        const playerB = game.players[1];

        if (playerA.move === playerB.move) {
            game.state = 'DRAW';
            return game;
        }

        game.state = 'WINNER';
        game.winner = WINNING_COMBINATIONS[playerA.move] === playerB.move
            ? playerA.playerId
            : playerB.playerId;

        return game;
    }

    addPlayer(game, playerId, move);
    updateState(game);

    return game;
}


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


function saveGame(game) {
    const params = {
        TableName: process.env.GAME_TABLE,
        Item: game,
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
        .then(() => game);
}


function createResponse(httpStatus, responseBody) {
    return {
        statusCode: httpStatus,
        body: responseBody
            ? JSON.stringify(responseBody)
            : ""
    };
}


exports.handler = function (event, context, callback) {

    const { gameId, playerId, move } = JSON.parse(event.body);

    return getGame(gameId)
        .then(game => updateGame(game, playerId, move))
        .then(saveGame)
        .then(game => {
            const resp = createResponse(200, game);
            callback(null, resp);
        })
        .catch(err => {
            console.error(err);
            const resp = createResponse(500, {message: err.message});
            callback(null, resp);
        });
};
