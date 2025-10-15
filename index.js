import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { apiKeyAuth } from './middleware/auth.js';
import { rateLimit } from './middleware/rateLimit.js';
import { getOrderByOrderNumber, lookupOrder } from './handlers/orders.js';

const app = new Hono();

app.use('/*', cors({
  origin: (origin) => origin,
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'X-API-Key'],
  credentials: true,
}));

app.get('/api/:store/orders/:orderNumber', rateLimit({ limit: 60, window: 60 }), apiKeyAuth, getOrderByOrderNumber);

app.post('/api/:store/orders/lookup', rateLimit({ limit: 60, window: 60 }), apiKeyAuth, lookupOrder);

export default app;
