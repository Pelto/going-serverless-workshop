'use strict';

const parseEvent = require('../parse-event');
const event = require('./resources/dynamodb-stream-event.json');
const chai = require('chai');
const { expect } = chai;


describe('DynamoDB Stream Event Parser', () => {

    it('parses game event', () => {
        const gameData = parseEvent(event);

        expect(gameData).to.eql([
            {
                playerIds: [
                    "mno",
                    "pqr",
                ],
                winner: "mno"
            }
        ])
    })
});