const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true
      // Note: inline `unique: true` is intentionally omitted here to prevent duplicate index creation.
      // Explicitly indexed via userSchema.index() below.
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false
    },
    role: {
      type: String,
      enum: {
        values: ['User', 'Admin'],
        message: 'Role must be either User or Admin'
      },
      default: 'User'
    },
    interests: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Explicit Custom Indexes:
// 1. Unique index on email to enforce uniqueness without redundant inline definition
userSchema.index({ email: 1 }, { unique: true });

// 2. Multikey index on interests array to support Scenario 1 unwind/grouping & interest queries
userSchema.index({ interests: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;

