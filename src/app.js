const express = require('express');
const cors = require('cors');
const swaggerSpec = require('./config/swagger');
const getSwaggerHtml = require('./config/swaggerHtml');
const container = require('./container');
const createApiRouter = require('./routes');
const errorHandler = require('./middlewares/error.middleware');
const AppError = require('./utils/AppError');

const createApp = () => {
  const app = express();

  // Trust proxy for Vercel serverless deployment
  app.set('trust proxy', 1);

  // Cross-Origin Resource Sharing
  app.use(cors());

  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Raw OpenAPI Specification JSON
  app.get(['/api-docs.json', '/api/docs.json'], (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Standalone, fast CDN-powered Swagger UI (loads in <20ms without serverless file-streaming issues)
  const renderDocs = (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(getSwaggerHtml());
  };

  app.get(
    [
      '/',
      '/index.html',
      '/api',
      '/api/',
      '/api/index.js',
      '/api-docs',
      '/api-docs/',
      '/docs',
      '/docs/',
      '/api/v1/docs',
      '/api/v1/docs/'
    ],
    renderDocs
  );

  // API v1 Routes
  const apiRouter = createApiRouter(container);
  app.use('/api/v1', apiRouter);

  // Catch-all for undefined routes
  app.all('*', (req, res, next) => {
    console.log('[EXPRESS 404 TRIGGERED]', req.method, req.originalUrl, req.url);
    next(new AppError(`Cannot find route ${req.method} ${req.originalUrl} on this server`, 404));
  });

  // Global Centralized Error Handling Middleware
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
