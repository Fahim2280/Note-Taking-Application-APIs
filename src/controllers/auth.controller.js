const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class AuthController {
  constructor(authService) {
    this.authService = authService;

    // Bind methods to preserve `this` context
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
  }

  register = asyncHandler(async (req, res) => {
    const { name, email, password, role, interests } = req.body;
    const result = await this.authService.register({
      name,
      email,
      password,
      role,
      interests
    });

    return ApiResponse.created(res, {
      message: 'User registered successfully',
      data: result
    });
  });

  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await this.authService.login({ email, password });

    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Login successful',
      data: result
    });
  });
}

module.exports = AuthController;

