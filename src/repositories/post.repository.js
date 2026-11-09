const BaseRepository = require('./base.repository');

class PostRepository extends BaseRepository {
  constructor(postModel) {
    super(postModel);
  }

  /**
   * Paginated public feed using index { status: 1, createdAt: -1 }
   */
  async findPaginatedFeed({ page = 1, limit = 10, skip = 0, tag = null } = {}) {
    const filter = { status: 'published' };
    if (tag) {
      filter.tags = tag;
    }

    const [total, data] = await Promise.all([
      this.model.countDocuments(filter),
      this.model
        .find(filter)
        .populate('authorId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec()
    ]);

    const totalPages = Math.ceil(total / limit) || (total === 0 ? 0 : 1);

    return {
      data,
      pagination: {
        page,
        limit,
        skip,
        total,
        totalPages
      }
    };
  }

  /**
   * Paginated posts by author using index { authorId: 1, createdAt: -1 }
   */
  async findPaginatedByAuthor(authorId, { page = 1, limit = 10, skip = 0 } = {}) {
    const filter = { authorId };

    const [total, data] = await Promise.all([
      this.model.countDocuments(filter),
      this.model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec()
    ]);

    const totalPages = Math.ceil(total / limit) || (total === 0 ? 0 : 1);

    return {
      data,
      pagination: {
        page,
        limit,
        skip,
        total,
        totalPages
      }
    };
  }
}

module.exports = PostRepository;

