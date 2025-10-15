# Vergani Watch List API

Lightweight serverless API for managing Shopify product watch lists on Cloudflare Workers.

## Setup

```bash
npm install
```

**Local Development:**
```bash
# Edit .dev.vars with your Shopify credentials for each store
npm run dev
```

**Deploy:**
```bash
npx wrangler login

# Set secrets for each store (DE, CH, AT, IT, FR, NL)
npx wrangler secret put SHOPIFY_STORE_URL_DE
npx wrangler secret put SHOPIFY_ACCESS_TOKEN_DE
npx wrangler secret put SHOPIFY_STORE_URL_CH
npx wrangler secret put SHOPIFY_ACCESS_TOKEN_CH
# ... repeat for AT, IT, FR, NL

npm run deploy
```

## API

All endpoints require a store code: `DE`, `CH`, `AT`, `IT`, `FR`, or `NL`

**Get Order by Number:**
```bash
GET /api/:store/orders/:orderNumber

# Example for Germany store
curl http://localhost:8787/api/de/orders/1001

# Example for Switzerland store  
curl http://localhost:8787/api/ch/orders/1001
```

**Order Lookup (supports special characters):**
```bash
POST /api/:store/orders/lookup
{
  "orderNumber": "DE-#14974",
  "email": "customer@example.com"  // optional
}

# Example for Germany store
curl --location 'http://localhost:8787/api/de/orders/lookup' \
--header 'Content-Type: application/json' \
--data '{
  "orderNumber": "DE-#14974",
  "email": "customer@example.com"
}'
```

## Stack

- Hono (3KB framework)
- Cloudflare Workers
- Shopify Admin API (GraphQL)
