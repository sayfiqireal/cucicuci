import { PrismaClient } from '@prisma/client';
import { TokenPayload } from './auth';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
    authenticate: any;
  }

  interface FastifyRequest {
    user?: TokenPayload;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: TokenPayload;
    user: TokenPayload;
  }
}
