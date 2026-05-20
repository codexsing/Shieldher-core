class ApiResponse {
  static success(res, { data = null, message = "Success", statusCode = 200 } = {}) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(res, { message = "Something went wrong", statusCode = 500, errors = null } = {}) {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(errors && { errors }),
    });
  }

  static paginated(res, { data, total, page, limit, message = "Success" }) {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        total,
        page:       Number(page),
        limit:      Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  }
}

module.exports = ApiResponse;
