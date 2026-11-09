const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const createAuthMiddleware = (tokenService, userRepository) => {
  const authenticate = asyncHandler(async (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Authentication required. Please provide a valid Bearer token.', 401));
    }

    const decoded = tokenService.verifyToken(token);
    if (!decoded || !decoded.id) {
      return next(new AppError('Invalid or expired token.', 401));
    }

    // Rely on MongoDB default _id index
    const user = await userRepository.findById(decoded.id);
    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    req.user = user;
    next();
  });

  const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return next(
          new AppError(`Forbidden: You do not have permission to perform this action. Required role: [${allowedRoles.join(', ')}]`, 403)
        );
      }
      next();
    };
  };

  return {
    authenticate,
    authorizeRoles
  };
};

module.exports = createAuthMiddleware;

