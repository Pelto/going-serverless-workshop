'use strict';

const url = require('url');

module.exports = ({gameId, host, path}) => {
    return url.format({
        protocol: 'https:',
        host,
        pathname: `${path}/${gameId}`
    });
};