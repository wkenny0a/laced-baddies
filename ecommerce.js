(function () {
  const STATUS = {
    ready: "Headless checkout connected to Swell.",
    missingConfig: "Swell checkout is ready. Add your Swell store ID, public key, and product ID in environment variables.",
    loading: "Adding your crown to cart...",
    error: "Checkout could not start. Check your Swell settings and try again."
  };

  const PLAN_LABELS = {
    "30-day": "30-Day Baddie Club",
    onetime: "One-Time Purchase"
  };

  const state = {
    config: null,
    isConfigured: false,
    isLoading: false
  };

  function getElement(id) {
    return document.getElementById(id);
  }

  function setStatus(message, tone = "muted") {
    const status = getElement("storefront-status");
    const text = getElement("storefront-status-text");

    if (!status || !text) return;

    status.dataset.tone = tone;
    text.textContent = message;
  }

  function setCheckoutLoading(isLoading) {
    state.isLoading = isLoading;
    const button = getElement("submit-btn");

    if (!button) return;

    button.classList.toggle("is-loading", isLoading);
    button.disabled = isLoading;
  }

  function resolveProductId(plan, length) {
    const productsByPlan = state.config?.productIds?.[plan] || {};
    return productsByPlan[length] || state.config?.defaultProductId || "";
  }

  function hasSwellCredentials(config) {
    return Boolean(config?.swell?.storeId && config?.swell?.publicKey);
  }

  function hasProductConfig(config) {
    return Boolean(
      config?.defaultProductId ||
        Object.values(config?.productIds || {}).some((products) =>
          Object.values(products || {}).some(Boolean)
        )
    );
  }

  function buildCartItem(plan, length) {
    const productId = resolveProductId(plan, length);
    const item = {
      product_id: productId,
      quantity: 1,
      metadata: {
        source: "laced-baddies-site",
        selected_length: `${length}"`,
        selected_plan: PLAN_LABELS[plan] || plan
      }
    };

    const lengthOptionName = state.config?.optionNames?.length;
    const planOptionName = state.config?.optionNames?.plan;
    const purchaseOption = state.config?.purchaseOptions?.[plan];

    if (lengthOptionName || planOptionName) {
      item.options = {};
      if (lengthOptionName) item.options[lengthOptionName] = `${length}"`;
      if (planOptionName) item.options[planOptionName] = PLAN_LABELS[plan] || plan;
    }

    if (purchaseOption?.type) {
      item.purchase_option = purchaseOption;
    }

    return item;
  }

  function getCheckoutUrl(cart) {
    return cart?.checkout_url || cart?.checkoutUrl || state.config?.checkoutUrl || "";
  }

  async function loadConfig() {
    const response = await fetch("/api/swell-config", {
      headers: { Accept: "application/json" },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("Unable to load Swell storefront config.");
    }

    return response.json();
  }

  async function initSwell() {
    state.config = await loadConfig();
    state.isConfigured = hasSwellCredentials(state.config) && hasProductConfig(state.config);

    if (!state.isConfigured) {
      setStatus(STATUS.missingConfig, "warning");
      return;
    }

    if (!window.swell) {
      setStatus("Swell SDK did not load. Check the storefront script URL.", "error");
      return;
    }

    window.swell.init(state.config.swell.storeId, state.config.swell.publicKey);
    setStatus(STATUS.ready, "success");
  }

  async function checkout(selection) {
    const plan = selection?.plan || "30-day";
    const length = selection?.length || "26";

    if (state.isLoading) return false;

    if (!state.isConfigured) {
      setStatus(STATUS.missingConfig, "warning");
      window.alert("Swell is not connected yet. Add your Swell environment variables, then restart the site.");
      return false;
    }

    const item = buildCartItem(plan, length);

    if (!item.product_id) {
      setStatus("Missing Swell product ID for this length and plan.", "error");
      return false;
    }

    try {
      setCheckoutLoading(true);
      setStatus(STATUS.loading, "muted");

      const cart = await window.swell.cart.addItem(item);

      if (cart?.errors || cart?.error) {
        throw new Error(cart.errors?.[0]?.message || cart.error?.message || "Swell cart error.");
      }

      const checkoutUrl = getCheckoutUrl(cart);

      if (!checkoutUrl) {
        throw new Error("Swell cart did not return a checkout URL.");
      }

      window.location.assign(checkoutUrl);
      return true;
    } catch (error) {
      console.error(error);
      setStatus(STATUS.error, "error");
      window.alert(error.message || STATUS.error);
      return false;
    } finally {
      setCheckoutLoading(false);
    }
  }

  window.LacedBaddiesCommerce = {
    checkout,
    getConfig: () => state.config
  };

  document.addEventListener("lacedbaddies:checkout", (event) => {
    checkout(event.detail);
  });

  document.addEventListener("DOMContentLoaded", () => {
    initSwell().catch((error) => {
      console.error(error);
      setStatus(STATUS.error, "error");
    });
  });
})();
