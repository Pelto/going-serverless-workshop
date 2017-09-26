'use strict';

function dynamoDbEventTypeFilter(record) {
    const {eventName} = record;
    // score is not calculated on INSERT or REMOVE event
    return eventName === 'MODIFY';
}

function pruneDynamoPlayer(player) {
    const {playerId, move} = player.M;
    return {
        playerId: playerId.S,
        move: move.S
    };
}

function extractGameData(record) {
    const {dynamodb: {NewImage: {players, state, winner}}} = record;

    const result = {
        players: players.L.map(pruneDynamoPlayer),
        state: state.S,
    };
    if (winner) {
        result.winner = winner.S
    }
    return result;
}

function gameStateFilter(gameData) {
    const {state} = gameData;
    // score is only calculated on completed games
    return state === 'DRAW' || state === 'WINNER';
}

function parse(event) {
    const {Records} = event;
    return Records
        .filter(dynamoDbEventTypeFilter)
        .map(extractGameData)
        .filter(gameStateFilter);
}

module.exports = parse;