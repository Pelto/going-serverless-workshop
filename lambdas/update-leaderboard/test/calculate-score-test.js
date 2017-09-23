'use strict';

const calculateScore = require('../calculate-score');
const chai = require('chai');
const { expect } = chai;


describe('Score Calculator', () => {

    it('game winner gets 2 points', () => {
        const gameData = [{
            players: [
                {
                    playerId: "mno",
                    move: "ROCK"
                },
                {
                    playerId: "pqr",
                    move: "SCISSORS"
                }
            ],
            state: 'WINNER',
            winner: "mno"
        }];

        const score = calculateScore(gameData);
        expect(score).to.eql([{
            playerId: 'mno',
            score: 2
        }])
    });


    it('players get 1 point each in draw', () => {
        const gameData = [{
            players: [
                {
                    playerId: "mno",
                    move: "ROCK"
                },
                {
                    playerId: "pqr",
                    move: "ROCK"
                }
            ],
            state: 'DRAW'
        }];

        const score = calculateScore(gameData);
        expect(score).to.deep.include(
            {playerId: 'mno', score: 1},
            {playerId: 'pqr', score: 1}
        )
    });


    it('calculates the score of multiple games', () => {
        const gameData = [
            {
                players: [
                    {
                        playerId: "mno",
                        move: "ROCK"
                    },
                    {
                        playerId: "pqr",
                        move: "ROCK"
                    }
                ],
                state: 'DRAW'
            },
            {
                players: [
                    {
                        playerId: "abc",
                        move: "ROCK"
                    },
                    {
                        playerId: "xyz",
                        move: "SCISSORS"
                    }
                ],
                state: 'WINNER',
                winner: "abc"
            },
            {
                players: [
                    {
                        playerId: "abc",
                        move: "ROCK"
                    },
                    {
                        playerId: "pqr",
                        move: "PAPER"
                    }
                ],
                state: 'WINNER',
                winner: "pqr"
            }
        ];

        const score = calculateScore(gameData);
        expect(score).to.deep.include(
            {playerId: 'mno', score: 1},
            {playerId: 'pqr', score: 1},
            {playerId: 'abc', score: 2},
            {playerId: 'pqr', score: 2}
        )
    })
});