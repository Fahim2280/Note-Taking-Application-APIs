const AppError = require('../utils/AppError');
const { parsePagination } = require('../utils/pagination');

class NoteService {
  constructor(noteRepository) {
    this.noteRepository = noteRepository;
  }

  async createNote(userId, { title, content, tags = [], isPinned = false }) {
    if (!title || !content) {
      throw new AppError('Note title and content are required', 400);
    }

    return this.noteRepository.create({
      title: title.trim(),
      content,
      userId,
      tags: Array.isArray(tags) ? tags.map((t) => t.trim().toLowerCase()) : [],
      isPinned: Boolean(isPinned)
    });
  }

  async getUserNotes(userId, query) {
    const { page, limit, skip } = parsePagination(query);
    const search = query.search ? query.search.trim() : null;

    return this.noteRepository.findPaginatedByUser(userId, {
      page,
      limit,
      skip,
      search
    });
  }

  async getAllNotes(query) {
    const { page, limit, skip } = parsePagination(query);
    return this.noteRepository.findPaginatedAll({ page, limit, skip });
  }

  async getNoteById(noteId, userId, userRole) {
    const note = await this.noteRepository.findById(noteId);
    if (!note) {
      throw new AppError('Note not found', 404);
    }

    // Ownership verification: owner or Admin
    if (note.userId.toString() !== userId.toString() && userRole !== 'Admin') {
      throw new AppError('Forbidden: You do not have permission to access this note', 403);
    }

    return note;
  }

  async updateNote(noteId, userId, userRole, { title, content, tags, isPinned }) {
    const note = await this.noteRepository.findById(noteId);
    if (!note) {
      throw new AppError('Note not found', 404);
    }

    if (note.userId.toString() !== userId.toString() && userRole !== 'Admin') {
      throw new AppError('Forbidden: You do not have permission to update this note', 403);
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content;
    if (tags !== undefined && Array.isArray(tags)) {
      updateData.tags = tags.map((t) => t.trim().toLowerCase());
    }
    if (isPinned !== undefined) updateData.isPinned = Boolean(isPinned);

    return this.noteRepository.updateById(noteId, updateData);
  }

  async deleteNote(noteId, userId, userRole) {
    const note = await this.noteRepository.findById(noteId);
    if (!note) {
      throw new AppError('Note not found', 404);
    }

    if (note.userId.toString() !== userId.toString() && userRole !== 'Admin') {
      throw new AppError('Forbidden: You do not have permission to delete this note', 403);
    }

    return this.noteRepository.deleteById(noteId);
  }
}

module.exports = NoteService;

