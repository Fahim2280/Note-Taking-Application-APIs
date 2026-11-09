const bcrypt = require('bcryptjs');
const env = require('../config/env');

class HashService {
  constructor(saltRounds = env.BCRYPT_SALT_ROUNDS) {
    this.saltRounds = saltRounds;
  }

  async hashPassword(password) {
    const salt = await bcrypt.genSalt(this.saltRounds);
    return bcrypt.hash(password, salt);
  }

  async comparePassword(candidatePassword, hashedPassword) {
    return bcrypt.compare(candidatePassword, hashedPassword);
  }
}

module.exports = HashService;

