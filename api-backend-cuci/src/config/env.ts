import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  host: process.env.HOST || '127.0.0.1',
  corsOrigins:
    process.env.CORS_ORIGINS?.split(',').map((origin) => origin.trim()).filter(Boolean) || [
      'http://localhost:3000',
      'http://localhost:5173'
    ],
  databaseUrl: process.env.DATABASE_URL || 'mysql://root:@127.0.0.1:3306/laundry_service',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'dev-refresh-secret',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS || 10),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 100),
  rateLimitWindow: Number(process.env.RATE_LIMIT_WINDOW || 60_000)
};
