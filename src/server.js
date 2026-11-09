const createApp = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');

const startServer = async () => {
  try {
    // 1. Establish Database Connection
    await connectDB();

    // 2. Initialize Express Application
    const app = createApp();

    // 3. Start HTTP Server
    const server = app.listen(env.PORT, () => {
      console.log(`[Server] Secure Note-Taking & Posts API running in ${env.NODE_ENV} mode on port ${env.PORT}`);
      console.log(`[Server] Base URL: http://localhost:${env.PORT}/api/v1`);
      console.log(`[Server] Swagger UI: http://localhost:${env.PORT}/api-docs`);
      console.log(`[Server] Health Check: http://localhost:${env.PORT}/api/v1/health`);
    });

    // Graceful Shutdown & Error Handling
    const handleExit = (signal) => {
      console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => handleExit('SIGTERM'));
    process.on('SIGINT', () => handleExit('SIGINT'));

    process.on('unhandledRejection', (reason, promise) => {
      console.error('[Unhandled Rejection] at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (err) => {
      console.error('[Uncaught Exception] thrown:', err);
      process.exit(1);
    });

    return server;
  } catch (error) {
    console.error(`[Fatal Startup Error]: ${error.message}`);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = startServer;
