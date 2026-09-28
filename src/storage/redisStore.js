import { createClient } from 'redis';

const url = process.env.REDIS_URL || 'redis://localhost:6379';
const client = createClient({ url });

let isConnected = false;
async function ensureConnected() {
  if (!isConnected) {
    console.info('Connecting to Redis...');
    await client.connect();
    isConnected = true;
  }
}

const redisStore = {
  async get(key) {
    await ensureConnected();
    const raw = await client.get(key);
    return raw ? JSON.parse(raw) : undefined;
  },

  async set(key, value, ttlSec) {
    await ensureConnected();
    await client.set(key, JSON.stringify(value), { EX: ttlSec });
  },

  async reset(key) {
    await ensureConnected();
    await client.del(key);
  }
};

export default redisStore;
