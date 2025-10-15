export const apiKeyAuth = async (c, next) => {
  const apiKey = c.req.header('X-API-Key');
  const validApiKey = c.env.API_KEY;

  if (!validApiKey) {
    return c.json({ error: 'API authentication not configured' }, 500);
  }

  if (!apiKey || apiKey !== validApiKey) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  await next();
};

