'use strict';

function filterModifiedEvents(record) {
    const {eventName} = record;
    return eventName === 'MODIFY';
}

function extractGameData(record) {
    const {dynamodb: {NewImage: {players: {L}, state, winner}}} = record;
    const playerIds = L.map(player => player.playerId);
    return {
        playerIds,
        state: state.S,
        winner: winner.S
    };
}

function filterCompletedGames(gameData) {
    const {state} = gameData;
    return state === 'DRAW' || state === 'WINNER';
}

function parse(event) {
    const {Records} = event;
    return Records
        .filter(filterModifiedEvents)
        .map(extractGameData)
        .filter(filterCompletedGames);
}

module.exports = parse;