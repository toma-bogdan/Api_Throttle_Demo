import { createClient } from 'redis';
import config from '../config/settings.js';

const client = createClient({ url: config.redisUrl });

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
    return raw ? JSON.parse(raw) : null;
  },

  async set(key, value, ttlSec) {
    await ensureConnected();
    await client.set(key, JSON.stringify(value), { EX: ttlSec });
  },
};

export default redisStore;
