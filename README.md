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

## Stack

- Hono (3KB framework)
- Cloudflare Workers
- Shopify Admin API (GraphQL)
