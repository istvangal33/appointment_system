import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import env from './config/env';
import { authRoutes } from './routes/auth';
import { meRoutes } from './routes/me';
import { companyRoutes } from './routes/company';

const fastify = Fastify({
  logger: {
    transport:
      env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
  },
});

// Register plugins
async function registerPlugins(): Promise<void> {
  await fastify.register(cors, {
    origin: true, // Allow all origins in development, configure for production
    credentials: true,
  });

  await fastify.register(cookie, {
    secret: env.JWT_REFRESH_SECRET, // Use for cookie signing
  });
}

// Register routes
async function registerRoutes(): Promise<void> {
  // Health check endpoint
  fastify.get('/healthz', async (request, reply) => {
    return reply.send({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Auth routes
  await fastify.register(authRoutes);

  // Me routes
  await fastify.register(meRoutes);

  // Company routes
  await fastify.register(companyRoutes);
}

// Start server
async function start(): Promise<void> {
  try {
    await registerPlugins();
    await registerRoutes();

    await fastify.listen({ port: env.PORT, host: '0.0.0.0' });
    
    fastify.log.info(`🚀 Server running on http://localhost:${env.PORT}`);
    fastify.log.info(`📊 Health check available at http://localhost:${env.PORT}/healthz`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  fastify.log.info('Received SIGINT, shutting down gracefully...');
  await fastify.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  fastify.log.info('Received SIGTERM, shutting down gracefully...');
  await fastify.close();
  process.exit(0);
});

start();
