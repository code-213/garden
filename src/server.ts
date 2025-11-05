import { createApp } from './app';
import { DatabaseConnection } from '@infrastructure/database/mongodb/connection';
import { logger } from '@shared/utils/logger';
import { config } from '@config/env.config';

async function bootstrap(): Promise<void> {
  try {
    // Connect to database
    const db = DatabaseConnection.getInstance();
    await db.connect();

    // Create Express app
    const app = createApp();

    // Start server
    const server = app.listen(config.app.port, () => {
      logger.info(`🚀 Server running on port ${config.app.port}`);
      logger.info(`📝 Environment: ${config.app.env}`);
      logger.info(`🔗 API Version: ${config.app.apiVersion}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close(async () => {
        await db.disconnect();
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT signal received: closing HTTP server');
      server.close(async () => {
        await db.disconnect();
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
