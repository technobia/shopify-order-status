import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

app.use('/*', cors());

const STORES = {
  DE: { code: 'DE', name: 'Germany' },
  CH: { code: 'CH', name: 'Switzerland' },
  AT: { code: 'AT', name: 'Austria' },
  IT: { code: 'IT', name: 'Italy' },
  FR: { code: 'FR', name: 'France' },
  NL: { code: 'NL', name: 'Netherlands' },
};

const getStoreCredentials = (env, storeCode) => {
  const store = STORES[storeCode];
  if (!store) {
    throw new Error(`Invalid store code: ${storeCode}`);
  }

  const storeUrl = env[`SHOPIFY_STORE_URL_${storeCode}`];
  const accessToken = env[`SHOPIFY_ACCESS_TOKEN_${storeCode}`];

  if (!storeUrl || !accessToken) {
    throw new Error(`Missing credentials for store: ${storeCode}`);
  }

  return { storeUrl, accessToken };
};

const ORDER_QUERY = `
  query getOrder($orderName: String!) {
    orders(first: 1, query: $orderName) {
      edges {
        node {
          id
          name
          email
          createdAt
          displayFulfillmentStatus
          displayFinancialStatus
          totalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          customer {
            firstName
            lastName
            email
          }
          shippingAddress {
            firstName
            lastName
            address1
            address2
            city
            province
            country
            zip
          }
          lineItems(first: 50) {
            edges {
              node {
                id
                name
                quantity
                variant {
                  id
                  title
                  price
                }
              }
            }
          }
          fulfillments {
            id
            status
            trackingInfo {
              company
              number
              url
            }
            createdAt
            updatedAt
          }
          tags
        }
      }
    }
  }
`;

const shopifyGraphQL = async (storeUrl, accessToken, query, variables = {}) => {
  const version = '2024-10';
  const url = `https://${storeUrl}/admin/api/${version}/graphql.json`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
  }

  return data;
};

const formatOrderResponse = (order) => {
  return {
    orderId: order.id,
    orderNumber: order.name,
    createdAt: order.createdAt,
    fulfillmentStatus: order.displayFulfillmentStatus,
    financialStatus: order.displayFinancialStatus,
    total: order.totalPriceSet.shopMoney,
    customer: {
      name: `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim(),
      email: order.customer?.email || order.email,
    },
    shippingAddress: order.shippingAddress,
    items: order.lineItems.edges.map(edge => ({
      id: edge.node.id,
      name: edge.node.name,
      quantity: edge.node.quantity,
      variant: edge.node.variant?.title,
      price: edge.node.variant?.price,
    })),
    fulfillments: order.fulfillments.map(fulfillment => ({
      id: fulfillment.id,
      status: fulfillment.status,
      tracking: fulfillment.trackingInfo,
      createdAt: fulfillment.createdAt,
      updatedAt: fulfillment.updatedAt,
    })),
    tags: order.tags,
  };
};

app.get('/api/:store/orders/:orderNumber', async (c) => {
  try {
    const store = c.req.param('store').toUpperCase();
    const orderNumber = c.req.param('orderNumber');

    const { storeUrl, accessToken } = getStoreCredentials(c.env, store);

    const result = await shopifyGraphQL(storeUrl, accessToken, ORDER_QUERY, {
      orderName: `name:"${orderNumber}"`,
    });

    if (!result.data.orders.edges.length) {
      return c.json({ error: 'Order not found' }, 404);
    }

    const order = result.data.orders.edges[0].node;
    return c.json(formatOrderResponse(order));
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

app.post('/api/:store/orders/lookup', async (c) => {
  try {
    const store = c.req.param('store').toUpperCase();
    const body = await c.req.json();
    const { email, orderNumber } = body;

    if (!orderNumber) {
      return c.json({ error: 'orderNumber is required' }, 400);
    }

    const { storeUrl, accessToken } = getStoreCredentials(c.env, store);

    const queryString = email
      ? `name:"${orderNumber}" AND email:${email}`
      : `name:"${orderNumber}"`;

    const result = await shopifyGraphQL(storeUrl, accessToken, ORDER_QUERY, {
      orderName: queryString,
    });

    if (!result.data.orders.edges.length) {
      return c.json({ error: 'Order not found' }, 404);
    }

    const order = result.data.orders.edges[0].node;

    if (email && order.email.toLowerCase() !== email.toLowerCase()) {
      return c.json({ error: 'Order not found or email does not match' }, 404);
    }

    return c.json(formatOrderResponse(order));
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

export default app;
