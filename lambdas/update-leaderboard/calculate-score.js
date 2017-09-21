'use strict';

function calculateGameScore(game) {
    const scores = {};
    if (game.winner) {
        scores[game.winner] = 2;
    }
    else {
        scores[game.playerIds[0]] = 1;
        scores[game.playerIds[1]] = 1;
    }
    return scores;
}

function calculateSumOfAllGames(totalScore, gameScore) {
    Object.keys(gameScore)
        .forEach(playerId => {
            totalScore[playerId] = totalScore[playerId]
                ? totalScore[playerId] += gameScore[playerId]
                : gameScore[playerId];
        });
    return totalScore;
}

function calculateScore(gameData) {
    return gameData
        .map(calculateGameScore)
        .reduce(calculateSumOfAllGames, {});
}

module.exports = calculateScore;