import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Worker process for background jobs
 *
 * This runs as a separate process to handle:
 * - Daily quest generation
 * - Streak updates
 * - Notification scheduling
 *
 * In MVP, most of these are handled by NestJS Schedule module.
 * This worker is a placeholder for more complex background processing
 * using BullMQ queues in the future.
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  console.log('🔧 Worker started');
  console.log('📋 Background jobs are handled by NestJS Schedule module');
  console.log('💡 In production, use BullMQ for complex job queues');

  // Keep the process running
  process.on('SIGTERM', async () => {
    console.log('Worker shutting down...');
    await app.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('Worker shutting down...');
    await app.close();
    process.exit(0);
  });
}

bootstrap().catch((error) => {
  console.error('Worker failed to start:', error);
  process.exit(1);
});

