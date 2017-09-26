'use strict';


const CORS_HEADERS = {
    'Access-Control-Allow-Origin': `${process.env.STATIC_WEBSITE_URL}`,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': 86400
};

const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    METHOD_NOT_ALLOWED: 405,
    INTERNAL_SERVER_ERROR: 500
};

function createResponse(httpStatus) {
    return {
        statusCode: httpStatus,
        headers: Object.assign({}, CORS_HEADERS)
    };
}

function ok(body) {
    const response = createResponse(HTTP_STATUS.OK);
    if (body) {
        response.body = JSON.stringify(body);
    }
    return response;
}

function created(location) {
    const response = createResponse(HTTP_STATUS.CREATED);
    response.headers.Location = location;
    return response;
}

function methodNotAllowed() {
    return createResponse(HTTP_STATUS.METHOD_NOT_ALLOWED);
}

function internalServerError() {
    return createResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR);
}


module.exports = {
    ok,
    created,
    methodNotAllowed,
    internalServerError
};