# Shopify Order Status

Lightweight serverless API for managing Shopify order lists on Cloudflare Workers.

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

# Set API key for authentication
npx wrangler secret put API_KEY

# Set secrets for each store (DE, CH, AT, IT, FR, NL)
npx wrangler secret put SHOPIFY_STORE_URL_DE
npx wrangler secret put SHOPIFY_ACCESS_TOKEN_DE
npx wrangler secret put SHOPIFY_STORE_URL_CH
npx wrangler secret put SHOPIFY_ACCESS_TOKEN_CH
# ... repeat for AT, IT, FR, NL

npm run deploy
```

## API

All endpoints require:
- Store code: `DE`, `CH`, `AT`, `IT`, `FR`, or `NL`
- API Key authentication via `X-API-Key` header

**Get Order by Number:**
```bash
GET /api/:store/orders/:orderNumber
```

**Order Lookup (supports special characters):**
```bash
POST /api/:store/orders/lookup
{
  "orderNumber": "DE-#14974",
  "email": "customer@example.com"  // optional
}
```

## Security

This API includes the following security features:

- **API Key Authentication**: All requests require a valid API key via the `X-API-Key` header
- **CORS Configuration**: Configurable cross-origin resource sharing
- **Secure Credentials**: All secrets stored as environment variables
- **Input Validation**: Request validation to prevent malicious inputs

**Generating a Secure API Key:**
```bash
# Generate a secure random API key (macOS/Linux)
openssl rand -base64 32
```

## Stack

- Hono (3KB framework)
- Cloudflare Workers
- Shopify Admin API (GraphQL)
