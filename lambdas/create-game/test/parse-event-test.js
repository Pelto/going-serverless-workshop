'use strict';

const parseEvent = require('../parse-event');
const event = require('./resources/create-game-event.json');
const chai = require('chai');
const { expect } = chai;


describe('Create Game Parser', () => {

    it('parses create event', () => {
        const data = parseEvent(event);

        expect(data).to.eql({
            gameId: '42',
            host: 'ig6t2ndux2.execute-api.eu-west-1.amazonaws.com',
            path: '/Prod/games'
        })
    })
});