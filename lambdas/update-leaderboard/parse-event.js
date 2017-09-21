'use strict';

function filterModifiedEvents(record) {
    const {eventName} = record;
    return eventName === 'MODIFY';
}

function extractGameData(record) {
    const {dynamodb: {NewImage: {Players: {L}, State: {winner}}}} = record;
    const playerIds = L.map(player => player.playerId);
    return {
        playerIds,
        winner
    };
}

function parse(event) {
    const { Records} = event;
    return Records
        .filter(filterModifiedEvents)
        .map(extractGameData);
}

module.exports = parse;