import { buildApp } from './app';
import { config } from './config/env';

const start = async () => {
  const app = buildApp();
  try {
    await app.listen({ port: config.port, host: config.host });
    app.log.info(`Server running on http://${config.host}:${config.port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
