class ApiResponse {
  static success(res, { statusCode = 200, message = 'Success', data = null, pagination = null } = {}) {
    const payload = {
      success: true,
      statusCode,
      message
    };

    if (pagination !== null) {
      payload.pagination = pagination;
    }

    if (data !== null) {
      payload.data = data;
    }

    return res.status(statusCode).json(payload);
  }

  static created(res, { message = 'Resource created successfully', data = null } = {}) {
    return ApiResponse.success(res, { statusCode: 201, message, data });
  }

  static error(res, { statusCode = 500, message = 'Internal Server Error', errors = null } = {}) {
    const payload = {
      success: false,
      statusCode,
      message
    };

    if (errors !== null) {
      payload.errors = errors;
    }

    return res.status(statusCode).json(payload);
  }
}

module.exports = ApiResponse;

