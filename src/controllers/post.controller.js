const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class PostController {
  constructor(postService) {
    this.postService = postService;

    this.createPost = this.createPost.bind(this);
    this.getPublicFeed = this.getPublicFeed.bind(this);
    this.getMyPosts = this.getMyPosts.bind(this);
    this.getPostById = this.getPostById.bind(this);
    this.updatePost = this.updatePost.bind(this);
    this.deletePost = this.deletePost.bind(this);
  }

  createPost = asyncHandler(async (req, res) => {
    const { title, body, tags, status } = req.body;
    const post = await this.postService.createPost(req.user._id, {
      title,
      body,
      tags,
      status
    });

    return ApiResponse.created(res, {
      message: 'Post created successfully',
      data: post
    });
  });

  getPublicFeed = asyncHandler(async (req, res) => {
    const { data, pagination } = await this.postService.getPublicFeed(req.query);
    return ApiResponse.success(res, {
      message: 'Posts feed retrieved successfully',
      data,
      pagination
    });
  });

  getMyPosts = asyncHandler(async (req, res) => {
    const { data, pagination } = await this.postService.getAuthorPosts(req.user._id, req.query);
    return ApiResponse.success(res, {
      message: 'User posts retrieved successfully',
      data,
      pagination
    });
  });

  getPostById = asyncHandler(async (req, res) => {
    const post = await this.postService.getPostById(req.params.id);
    return ApiResponse.success(res, {
      message: 'Post retrieved successfully',
      data: post
    });
  });

  updatePost = asyncHandler(async (req, res) => {
    const { title, body, tags, status } = req.body;
    const updated = await this.postService.updatePost(
      req.params.id,
      req.user._id,
      req.user.role,
      { title, body, tags, status }
    );

    return ApiResponse.success(res, {
      message: 'Post updated successfully',
      data: updated
    });
  });

  deletePost = asyncHandler(async (req, res) => {
    await this.postService.deletePost(req.params.id, req.user._id, req.user.role);
    return ApiResponse.success(res, {
      message: 'Post deleted successfully'
    });
  });
}

module.exports = PostController;

