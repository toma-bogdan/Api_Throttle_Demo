const storage = (process.env.STORAGE || 'memory').toLowerCase();

if (storage !== 'memory' && storage !== 'redis') {
  throw new Error(`STORAGE must be "memory" or "redis". Received "${process.env.STORAGE}".`);
}

const config = {
  port: Number(process.env.PORT) || 3000,
  storage,
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
};

export default config;
