'use strict';

const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    region: process.env.AWS_REGION
});

const response = require('./response');


function parseEvent(event) {
    const host = event.headers.Host;
    const path = event.requestContext.path;
    const gameId = JSON.parse(event.body).gameId;
    return {
        host,
        path,
        gameId
    }
}

function saveGame(gameId) {
    const params = {
        TableName : process.env.GAME_TABLE,
        Item: {
            gameId: gameId,
            state: 'CREATED'
        },
        ConditionExpression: 'attribute_not_exists(gameId)',
    };
    return documentClient
        .put(params)
        .promise();
}

function createLocation({gameId, host, path}) {
    return url.format({
        protocol: 'https:',
        host,
        pathname: `${path}/${gameId}`
    });
}

exports.handler = function(event, context, callback) {

    const {gameId, host, path} = parseEvent(event);

    return saveGame(gameId)
        .then(() => createLocation({gameId, host, path}))
        .then(location => response.created(location))
        .then(resp => callback(null, resp))
        .catch(err => {
            console.error(JSON.stringify(err));
            const resp = response.internalServerError();
            return callback(null, resp);
        });
};
