import { FastifyReply, FastifyRequest } from 'fastify';
import { errorResponse } from '../utils/response';
import { errorCodes } from '../errors/appError';

export const requireRole =
  (roles: Array<'user' | 'admin'>) => async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(401).send(errorResponse(errorCodes.UNAUTHORIZED, 'Unauthorized'));
    }
    if (!roles.includes(request.user.role)) {
      return reply.status(403).send(errorResponse(errorCodes.FORBIDDEN, 'Forbidden'));
    }
  };
