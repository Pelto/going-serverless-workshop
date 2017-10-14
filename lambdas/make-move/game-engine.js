'use strict';

const WINNING_COMBINATIONS = {
    ROCK:       'SCISSORS',
    PAPER:      'ROCK',
    SCISSORS:   'PAPER'
};

function playGame(players) {
    const [playerA, playerB] = players;
    if (playerA.move === playerB.move) {
        return {
            state: 'DRAW'
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
            state: 'WINNER',
            winner: winner
        };
    }
}

function firstMove({gameId, playerId, move}) {
    return {
        gameId,
        players: [{
            playerId,
            move
        }],
        state: "FIRST_MOVE"
    }
}

function secondMove({gameId, players, playerId, move}) {
    players.push({playerId, move});
    const result = playGame(players);
    const newGameState = Object.assign({}, {gameId, players}, result);
    return newGameState;
}


function makeMove(gameState, playerId, move) {
    const {gameId, players, state} = gameState;
    switch (state) {
        case 'CREATED':
            return firstMove({gameId, playerId, move});
        case 'FIRST_MOVE':
            return secondMove({gameId, players, playerId, move});
        default:
            throw new Error(`illegal state ${state}`);
    }
}

module.exports = {
    makeMove
};