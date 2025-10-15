export const rateLimit = (options = {}) => {
  const { limit = 60, window = 60 } = options;

  return async (c, next) => {
    const kv = c.env.RATE_LIMIT;

    if (!kv) {
      console.warn('Rate limiting KV namespace not configured - skipping rate limit check');
      await next();
      return;
    }

    const apiKey = c.req.header('X-API-Key') || 'anonymous';
    const ip = c.req.header('CF-Connecting-IP') || 'unknown';
    const identifier = `${apiKey}:${ip}`;
    const key = `ratelimit:${identifier}`;

    const currentCount = await kv.get(key);
    const count = currentCount ? parseInt(currentCount) : 0;

    if (count >= limit) {
      return c.json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Max ${limit} requests per ${window} seconds.`
      }, 429);
    }

    await kv.put(key, (count + 1).toString(), { expirationTtl: window });

    c.header('X-RateLimit-Limit', limit.toString());
    c.header('X-RateLimit-Remaining', (limit - count - 1).toString());
    c.header('X-RateLimit-Reset', window.toString());

    await next();
  };
};

