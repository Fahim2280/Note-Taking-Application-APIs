const AppError = require('../utils/AppError');

class AuthService {
  constructor(userRepository, hashService, tokenService) {
    this.userRepository = userRepository;
    this.hashService = hashService;
    this.tokenService = tokenService;
  }

  async register({ name, email, password, role = 'User', interests = [] }) {
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await this.userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new AppError('An account with this email already exists', 409);
    }

    const hashedPassword = await this.hashService.hashPassword(password);

    const user = await this.userRepository.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: role === 'Admin' ? 'Admin' : 'User',
      interests: Array.isArray(interests) ? interests.map((i) => i.trim().toLowerCase()) : []
    });

    const token = this.tokenService.generateToken({
      id: user._id,
      role: user.role
    });

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        interests: user.interests,
        createdAt: user.createdAt
      },
      token
    };
  }

  async login({ email, password }) {
    if (!email || !password) {
      throw new AppError('Please provide both email and password', 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userRepository.findByEmail(normalizedEmail, true);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await this.hashService.comparePassword(password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = this.tokenService.generateToken({
      id: user._id,
      role: user.role
    });

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        interests: user.interests,
        createdAt: user.createdAt
      },
      token
    };
  }
}

module.exports = AuthService;

