const express = require('express');

const createUserRoutes = (userController, authMiddleware) => {
  const router = express.Router();

  // All user routes require authentication
  router.use(authMiddleware.authenticate);

  // Scenario 1: Group users by interests with single aggregation & pagination
  router.get('/by-interests', userController.getUsersByInterests);

  // Profile endpoints
  router.get('/profile', userController.getProfile);
  router.put('/profile', userController.updateProfile);

  // Scenario 2: Retrieve user with all posts via single aggregation with $lookup
  router.get('/:id/posts', userController.getUserWithPosts);

  return router;
};

module.exports = createUserRoutes;

