export const STORES = {
  DE: { code: 'DE', name: 'Germany' },
  CH: { code: 'CH', name: 'Switzerland' },
  AT: { code: 'AT', name: 'Austria' },
  IT: { code: 'IT', name: 'Italy' },
  FR: { code: 'FR', name: 'France' },
  NL: { code: 'NL', name: 'Netherlands' },
};

export const getStoreCredentials = (env, storeCode) => {
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

