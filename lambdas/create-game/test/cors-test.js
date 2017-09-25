'use strict';

let lambda;
const chai = require('chai');
const { expect } = chai;

const ORIGIN = 'https://s3.example.com';


describe('CORS', () => {

    before(() => {
        process.env.STATIC_WEBSITE_URL = ORIGIN;
        lambda = require('../');
    });

    it('Allows CORS when http method is OPTIONS', done => {

        lambda.handler({httpMethod: 'OPTIONS'}, {}, (error, result) => {
            if (error) {
                return done(error);
            }

            expect(result).to.eql({
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': ORIGIN,
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Max-Age': 86400
                }
            });

            done();
        });
    })
});
