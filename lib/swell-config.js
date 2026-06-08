function readEnv(name, fallback = "") {
  return process.env[name] || fallback;
}

function readProductId(planKey, length) {
  const normalizedPlan = planKey.toUpperCase().replace(/-/g, "_");
  return readEnv(`SWELL_PRODUCT_ID_${normalizedPlan}_${length}`);
}

function readPurchaseOption(planKey, fallbackType) {
  const normalizedPlan = planKey.toUpperCase().replace(/-/g, "_");
  const type = readEnv(`SWELL_PURCHASE_OPTION_${normalizedPlan}_TYPE`, fallbackType);
  const planId = readEnv(`SWELL_PURCHASE_OPTION_${normalizedPlan}_PLAN_ID`);

  if (!type) return null;

  const purchaseOption = { type };
  if (planId) purchaseOption.plan_id = planId;

  return purchaseOption;
}

function getPublicSwellConfig() {
  const defaultProductId = readEnv("SWELL_PRODUCT_ID");

  return {
    swell: {
      storeId: readEnv("SWELL_STORE_ID"),
      publicKey: readEnv("SWELL_PUBLIC_KEY")
    },
    checkoutUrl: readEnv("SWELL_CHECKOUT_URL"),
    defaultProductId,
    productIds: {
      "30-day": {
        "26": readProductId("30-day", "26") || defaultProductId,
        "28": readProductId("30-day", "28") || defaultProductId,
        "30": readProductId("30-day", "30") || defaultProductId
      },
      onetime: {
        "26": readProductId("onetime", "26") || defaultProductId,
        "28": readProductId("onetime", "28") || defaultProductId,
        "30": readProductId("onetime", "30") || defaultProductId
      }
    },
    optionNames: {
      length: readEnv("SWELL_LENGTH_OPTION_NAME"),
      plan: readEnv("SWELL_PLAN_OPTION_NAME")
    },
    accessoryProductIds: {
      bald_cap: readEnv("SWELL_PRODUCT_ID_ACCESSORY_BALD_CAP"),
      scissors: readEnv("SWELL_PRODUCT_ID_ACCESSORY_SCISSORS"),
      silk_cap: readEnv("SWELL_PRODUCT_ID_ACCESSORY_SILK_CAP"),
      spray_comb: readEnv("SWELL_PRODUCT_ID_ACCESSORY_SPRAY_COMB"),
      wig_storage_bag: readEnv("SWELL_PRODUCT_ID_ACCESSORY_WIG_STORAGE_BAG")
    },
    purchaseOptions: {
      "30-day": readPurchaseOption("30-day", "subscription"),
      onetime: readPurchaseOption("onetime", "standard")
    }
  };
}

module.exports = {
  getPublicSwellConfig
};
