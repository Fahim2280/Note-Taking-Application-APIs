const createApp = require('../src/app');
const connectDB = require('../src/config/db');

const app = createApp();

module.exports = async (req, res) => {
  console.log('[VERCEL FUNCTION INVOKED]', req.method, req.url);

  const pathOnly = (req.url || '').split('?')[0];

  const isNoDbRoute =
    pathOnly === '/' ||
    pathOnly === '' ||
    pathOnly === '/index.html' ||
    pathOnly === '/api' ||
    pathOnly === '/api/' ||
    pathOnly === '/api/index.js' ||
    pathOnly.includes('api-docs') ||
    pathOnly.includes('docs') ||
    pathOnly.includes('health') ||
    pathOnly.includes('favicon');

  console.log('[ROUTE CHECK]', { pathOnly, isNoDbRoute });

  if (!isNoDbRoute) {
    try {
      console.log('[ATTEMPTING DB CONNECTION]');
      await connectDB();
      console.log('[DB CONNECTED SUCCESSFULLY]');
    } catch (err) {
      console.error('[MongoDB Connection Failure on Vercel]:', err.message);
      return res.status(503).json({
        success: false,
        statusCode: 503,
        message:
          'MongoDB connection unavailable on Vercel. Please ensure MONGODB_URI is configured with your MongoDB Atlas cloud URI and that Atlas Network Access allows 0.0.0.0/0.'
      });
    }
  }

  console.log('[FORWARDING TO EXPRESS APP]');
  return app(req, res);
};
