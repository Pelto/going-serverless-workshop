'use strict';

const parseEvent = require('../parse-event');
const event = require('./resources/get-game-event.json');
const chai = require('chai');
const { expect } = chai;


describe('Get Game Parser', () => {

    it('parses create event', () => {
        const data = parseEvent(event);

        expect(data).to.eql({ gameId: '123' });
    })
});