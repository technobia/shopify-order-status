export const rateLimit = () => {
  return async (c, next) => {
    const rateLimiter = c.env.API_RATE_LIMITER;

    if (!rateLimiter) {
      console.warn('Rate limiter not configured - skipping rate limit check');
      await next();
      return;
    }

    const apiKey = c.req.header('X-API-Key') || 'anonymous';
    const ip = c.req.header('CF-Connecting-IP') || 'unknown';
    const key = `${apiKey}:${ip}`;

    const { success } = await rateLimiter.limit({ key });

    if (!success) {
      return c.json({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.'
      }, 429);
    }

    await next();
  };
};

