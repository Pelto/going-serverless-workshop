'use strict';


const eventParser = require('./event-parser');


exports.myHandler = function(event, context) {
    const gameData = eventParser.parse(event);

};