const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class NoteController {
  constructor(noteService) {
    this.noteService = noteService;

    this.createNote = this.createNote.bind(this);
    this.getMyNotes = this.getMyNotes.bind(this);
    this.getAllNotes = this.getAllNotes.bind(this);
    this.getNoteById = this.getNoteById.bind(this);
    this.updateNote = this.updateNote.bind(this);
    this.deleteNote = this.deleteNote.bind(this);
  }

  createNote = asyncHandler(async (req, res) => {
    const { title, content, tags, isPinned } = req.body;
    const note = await this.noteService.createNote(req.user._id, {
      title,
      content,
      tags,
      isPinned
    });

    return ApiResponse.created(res, {
      message: 'Note created successfully',
      data: note
    });
  });

  getMyNotes = asyncHandler(async (req, res) => {
    const { data, pagination } = await this.noteService.getUserNotes(req.user._id, req.query);
    return ApiResponse.success(res, {
      message: 'Notes retrieved successfully',
      data,
      pagination
    });
  });

  getAllNotes = asyncHandler(async (req, res) => {
    const { data, pagination } = await this.noteService.getAllNotes(req.query);
    return ApiResponse.success(res, {
      message: 'All notes retrieved successfully',
      data,
      pagination
    });
  });

  getNoteById = asyncHandler(async (req, res) => {
    const note = await this.noteService.getNoteById(req.params.id, req.user._id, req.user.role);
    return ApiResponse.success(res, {
      message: 'Note retrieved successfully',
      data: note
    });
  });

  updateNote = asyncHandler(async (req, res) => {
    const { title, content, tags, isPinned } = req.body;
    const updated = await this.noteService.updateNote(
      req.params.id,
      req.user._id,
      req.user.role,
      { title, content, tags, isPinned }
    );

    return ApiResponse.success(res, {
      message: 'Note updated successfully',
      data: updated
    });
  });

  deleteNote = asyncHandler(async (req, res) => {
    await this.noteService.deleteNote(req.params.id, req.user._id, req.user.role);
    return ApiResponse.success(res, {
      message: 'Note deleted successfully'
    });
  });
}

module.exports = NoteController;

