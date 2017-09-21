'use strict';


const parseEvents = require('./parse-event');
const calculateScore = require('./calculate-score');

exports.myHandler = function(event, context) {
    const scores = parseEvents(event)
        .map(calculateScore);

};