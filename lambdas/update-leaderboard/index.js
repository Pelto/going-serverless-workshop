'use strict';


const parseEvents = require('./parse-event');
const calculateScore = require('./calculate-score');
const persistScore = require('./persist-score');

exports.handler = function(event, context, callback) {
    parseEvents(event)
        .map(calculateScore)
        .map(persistScore)
        .then(res => callback(null, res))
        .catch(err => {
            console.error(JSON.stringify(err));
            callback(err);
        });
};