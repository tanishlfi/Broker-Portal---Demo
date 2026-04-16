import NodeCache from "node-cache";

// Cache configuration
const config = {
  stdTTL: 300, // 5 minutes default TTL
  checkperiod: 60, // Check for expired entries every 60 seconds
  maxKeys: 1000, // Limit maximum number of keys
  deleteOnExpire: true, // Automatically delete expired keys
  useClones: false, // Improve performance by not cloning objects
};

const cache = new NodeCache(config);

// Add event listener for expired items
cache.on("expired", (key, value) => {
  console.log(`Cache key expired: ${key}`);
  cache.del(key); // Explicitly remove the expired item

  const stats = cache.getStats();
  console.log(`Cache stats after cleanup: ${JSON.stringify(stats)}`);
});

// Optional: Add memory usage monitoring
cache.on("set", (key, value) => {
  const stats = cache.getStats();
  if (stats.keys > config.maxKeys * 0.9) {
    console.warn(
      `Cache is nearing capacity: ${stats.keys}/${config.maxKeys} keys used`,
    );
  }
});

export default cache;
