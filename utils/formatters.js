export const formatOrderResponse = (order) => {
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

