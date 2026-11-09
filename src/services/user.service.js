const AppError = require('../utils/AppError');
const { parsePagination } = require('../utils/pagination');

class UserService {
  constructor(userRepository, hashService) {
    this.userRepository = userRepository;
    this.hashService = hashService;
  }

  async getProfile(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async updateProfile(userId, { name, interests }) {
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (interests && Array.isArray(interests)) {
      updateData.interests = interests.map((i) => i.trim().toLowerCase());
    }

    const updatedUser = await this.userRepository.updateById(userId, updateData);
    if (!updatedUser) {
      throw new AppError('User not found', 404);
    }
    return updatedUser;
  }

  async getAllUsers(query) {
    const { page, limit, skip } = parsePagination(query);
    return this.userRepository.findPaginated({ page, limit, skip });
  }

  async getUserById(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async deleteUser(userId) {
    const deleted = await this.userRepository.deleteById(userId);
    if (!deleted) {
      throw new AppError('User not found', 404);
    }
    return deleted;
  }

  /**
   * Scenario 1: Group Users by Interests with mandatory pagination
   */
  async getUsersByInterests(query) {
    const { page, limit, skip } = parsePagination(query);
    return this.userRepository.groupUsersByInterests({ page, limit, skip });
  }

  /**
   * Scenario 2: Get user with their posts via single aggregation pipeline lookup
   */
  async getUserWithPosts(userId) {
    const userWithPosts = await this.userRepository.getUserWithPosts(userId);
    if (!userWithPosts) {
      throw new AppError('User not found', 404);
    }
    return userWithPosts;
  }
}

module.exports = UserService;

