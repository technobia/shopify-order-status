import { getStoreCredentials } from '../utils/stores.js';
import { shopifyGraphQL, ORDER_QUERY } from '../utils/shopify.js';
import { formatOrderResponse } from '../utils/formatters.js';

export const getOrderByOrderNumber = async (c) => {
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
};

export const lookupOrder = async (c) => {
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
};

