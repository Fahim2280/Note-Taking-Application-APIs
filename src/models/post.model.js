const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Post title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    body: {
      type: String,
      required: [true, 'Post body is required']
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Post must belong to an author']
    },
    tags: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'published'],
        message: 'Status must be either draft or published'
      },
      default: 'published'
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Explicit Custom Indexes:
// 1. Index supporting author post lookups and Scenario 2 aggregation lookup ($lookup: from 'posts', foreignField: 'authorId')
postSchema.index({ authorId: 1, createdAt: -1 });

// 2. Index supporting public feed queries filtered by published status sorted by newest first
postSchema.index({ status: 1, createdAt: -1 });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;

