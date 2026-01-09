import crypto from 'crypto';
import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';
import { FastifyInstance } from 'fastify';
import { config } from '../../config/env';
import { comparePassword, hashPassword } from '../../utils/password';
import { AppError, errorCodes } from '../../errors/appError';
import { TokenPayload } from '../../types/auth';

const hashRefreshToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

const buildTokenPayload = (user: { id: number; email: string; role: string; name: string }): TokenPayload => ({
  sub: user.id,
  id: user.id,
  email: user.email,
  role: user.role as 'user' | 'admin',
  name: user.name
});

const issueTokens = async (fastify: FastifyInstance, user: { id: number; email: string; role: string; name: string }) => {
  const payload = buildTokenPayload(user);
  const accessToken = fastify.jwt.sign(payload, { expiresIn: config.jwtExpiresIn });
  const refreshToken = jwt.sign(
    payload as any,
    config.refreshTokenSecret as Secret,
    { expiresIn: config.refreshTokenExpiresIn } as SignOptions
  );

  const tokenHash = hashRefreshToken(refreshToken);
  const expiresAt = new Date(Date.now() + parseExpiryToMs(config.refreshTokenExpiresIn));

  await fastify.prisma.refreshToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt
    }
  });

  return { accessToken, refreshToken };
};

const parseExpiryToMs = (value: string) => {
  const match = value.match(/(\d+)([smhd])/);
  if (!match) return 0;
  const amount = Number(match[1]);
  const unit = match[2];
  switch (unit) {
    case 's':
      return amount * 1000;
    case 'm':
      return amount * 60 * 1000;
    case 'h':
      return amount * 60 * 60 * 1000;
    case 'd':
      return amount * 24 * 60 * 60 * 1000;
    default:
      return 0;
  }
};

export const registerUser = async (
  fastify: FastifyInstance,
  payload: { name: string; email: string; password: string; role?: 'user' | 'admin' }
) => {
  const existing = await fastify.prisma.user.findUnique({ where: { email: payload.email } });
  if (existing) {
    throw new AppError(400, errorCodes.VALIDATION_FAILED, 'Email sudah terdaftar');
  }
  if (payload.role && payload.role !== 'user') {
    throw new AppError(403, errorCodes.FORBIDDEN, 'Tidak boleh membuat admin melalui endpoint ini');
  }

  const passwordHash = await hashPassword(payload.password);
  const user = await fastify.prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email.toLowerCase(),
      passwordHash,
      role: 'user'
    }
  });

  const tokens = await issueTokens(fastify, user);
  return { user: sanitizeUser(user), ...tokens };
};

export const loginUser = async (fastify: FastifyInstance, payload: { email: string; password: string }) => {
  const user = await fastify.prisma.user.findUnique({ where: { email: payload.email.toLowerCase() } });
  if (!user) {
    throw new AppError(401, errorCodes.UNAUTHORIZED, 'Email atau password salah');
  }

  const isValid = await comparePassword(payload.password, user.passwordHash);
  if (!isValid) {
    throw new AppError(401, errorCodes.UNAUTHORIZED, 'Email atau password salah');
  }

  const tokens = await issueTokens(fastify, user);
  return { user: sanitizeUser(user), ...tokens };
};

export const loginAdmin = async (fastify: FastifyInstance, payload: { email: string; password: string }) => {
  const user = await fastify.prisma.user.findUnique({ where: { email: payload.email.toLowerCase() } });
  if (!user || user.role !== 'admin') {
    throw new AppError(401, errorCodes.UNAUTHORIZED, 'Kredensial admin tidak valid');
  }
  const isValid = await comparePassword(payload.password, user.passwordHash);
  if (!isValid) {
    throw new AppError(401, errorCodes.UNAUTHORIZED, 'Kredensial admin tidak valid');
  }
  const tokens = await issueTokens(fastify, user);
  return { user: sanitizeUser(user), ...tokens };
};

export const refreshTokens = async (fastify: FastifyInstance, refreshToken: string) => {
  let payload: TokenPayload;
  try {
    const decoded = jwt.verify(refreshToken, config.refreshTokenSecret);
    if (!decoded || typeof decoded === 'string') {
      throw new Error('Invalid token payload');
    }
    payload = {
      sub: (decoded as any).sub,
      id: (decoded as any).id ?? (decoded as any).sub,
      email: (decoded as any).email,
      role: (decoded as any).role,
      name: (decoded as any).name
    };
  } catch {
    throw new AppError(401, errorCodes.UNAUTHORIZED, 'Refresh token tidak valid');
  }

  const tokenHash = hashRefreshToken(refreshToken);
  const existing = await fastify.prisma.refreshToken.findFirst({
    where: {
      tokenHash,
      userId: payload.sub,
      isRevoked: false,
      expiresAt: { gt: new Date() }
    }
  });

  if (!existing) {
    throw new AppError(401, errorCodes.UNAUTHORIZED, 'Refresh token tidak berlaku');
  }

  await fastify.prisma.refreshToken.update({
    where: { id: existing.id },
    data: { isRevoked: true }
  });

  const user = await fastify.prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    throw new AppError(401, errorCodes.UNAUTHORIZED, 'Pengguna tidak ditemukan');
  }

  const tokens = await issueTokens(fastify, user);
  return { user: sanitizeUser(user), ...tokens };
};

export const logoutUser = async (fastify: FastifyInstance, refreshToken: string) => {
  try {
    const decoded = jwt.verify(refreshToken, config.refreshTokenSecret);
    if (typeof decoded === 'string') {
      throw new Error('invalid');
    }
  } catch {
    throw new AppError(401, errorCodes.UNAUTHORIZED, 'Refresh token tidak valid');
  }
  const tokenHash = hashRefreshToken(refreshToken);
  await fastify.prisma.refreshToken.updateMany({
    where: { tokenHash, isRevoked: false },
    data: { isRevoked: true }
  });
  return { message: 'Logout berhasil' };
};

export const sanitizeUser = (user: { id: number; name: string; email: string; role: string }) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role
});
