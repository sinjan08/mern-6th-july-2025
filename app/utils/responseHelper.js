const apiResponse = (res, success = true, statusCode = 200, message = '', data = [], metadata = []) => {
    const response = {
        success: success,
        status: statusCode,
        message: message,
    };

    if (!success) {
        response.error = statusCode;
    } else {
        response.data = data;
    }

    if (metadata && metadata.length > 0) {
        response.metadata = metadata;
    }

    return res.status(statusCode).json(response);
}

HTTP_STATUS_CODES = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    PRECONDITION_FAILED: 412,
};

module.exports = {
    apiResponse,
    HTTP_STATUS_CODES
};