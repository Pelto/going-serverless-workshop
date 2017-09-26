'use strict';

const createLocation = require('../create-location');
const chai = require('chai');
const { expect } = chai;


describe('Create Location', () => {

    it('creates a location based on gameId, host and path', () => {
        const location = createLocation({
            gameId: 42,
            host: 'api.example.com',
            path: '/games'
        });

        expect(location).to.eql('https://api.example.com/games/42');
    })
});