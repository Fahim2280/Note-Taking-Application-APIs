/**
 * BaseRepository implementing shared CRUD operations adhering to Liskov Substitution Principle (LSP).
 * Leverages MongoDB's built-in unique B-tree index on _id for all single-resource operations.
 */
class BaseRepository {
  constructor(model) {
    if (!model) {
      throw new Error('Mongoose model is required to instantiate BaseRepository');
    }
    this.model = model;
  }

  /**
   * Find document by _id (relying on built-in _id B-tree index)
   */
  async findById(id, projection = null, options = {}) {
    return this.model.findById(id, projection, options);
  }

  /**
   * Find one document by custom query filter
   */
  async findOne(filter = {}, projection = null, options = {}) {
    return this.model.findOne(filter, projection, options);
  }

  /**
   * Create new document
   */
  async create(data) {
    return this.model.create(data);
  }

  /**
   * Update document by _id (relying on built-in _id B-tree index)
   */
  async updateById(id, data, options = { new: true, runValidators: true }) {
    return this.model.findByIdAndUpdate(id, data, options);
  }

  /**
   * Delete document by _id (relying on built-in _id B-tree index)
   */
  async deleteById(id, options = {}) {
    return this.model.findByIdAndDelete(id, options);
  }

  /**
   * Count documents matching filter
   */
  async count(filter = {}) {
    return this.model.countDocuments(filter);
  }

  /**
   * Find documents with filter, projection, and options
   */
  async find(filter = {}, projection = null, options = {}) {
    return this.model.find(filter, projection, options);
  }
}

module.exports = BaseRepository;

