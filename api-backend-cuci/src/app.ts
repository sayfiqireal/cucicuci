import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import rateLimit from '@fastify/rate-limit';
import path from 'path';
import { ZodError } from 'zod';
import { config } from './config/env';
import prismaPlugin from './plugins/prisma';
import authPlugin from './plugins/auth';
import { errorResponse } from './utils/response';
import { AppError, errorCodes } from './errors/appError';
import { authRoutes } from './modules/auth/routes';
import { orderRoutes, queueRoutes } from './modules/orders/routes';
import { adminRoutes } from './modules/admin/routes';
import { serviceRoutes } from './modules/services/routes';

export const buildApp = () => {
  const app = Fastify({
    logger: {
      level: config.env === 'production' ? 'info' : 'debug'
    }
  });

  app.register(prismaPlugin);
  app.register(authPlugin);

  app.register(cors, {
    origin:
      config.env === 'development'
        ? true
        : (origin, cb) => {
            if (!origin || config.corsOrigins.includes(origin)) {
              cb(null, true);
              return;
            }
            cb(new Error('CORS not allowed'), false);
          },
    credentials: true
  });

  app.register(rateLimit, {
    max: config.rateLimitMax,
    timeWindow: config.rateLimitWindow
  });

  const openapiPath = path.join(process.cwd(), 'docs', 'openapi.yaml');
  app.register(swagger, {
    mode: 'static',
    specification: {
      path: openapiPath,
      baseDir: path.join(process.cwd(), 'docs')
    }
  });
  app.register(swaggerUi, {
    routePrefix: '/docs'
  });

  app.get('/health', async () => ({ status: 'ok' }));

  app.register(authRoutes, { prefix: '/auth' });
  app.register(orderRoutes, { prefix: '/orders' });
  app.register(queueRoutes, { prefix: '/queue' });
  app.register(adminRoutes, { prefix: '/admin' });
  app.register(serviceRoutes, { prefix: '/services' });

  app.setErrorHandler((error, _request, reply) => {
    const err = error as any;
    if (error instanceof ZodError) {
      return reply
        .status(422)
        .send(errorResponse(errorCodes.VALIDATION_FAILED, 'Validasi gagal', error.flatten()));
    }

    if (error instanceof AppError) {
      return reply.status(error.statusCode).send(errorResponse(error.code, error.message, error.details));
    }

    if (err?.statusCode === 401 || err?.code === 'FST_JWT_NO_AUTH_TOKEN') {
      return reply.status(401).send(errorResponse(errorCodes.UNAUTHORIZED, 'Unauthorized'));
    }

    app.log.error(error);
    return reply
      .status(500)
      .send(errorResponse(errorCodes.INTERNAL_SERVER_ERROR, 'Terjadi kesalahan pada server'));
  });

  return app;
};
