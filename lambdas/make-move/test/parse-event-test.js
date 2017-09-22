'use strict';

const parseEvent = require('../parse-event');
const event = require('./resources/make-move-event.json');
const chai = require('chai');
const { expect } = chai;


describe('Make Move Parser', () => {

    it('parses make move event', () => {
        const data = parseEvent(event);

        expect(data).to.eql({
            gameId: '123',
            playerId: 'abc',
            move: 'ROCK'
        })
    });

});