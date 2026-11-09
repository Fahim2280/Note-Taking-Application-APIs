const jwt = require('jsonwebtoken');
const env = require('../config/env');

class TokenService {
  constructor(secret = env.JWT_SECRET, expiresIn = env.JWT_EXPIRES_IN) {
    this.secret = secret;
    this.expiresIn = expiresIn;
  }

  generateToken(payload) {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn
    });
  }

  verifyToken(token) {
    return jwt.verify(token, this.secret);
  }
}

module.exports = TokenService;

