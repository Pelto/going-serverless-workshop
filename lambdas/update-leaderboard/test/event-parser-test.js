'use strict';

const eventParser = require('../event-parser');
const event = require('./resources/dynamodb-stream-event.json');
const chai = require('chai');
const { expect } = chai;


describe('DynamoDB Stream Event Parser', () => {
    it('parses game event', () => {
        const gameData = eventParser.parse(event);

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