'use strict';

const parseEvent = require('../parse-event');
const event = require('./resources/api-gateway-proxy-event.json');
const chai = require('chai');
const { expect } = chai;


describe('Create Game Parser', () => {

    it('parses create event', () => {
        const data = parseEvent(event);

        expect(data).to.eql({
            gameId: 42,
            host: '1234567890.execute-api.us-east-1.amazonaws.com'
        })
    })
});