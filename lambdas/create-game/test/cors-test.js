'use strict';

let lambda;
const chai = require('chai');
const { expect } = chai;


describe('Create Game CORS', () => {

    before(() => {
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
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Max-Age': 86400
                }
            });

            done();
        });
    })
});
