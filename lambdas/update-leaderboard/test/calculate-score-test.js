'use strict';

const calculateScore = require('../calculate-score');
const chai = require('chai');
const { expect } = chai;


describe('Score Calculator', () => {

    it('game winner gets 2 points', () => {
        const gameData = [{
            playerIds: [
                "mno",
                "pqr",
            ],
            winner: "mno"
        }];

        const score = calculateScore(gameData);
        expect(score).to.eql({
            mno: 2,
        })
    });


    it('players get 1 point each in draw', () => {
        const gameData = [{
            playerIds: [
                "mno",
                "pqr",
            ]
        }];

        const score = calculateScore(gameData);
        expect(score).to.eql({
            mno: 1,
            pqr: 1,
        })
    });


    it('calculates the score of multiple games', () => {
        const gameData = [
            {
                playerIds: [
                    "mno",
                    "pqr",
                ]
            },
            {
                playerIds: [
                    "abc",
                    "pqr",
                ],
                winner: "abc"
            },
            {
                playerIds: [
                    "mno",
                    "pqr",
                ],
                winner: "pqr"
            }
        ];

        const score = calculateScore(gameData);
        expect(score).to.eql({
            abc: 2,
            mno: 1,
            pqr: 3,
        })
    })

});