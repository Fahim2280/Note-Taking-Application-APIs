const AppError = require('../utils/AppError');
const { parsePagination } = require('../utils/pagination');

class PostService {
  constructor(postRepository) {
    this.postRepository = postRepository;
  }

  async createPost(authorId, { title, body, tags = [], status = 'published' }) {
    if (!title || !body) {
      throw new AppError('Post title and body are required', 400);
    }

    return this.postRepository.create({
      title: title.trim(),
      body,
      authorId,
      tags: Array.isArray(tags) ? tags.map((t) => t.trim().toLowerCase()) : [],
      status: status === 'draft' ? 'draft' : 'published'
    });
  }

  async getPublicFeed(query) {
    const { page, limit, skip } = parsePagination(query);
    const tag = query.tag ? query.tag.trim().toLowerCase() : null;

    return this.postRepository.findPaginatedFeed({
      page,
      limit,
      skip,
      tag
    });
  }

  async getAuthorPosts(authorId, query) {
    const { page, limit, skip } = parsePagination(query);
    return this.postRepository.findPaginatedByAuthor(authorId, {
      page,
      limit,
      skip
    });
  }

  async getPostById(postId) {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new AppError('Post not found', 404);
    }
    return post;
  }

  async updatePost(postId, authorId, userRole, { title, body, tags, status }) {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    if (post.authorId.toString() !== authorId.toString() && userRole !== 'Admin') {
      throw new AppError('Forbidden: You do not have permission to update this post', 403);
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (body !== undefined) updateData.body = body;
    if (tags !== undefined && Array.isArray(tags)) {
      updateData.tags = tags.map((t) => t.trim().toLowerCase());
    }
    if (status !== undefined) {
      updateData.status = status === 'draft' ? 'draft' : 'published';
    }

    return this.postRepository.updateById(postId, updateData);
  }

  async deletePost(postId, authorId, userRole) {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    if (post.authorId.toString() !== authorId.toString() && userRole !== 'Admin') {
      throw new AppError('Forbidden: You do not have permission to delete this post', 403);
    }

    return this.postRepository.deleteById(postId);
  }
}

module.exports = PostService;

