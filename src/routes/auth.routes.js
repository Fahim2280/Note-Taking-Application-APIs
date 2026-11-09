const express = require('express');

const createAuthRoutes = (authController) => {
  const router = express.Router();

  router.post('/register', authController.register);
  router.post('/login', authController.login);

  return router;
};

module.exports = createAuthRoutes;

