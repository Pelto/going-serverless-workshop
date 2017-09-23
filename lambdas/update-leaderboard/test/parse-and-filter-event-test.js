'use strict';

const parseAndFilterEvent = require('../parse-and_filter-event');
const event = require('./resources/dynamodb-stream-event.json');
const chai = require('chai');
const { expect } = chai;


describe('DynamoDB Stream Event Parser', () => {

    it('parses game events', () => {
        const gameData = parseAndFilterEvent(event);

        expect(gameData).to.eql([
            {
                players: [
                    {
                        playerId: "ccc",
                        move: "ROCK"
                    },
                    {
                        playerId: "ddd",
                        move: "SCISSORS"
                    }
                ],
                state: 'WINNER',
                winner: "mno"
            },
            {
                players: [
                    {
                        playerId: "ggg",
                        move: "ROCK"
                    },
                    {
                        playerId: "hhh",
                        move: "ROCK"
                    }
                ],
                state: 'DRAW'
            }
        ])
    });
});