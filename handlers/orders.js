import { getStoreCredentials } from '../utils/stores.js';
import { shopifyGraphQL, ORDER_QUERY } from '../utils/shopify.js';
import { formatOrderResponse } from '../utils/formatters.js';

const fetchOrder = async (env, store, orderNumber) => {
  const { storeUrl, accessToken } = getStoreCredentials(env, store);

  const result = await shopifyGraphQL(storeUrl, accessToken, ORDER_QUERY, {
    orderName: `name:"${orderNumber}"`,
  });

  if (!result.data.orders.edges.length) {
    return null;
  }

  return result.data.orders.edges[0].node;
};

export const getOrderByOrderNumber = async (c) => {
  try {
    const store = c.req.param('store').toUpperCase();
    const orderNumber = c.req.param('orderNumber');

    const order = await fetchOrder(c.env, store, orderNumber);

    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    return c.json(formatOrderResponse(order));
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
};

export const lookupOrder = async (c) => {
  try {
    const store = c.req.param('store').toUpperCase();
    const body = await c.req.json();
    const { email, orderNumber } = body;

    if (!orderNumber) {
      return c.json({ error: 'orderNumber is required' }, 400);
    }

    const order = await fetchOrder(c.env, store, orderNumber);

    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    if (email && order.email.toLowerCase() === email.toLowerCase()) {
      return c.json(formatOrderResponse(order));
    }

    return c.json({
      orderId: order.id,
      tags: order.tags,
      fulfillmentStatus: order.displayFulfillmentStatus,
      financialStatus: order.displayFinancialStatus,
      createdAt: order.createdAt,
    });
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
};

