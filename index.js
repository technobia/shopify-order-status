import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

app.use('/*', cors());

const shopifyGraphQL = async (env, query, variables = {}) => {
  const store = env.SHOPIFY_STORE_URL;
  const version = env.SHOPIFY_API_VERSION || '2024-10';
  const url = `https://${store}/admin/api/${version}/graphql.json`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': env.SHOPIFY_ACCESS_TOKEN,
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

app.get('/api/orders/:orderNumber', async (c) => {
  try {
    const orderNumber = c.req.param('orderNumber');
    const env = c.env;

    const query = `
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
            }
          }
        }
      }
    `;

    const variables = {
      orderName: `name:${orderNumber}`,
    };

    const result = await shopifyGraphQL(env, query, variables);

    if (!result.data.orders.edges.length) {
      return c.json({ error: 'Order not found' }, 404);
    }

    const order = result.data.orders.edges[0].node;

    const response = {
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
    };

    return c.json(response);
  } catch (error) {
    console.error('Error fetching order:', error);
    return c.json({ error: error.message }, 500);
  }
});

export default app;
