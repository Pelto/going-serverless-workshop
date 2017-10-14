'use strict';

const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    region: process.env.AWS_REGION
});


function pruneData(data) {
    const game = data.Item;
    if (game.state === 'FIRST_MOVE') {
        // do not reveal first player's move
        delete game.players[0].move;
    }
    return game;
}


function getGame(gameId) {
    const params = {
        TableName : process.env.GAME_TABLE,
        Key: {
            gameId: gameId
        }
    };
    return documentClient
        .get(params)
        .promise()
        .then(pruneData);
}

module.exports = getGame;