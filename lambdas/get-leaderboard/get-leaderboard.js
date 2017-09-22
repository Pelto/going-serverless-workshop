'use strict';

const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    region: process.env.AWS_REGION
});

const SCORE_TABLE = process.env.SCORE_TABLE;


function extractResult(data) {
    const {Items} = data;
    return Items.map(item => {
        const {PlayerId: {S}, Score: {N}} = item;
            return {
                playerId: S,
                score: N
            }
        }
    )
}

function getLeaderboard() {
    const params = {
        TableName : SCORE_TABLE,
    };
    // TODO refactor to take paging into consideration
    return documentClient
        .scan(params)
        .promise()
        .then(extractResult);
}

module.exports = getLeaderboard;