const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class UserController {
  constructor(userService) {
    this.userService = userService;

    this.getProfile = this.getProfile.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
    this.getAllUsers = this.getAllUsers.bind(this);
    this.getUserById = this.getUserById.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
    this.createUser = this.createUser.bind(this);
    this.updateUserAdmin = this.updateUserAdmin.bind(this);
    this.getUsersByInterests = this.getUsersByInterests.bind(this);
    this.getUserWithPosts = this.getUserWithPosts.bind(this);
  }

  createUser = asyncHandler(async (req, res) => {
    const user = await this.userService.createUser(req.body);
    return ApiResponse.success(res, {
      statusCode: 201,
      message: 'User created successfully',
      data: user
    });
  });

  updateUserAdmin = asyncHandler(async (req, res) => {
    const user = await this.userService.updateUserAdmin(req.params.id, req.body);
    return ApiResponse.success(res, {
      message: 'User updated successfully',
      data: user
    });
  });

  getProfile = asyncHandler(async (req, res) => {
    const user = await this.userService.getProfile(req.user._id);
    return ApiResponse.success(res, {
      message: 'Profile retrieved successfully',
      data: user
    });
  });

  updateProfile = asyncHandler(async (req, res) => {
    const { name, interests } = req.body;
    const updated = await this.userService.updateProfile(req.user._id, { name, interests });
    return ApiResponse.success(res, {
      message: 'Profile updated successfully',
      data: updated
    });
  });

  getAllUsers = asyncHandler(async (req, res) => {
    const { data, pagination } = await this.userService.getAllUsers(req.query);
    return ApiResponse.success(res, {
      message: 'Users retrieved successfully',
      data,
      pagination
    });
  });

  getUserById = asyncHandler(async (req, res) => {
    const user = await this.userService.getUserById(req.params.id);
    return ApiResponse.success(res, {
      message: 'User retrieved successfully',
      data: user
    });
  });

  deleteUser = asyncHandler(async (req, res) => {
    await this.userService.deleteUser(req.params.id);
    return ApiResponse.success(res, {
      message: 'User deleted successfully'
    });
  });

  /**
   * Scenario 1: Group Users by Interests (Single aggregation query with pagination)
   */
  getUsersByInterests = asyncHandler(async (req, res) => {
    const { data, pagination } = await this.userService.getUsersByInterests(req.query);
    return ApiResponse.success(res, {
      message: 'Users grouped by interests retrieved successfully',
      data,
      pagination
    });
  });

  /**
   * Scenario 2: Retrieve User with their posts using $lookup aggregation
   */
  getUserWithPosts = asyncHandler(async (req, res) => {
    const targetUserId = req.params.id || req.user._id;
    const userWithPosts = await this.userService.getUserWithPosts(targetUserId);
    return ApiResponse.success(res, {
      message: 'User with posts retrieved successfully',
      data: userWithPosts
    });
  });
}

module.exports = UserController;

