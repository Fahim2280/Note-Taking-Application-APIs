const express = require('express');

const createNoteRoutes = (noteController, authMiddleware) => {
  const router = express.Router();

  router.use(authMiddleware.authenticate);

  router.post('/', noteController.createNote);
  router.get('/', noteController.getMyNotes);
  router.get('/:id', noteController.getNoteById);
  router.put('/:id', noteController.updateNote);
  router.delete('/:id', noteController.deleteNote);

  return router;
};

module.exports = createNoteRoutes;

