import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { apiKeyAuth } from './middleware/auth.js';
import { rateLimit } from './middleware/rateLimit.js';
import { getOrderByOrderNumber, lookupOrder } from './handlers/orders.js';

const app = new Hono();

const ALLOWED_ORIGINS = [
  'https://livom.de',
  'https://www.livom.de',
  'https://livom.ch',
  'https://www.livom.ch',
  'https://livom.at',
  'https://www.livom.at',
  'https://livom.it',
  'https://www.livom.it',
  'https://livom.fr',
  'https://www.livom.fr',
  'https://livom.nl',
  'https://www.livom.nl',
  'http://localhost:8787',
];

app.use('/*', cors({
  origin: (origin) => {
    if (!origin) return null;
    if (ALLOWED_ORIGINS.includes(origin)) {
      return origin;
    }
    return null;
  },
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'X-API-Key'],
  credentials: true,
}));

app.get('/api/:store/orders/:orderNumber', rateLimit({ limit: 60, window: 60 }), apiKeyAuth, getOrderByOrderNumber);

app.post('/api/:store/orders/lookup', rateLimit({ limit: 60, window: 60 }), apiKeyAuth, lookupOrder);

export default app;
