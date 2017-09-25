'use strict';


const CORS_HEADERS = {
    'Access-Control-Allow-Origin': `${process.env.STATIC_WEBSITE_URL}`,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': 86400
};

function createResponse(httpStatus) {
    return {
        statusCode: httpStatus,
        headers: CORS_HEADERS
    };
}

function createLocationResponse(httpStatus, location) {
    const response = createResponse(httpStatus);
    response.headers.Location = location;
    return response;

}

module.exports = {
    createResponse,
    createLocationResponse,
    OK: 200,
    CREATED: 201,
    METHOD_NOT_ALLOWED: 405,
    INTERNAL_SERVER_ERROR: 500
};