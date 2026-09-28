const map = new Map();

const memoryStore = {
  async get(key) {
    return map.get(key) ?? null;
  },
  async set(key, value) {
    map.set(key, value);
    return true;
  },
};

export default memoryStore;
