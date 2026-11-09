const mongoose = require('mongoose');
const BaseRepository = require('./base.repository');

class UserRepository extends BaseRepository {
  constructor(userModel) {
    super(userModel);
  }

  /**
   * Find user by email (optionally including password for auth comparison)
   */
  async findByEmail(email, includePassword = false) {
    const query = this.model.findOne({ email: email.toLowerCase().trim() });
    if (includePassword) {
      query.select('+password');
    }
    return query.exec();
  }

  /**
   * Paginated list of users
   */
  async findPaginated({ filter = {}, page = 1, limit = 10, skip = 0 }) {
    const [total, data] = await Promise.all([
      this.model.countDocuments(filter),
      this.model.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).exec()
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
   * SCENARIO 1 CONSTRAINT:
   * Uses EXACTLY ONE single User.aggregate([...]) call with zero extra DB calls or countDocuments.
   * Leverages $facet to return both total distinct interest count and paginated items within the single pipeline.
   */
  async groupUsersByInterests({ page = 1, limit = 10, skip = 0 }) {
    const [result] = await this.model.aggregate([
      { $unwind: '$interests' },
      {
        $group: {
          _id: '$interests',
          userCount: { $sum: 1 },
          users: {
            $push: {
              _id: '$_id',
              name: '$name',
              email: '$email'
            }
          }
        }
      },
      { $sort: { userCount: -1, _id: 1 } },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [{ $skip: skip }, { $limit: limit }]
        }
      }
    ]);

    const total = result && result.metadata && result.metadata[0] ? result.metadata[0].total : 0;
    const totalPages = Math.ceil(total / limit) || (total === 0 ? 0 : 1);

    return {
      data: (result && result.data) || [],
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
   * SCENARIO 2 CONSTRAINT:
   * Retrieve all posts belonging to a specific user using a single aggregation pipeline with a $lookup stage.
   */
  async getUserWithPosts(userId) {
    const objectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;

    const [userWithPosts] = await this.model.aggregate([
      { $match: { _id: objectId } },
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'authorId',
          as: 'posts'
        }
      },
      {
        $project: {
          password: 0,
          __v: 0,
          'posts.__v': 0
        }
      }
    ]);

    return userWithPosts || null;
  }
}

module.exports = UserRepository;

