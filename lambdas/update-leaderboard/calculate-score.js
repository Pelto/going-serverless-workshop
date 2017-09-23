'use strict';

function calculateScore(gameData) {
    const scores = [];

    function addScore(playerId, score) {
        scores.push({
            playerId: playerId,
            score: score
        })
    }

    switch (gameData.state) {
        case 'WINNER':
            // game winner gets 2 points
            addScore(gameData.winner, 2);
            break;

        case 'DRAW':
            // each player gets 1 point if it is a draw
            gameData.players
                .forEach(player => addScore(player.playerId, 1));
            break;
    }
    return scores;
}

module.exports = calculateScore;