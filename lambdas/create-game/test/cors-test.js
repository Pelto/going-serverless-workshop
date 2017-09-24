'use strict';

const lambda = require('../');
const chai = require('chai');
const { expect } = chai;


describe('CORS', () => {

    it('Allows cors when httpMethod is OPTIONS', done => {

        lambda.handler({httpMethod: 'OPTIONS'}, {}, (error, result) => {
            if (error) {
                return done(error);
            }

            expect(result).to.eql({
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Max-Age': 86400
                }
            })

            done();
        });
    })
});
