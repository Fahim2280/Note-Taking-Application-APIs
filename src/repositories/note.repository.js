const BaseRepository = require('./base.repository');

class NoteRepository extends BaseRepository {
  constructor(noteModel) {
    super(noteModel);
  }

  /**
   * Paginated note retrieval for a specific user using compound index { userId: 1, createdAt: -1 }
   */
  async findPaginatedByUser(userId, { page = 1, limit = 10, skip = 0, search = null } = {}) {
    const filter = { userId };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const [total, data] = await Promise.all([
      this.model.countDocuments(filter),
      this.model.find(filter).sort({ isPinned: -1, createdAt: -1 }).skip(skip).limit(limit).exec()
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
   * Paginated note retrieval across all users (Admin)
   */
  async findPaginatedAll({ page = 1, limit = 10, skip = 0, filter = {} } = {}) {
    const [total, data] = await Promise.all([
      this.model.countDocuments(filter),
      this.model
        .find(filter)
        .populate('userId', 'name email role')
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
}

module.exports = NoteRepository;

