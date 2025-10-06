const redis = require('redis');
const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.connect();

// Cache de sugestões de IA comuns
async function cacheAISuggestion(key, value, expirationInSeconds = 3600) {
  await client.setEx(key, expirationInSeconds, JSON.stringify(value));
}

async function getCachedAISuggestion(key) {
  const cached = await client.get(key);
  return cached ? JSON.parse(cached) : null;
}

module.exports = { cacheAISuggestion, getCachedAISuggestion };