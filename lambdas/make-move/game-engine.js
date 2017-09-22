'use strict';

const WINNING_COMBINATIONS = {
    ROCK:       'SCISSORS',
    PAPER:      'ROCK',
    SCISSORS:   'PAPER'
};

function playGame(Players) {
    const [playerA, playerB] = Players;
    if (playerA.move === playerB.move) {
        return {
            State: 'DRAW'
        };
    }
    else {
        let winner;
        if (WINNING_COMBINATIONS[playerA.move] === playerB.move) {
            winner = playerA.playerId;
        }
        else {
            winner = playerB.playerId;
        }
        return {
            State: 'WINNER',
            Winner: winner
        };
    }
}

function firstMove({GameId, playerId, move}) {
    return {
        GameId,
        Players: [{
            playerId,
            move
        }],
        State: "FIRST_MOVE"
    }
}

function secondMove({GameId, Players, playerId, move}) {
    Players.push({playerId, move});
    const result = playGame(Players);
    const newGameState = Object.assign({}, {GameId, Players}, result);
    return newGameState;
}


function makeMove(gameState, playerId, move) {
    const {GameId, Players, State} = gameState;
    switch (State) {
        case 'CREATED':
            return firstMove({GameId, playerId, move});
        case 'FIRST_MOVE':
            return secondMove({GameId, Players, playerId, move});
        default:
            throw new Error(`illegal state ${State}`);
    }
}

module.exports = {
    makeMove
};