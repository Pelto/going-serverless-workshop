'use strict';

function filterModifiedEvents(record) {
    const {eventName} = record;
    return eventName === 'MODIFY';
}

function extractGameData(record) {
    const {dynamodb: {NewImage: {Players: {L}, State, Winner}}} = record;
    const playerIds = L.map(player => player.playerId);
    return {
        playerIds,
        state: State.S,
        winner: Winner.S
    };
}

function filterCompletedGames(gameData) {
    const {state} = gameData;
    return state === 'DRAW' || state === 'WINNER';
}

function parse(event) {
    const { Records} = event;
    return Records
        .filter(filterModifiedEvents)
        .map(extractGameData)
        .filter(filterCompletedGames);
}

module.exports = parse;