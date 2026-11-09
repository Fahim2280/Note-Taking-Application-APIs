const express = require('express');
const createAuthRoutes = require('./auth.routes');
const createUserRoutes = require('./user.routes');
const createAdminRoutes = require('./admin.routes');
const createNoteRoutes = require('./note.routes');
const createPostRoutes = require('./post.routes');

const createApiRouter = ({
  authController,
  userController,
  noteController,
  postController,
  authMiddleware
}) => {
  const router = express.Router();

  router.use('/auth', createAuthRoutes(authController));
  router.use('/users', createUserRoutes(userController, authMiddleware));
  router.use('/admin', createAdminRoutes(userController, noteController, authMiddleware));
  router.use('/notes', createNoteRoutes(noteController, authMiddleware));
  router.use('/posts', createPostRoutes(postController, authMiddleware));

  // Health check endpoint
  router.get('/health', (req, res) => {
    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString()
    });
  });

  return router;
};

module.exports = createApiRouter;

