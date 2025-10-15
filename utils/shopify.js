export const ORDER_QUERY = `
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

export const shopifyGraphQL = async (storeUrl, accessToken, query, variables = {}) => {
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

