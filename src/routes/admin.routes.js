const express = require('express');

const createAdminRoutes = (userController, noteController, authMiddleware) => {
  const router = express.Router();

  // Protect all admin routes with authentication and Admin RBAC
  router.use(authMiddleware.authenticate);
  router.use(authMiddleware.authorizeRoles('Admin'));

  // User management (Admin)
  router.get('/users', userController.getAllUsers);
  router.get('/users/:id', userController.getUserById);
  router.delete('/users/:id', userController.deleteUser);

  // Note management (Admin)
  router.get('/notes', noteController.getAllNotes);

  return router;
};

module.exports = createAdminRoutes;

