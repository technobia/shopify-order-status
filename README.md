# Vergani Watch List API

Lightweight serverless API for managing Shopify product watch lists on Cloudflare Workers.

## Setup

```bash
npm install
```

**Local Development:**
```bash
cp .dev.vars.example .dev.vars
# Edit .dev.vars with your Shopify credentials
npm run dev
```

**Deploy:**
```bash
npx wrangler login
npx wrangler secret put SHOPIFY_STORE_URL
npx wrangler secret put SHOPIFY_ACCESS_TOKEN
npm run deploy
```

## API

**Get Order by Number:**
```bash
GET /api/orders/:orderNumber
```

**Order Lookup (supports special characters):**
```bash
POST /api/orders/lookup
{
  "orderNumber": "DE-#14974",
  "email": "customer@example.com"  // optional
}
```

## Stack

- Hono (3KB framework)
- Cloudflare Workers
- Shopify Admin API (GraphQL)
