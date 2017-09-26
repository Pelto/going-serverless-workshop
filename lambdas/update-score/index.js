'use strict';


const parseAndFilter = require('./parse-and-filter-event');
const calculateScore = require('./calculate-score');
const persistScore = require('./persist-score');


function flatten(acc, curr) {
    return acc.concat(curr);
}


exports.handler = function(event, context, callback) {

    const promises = parseAndFilter(event)
        .map(calculateScore)
        .reduce(flatten, [])
        .map(persistScore);

    Promise.all(promises)
        .then(res => callback(null, res))
        .catch(err => {
            console.error(JSON.stringify(err));
            callback(err);
        });
};