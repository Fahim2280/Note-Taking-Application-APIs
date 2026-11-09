const express = require('express');

const createPostRoutes = (postController, authMiddleware) => {
  const router = express.Router();

  // Public routes
  router.get('/', postController.getPublicFeed);
  router.get('/:id', postController.getPostById);

  // Authenticated routes
  router.use(authMiddleware.authenticate);
  router.post('/', postController.createPost);
  router.get('/me/all', postController.getMyPosts);
  router.put('/:id', postController.updatePost);
  router.delete('/:id', postController.deletePost);

  return router;
};

module.exports = createPostRoutes;

