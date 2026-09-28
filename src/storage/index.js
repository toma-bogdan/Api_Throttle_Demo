import memoryStore from './localMemory.js';
import redisStore from './redisStore.js';

export function getStoreType() {
  const type = process.env.STORAGE?.toLowerCase() || 'memory';
  switch (type) {
    case 'redis':
      return redisStore;
    case 'memory':
    default:
      return memoryStore;
  }
}
