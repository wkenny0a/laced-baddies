(function () {
  const STATUS = {
    ready: "",
    missingConfig: "Swell checkout is ready. Add your Swell store ID, public key, and product ID in environment variables.",
    loading: "Preparing your checkout...",
    error: "Checkout could not start. Check your Swell settings and try again."
  };

  const PLAN_LABELS = {
    "30-day": "30-Day Baddie Club",
    onetime: "Buy Once"
  };

  const PRICES = {
    "30-day": { "26": 99, "28": 99, "30": 99 },
    "onetime": { "26": 130, "28": 130, "30": 130 }
  };

  const ACCESSORIES = {
    bald_cap: { name: "Bald Cap", price: 9.99, desc: "Stocking cap for a perfect scalp foundation", img: "assets/bald-cap-new.jpg" },
    sleep_mask: { name: "Silk Sleep Mask", price: 14.99, desc: "Soft satin sleep mask for beauty rest without friction", img: "assets/package-items/sleep-mask.png" },
    silk_cap: { name: "Silk Bonnet", price: 19.99, desc: "Premium silk cap to protect your wave pattern", img: "assets/silk-bonnet-new.jpg" },
    spray_comb: { name: "Spray Comb", price: 29.99, desc: "Detangling brush with built-in styling spray chamber", img: "assets/spray-comb-new.jpg" },
    wig_storage_bag: { name: "Wig Storage Bag", price: 19.99, desc: "Premium zipped hanging bag to keep your crown dust-free", img: "assets/laced-baddies-wig-storage-bag.jpg" }
  };

  const state = {
    config: null,
    isConfigured: false,
    isLoading: false,
    hasAddedToCart: false, // track whether item is in cart
    cart: {
      wig: {
        length: "26",
        plan: "30-day"
      },
      accessories: new Set(["bald_cap", "sleep_mask", "wig_storage_bag", "spray_comb"]) // Default Welcome Kit items
    }
  };

  function getElement(id) {
    return document.getElementById(id);
  }

  function setStatus(message, tone = "muted") {
    const status = getElement("storefront-status");
    const text = getElement("storefront-status-text");

    if (!status || !text) return;

    if (!message) {
      status.hidden = true;
      text.textContent = "";
      return;
    }

    status.hidden = false;
    status.dataset.tone = tone;
    text.textContent = message;
  }

  function setCheckoutLoading(isLoading) {
    state.isLoading = isLoading;
    const button = getElement("cart-checkout-btn");
    const mainButton = getElement("submit-btn");

    if (button) {
      button.disabled = isLoading;
      button.innerText = isLoading ? "PROCESSING..." : "PROCEED TO SECURE CHECKOUT";
    }
    if (mainButton) {
      mainButton.disabled = isLoading;
      mainButton.classList.toggle("is-loading", isLoading);
    }
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

  function buildCartItem(plan, length, selectedAccessories) {
    const productId = resolveProductId(plan, length);
    const item = {
      product_id: productId,
      quantity: 1,
      metadata: {
        source: "laced-baddies-site",
        selected_length: `${length}"`,
        selected_plan: PLAN_LABELS[plan] || plan,
        accessories: Array.from(selectedAccessories).map(id => ACCESSORIES[id]?.name)
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

  function getSwellErrorMessage(response) {
    if (response?.error?.message) return response.error.message;
    if (Array.isArray(response?.errors)) {
      return response.errors.find((error) => error?.message)?.message || "";
    }
    if (response?.errors && typeof response.errors === "object") {
      return Object.values(response.errors).find((error) => error?.message)?.message || "";
    }
    return "";
  }

  function addSwellCartItem(item) {
    if (typeof window.swell?.cart?.requestStateChange === "function") {
      return window.swell.cart.requestStateChange("post", "/cart/items", item);
    }

    return window.swell.cart.addItem(item);
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

  // Cart Drawer UI Operations
  function toggleDrawer(open = true) {
    const drawer = getElement("cart-drawer");
    const overlay = getElement("cart-drawer-overlay");
    if (!drawer || !overlay) return;

    if (open) {
      renderDrawer();

      drawer.classList.add("active");
      overlay.classList.add("active");
      document.body.style.overflow = "hidden"; // Prevent background scroll
    } else {
      drawer.classList.remove("active");
      overlay.classList.remove("active");
      document.body.style.overflow = "";
    }
  }

  function toggleAccessory(id) {
    if (state.cart.accessories.has(id)) {
      state.cart.accessories.delete(id);
    } else {
      state.cart.accessories.add(id);
    }
    renderDrawer();
  }

  function renderDrawer() {
    const { length, plan } = state.cart.wig;
    const isSubscription = plan === "30-day";
    const basePrice = PRICES[plan][length];
    
    // Calculate total price
    let accessoriesTotal = 0;
    if (!isSubscription) {
      state.cart.accessories.forEach(id => {
        if (id !== "wig_storage_bag") {
          accessoriesTotal += ACCESSORIES[id].price;
        }
      });
    }
    const grandTotal = basePrice + accessoriesTotal;

    // Update badge count
    const badge = getElement("cart-badge-count");
    if (badge) {
      if (state.hasAddedToCart) {
        const totalItems = 1 + state.cart.accessories.size;
        badge.textContent = totalItems;
        badge.style.display = "flex";
      } else {
        badge.textContent = "0";
        badge.style.display = "none";
      }
    }

    // Toggle cross-sell section display based on plan and whether items have been added
    const crossSellSection = getElement("cart-cross-sell-section");
    if (crossSellSection) {
      crossSellSection.style.display = (isSubscription || !state.hasAddedToCart) ? "none" : "block";
    }

    // Update cart list title
    const itemsTitle = getElement("cart-items-title");
    if (itemsTitle) {
      itemsTitle.textContent = isSubscription ? "Your 30-Day Baddie Club" : "Your Selections";
      itemsTitle.style.display = state.hasAddedToCart ? "block" : "none";
    }

    // Render Wig and Accessories details
    const itemContainer = getElement("cart-items-list");
    if (itemContainer) {
      if (state.hasAddedToCart) {
        const planSubtitle = plan === "30-day" ? "Fresh wig every 30 days" : "Wig + free storage bag";
        let cartItemsHtml = `
          <div class="cart-item">
            <img src="assets/main_model.png" alt="The Crown Wig" class="cart-item-img">
            <div class="cart-item-info">
              <h4 class="cart-item-name">The 13x6 Body Wave Crown</h4>
              <p class="cart-item-meta">Length: ${length}" | Plan: ${PLAN_LABELS[plan]}</p>
              <p class="cart-item-billing">${planSubtitle}</p>
            </div>
            <div class="cart-item-price">
              $${basePrice}
            </div>
          </div>
        `;

        state.cart.accessories.forEach(accId => {
          const item = ACCESSORIES[accId];
          if (item) {
            const isFree = isSubscription || accId === "wig_storage_bag";
            const itemPrice = isFree ? "FREE" : `$${item.price}`;
            const isFreeStyle = isFree ? 'style="color: var(--accent-mango); font-weight: 800;"' : '';
            cartItemsHtml += `
              <div class="cart-item" style="margin-top: 12px;">
                <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                  <h4 class="cart-item-name">${item.name}</h4>
                  <p class="cart-item-meta">${isSubscription ? "Free Welcome Kit included" : (isFree ? "Free gift included" : "Paid extra")}</p>
                </div>
                <div class="cart-item-price" ${isFreeStyle}>
                  ${itemPrice}
                </div>
              </div>
            `;
          }
        });

        itemContainer.innerHTML = cartItemsHtml;
      } else {
        itemContainer.innerHTML = `
          <div style="text-align: center; padding: 40px 20px; color: #aaa; font-family: var(--font-body);">
            <p style="font-size: 1.1rem; margin-bottom: 20px; color: #fff;">Your cart is empty</p>
            <button type="button" class="btn-checkout" onclick="window.LacedBaddiesCommerce.closeDrawer()" style="width: auto; display: inline-block; padding: 10px 20px; font-size: 0.9rem; background: linear-gradient(135deg, var(--accent-fuchsia), #D00060); border: none; border-radius: 6px; color: #fff; cursor: pointer; font-weight: 600;">
              Keep Browsing
            </button>
          </div>
        `;
      }
    }

    const crossSellContainer = getElement("cart-cross-sell-list");
    if (crossSellContainer) {
      if (state.hasAddedToCart && !isSubscription) {
        // For Buy Once, only show non-wig_storage_bag items as paid extras in the list
        crossSellContainer.innerHTML = Object.entries(ACCESSORIES).map(([id, item]) => {
          const isSelected = state.cart.accessories.has(id);
          const isFree = isSubscription || id === "wig_storage_bag";
          const displayPrice = isFree ? `<span class="free-badge">FREE</span>` : `$${item.price}`;
          
          const isDisabled = id === "wig_storage_bag";
          const buttonText = isSelected ? "Included" : "Add";
          const buttonClass = isSelected ? "btn-cross-sell-toggle selected" : "btn-cross-sell-toggle";
          const clickHandler = isDisabled ? "" : `onclick="window.LacedBaddiesCommerce.toggleAccessory('${id}')"`;
          const disableAttribute = isDisabled ? "disabled" : "";

          return `
            <div class="cross-sell-item ${isSelected ? 'selected' : ''}">
              <div class="cross-sell-info">
                <h5 class="cross-sell-name">${item.name}</h5>
                <p class="cross-sell-desc">${item.desc}</p>
                <div class="cross-sell-pricing">${displayPrice}</div>
              </div>
              <button type="button" class="${buttonClass}" ${clickHandler} ${disableAttribute}>
                ${buttonText}
              </button>
            </div>
          `;
        }).join("");
      } else {
        crossSellContainer.innerHTML = "";
      }
    }

    // Render Subtotal & Summary
    const summaryContainer = getElement("cart-summary-box");
    if (summaryContainer) {
      if (state.hasAddedToCart) {
        summaryContainer.style.display = "block";
        const billingCycleText = plan === "30-day" ? " / month" : "";
        summaryContainer.innerHTML = `
          <div class="summary-line">
            <span>Subtotal</span>
            <span>$${basePrice}</span>
          </div>
          ${!isSubscription && accessoriesTotal > 0 ? `
            <div class="summary-line">
              <span>Accessories Add-on</span>
              <span>+$${accessoriesTotal}</span>
            </div>
          ` : ""}
          <div class="summary-line total">
            <span>Total Today</span>
            <span>$${grandTotal}${billingCycleText}</span>
          </div>
          ${isSubscription ? `<p class="billing-disclosure-text">Billed monthly at $99 plus applicable tax. Cancel or pause anytime.</p>` : ""}
        `;
      } else {
        summaryContainer.style.display = "none";
      }
    }

    // Hide/show checkout button in footer
    const checkoutBtn = getElement("cart-checkout-btn");
    if (checkoutBtn) {
      checkoutBtn.style.display = state.hasAddedToCart ? "block" : "none";
    }
    const trustNotice = document.querySelector(".checkout-trust-notice");
    if (trustNotice) {
      trustNotice.style.display = state.hasAddedToCart ? "block" : "none";
    }
  }

  async function checkout() {
    const { plan, length } = state.cart.wig;

    if (state.isLoading) return false;


    // Save cart state to localStorage so the custom checkout page can read it easily
    const currentCartData = {
      wig: { plan, length },
      accessories: Array.from(state.cart.accessories)
    };
    localStorage.setItem("laced_baddies_cart", JSON.stringify(currentCartData));

    // If Swell is configured, we can populate the Swell cart before redirecting
    if (state.isConfigured) {
      const items = [];
      const item = buildCartItem(plan, length, state.cart.accessories);

      if (item.product_id) {
        items.push(item);

        const isSubscription = plan === "30-day";
        if (!isSubscription) {
          state.cart.accessories.forEach(accId => {
            if (accId === "wig_storage_bag") return;
            const swellAccId = state.config?.accessoryProductIds?.[accId];
            if (swellAccId) {
              items.push({
                product_id: swellAccId,
                quantity: 1,
                metadata: {
                  source: "laced-baddies-site-accessory"
                }
              });
            }
          });
        }

        try {
          setCheckoutLoading(true);
          setStatus(STATUS.loading, "muted");

          // Clear current Swell cart first to ensure a clean slate
          await window.swell.cart.setItems([]);

          // Add items sequentially to the Swell cart
          for (const cartItem of items) {
            const cart = await addSwellCartItem(cartItem);
            if (cart?.errors || cart?.error) {
              throw new Error(getSwellErrorMessage(cart) || "Swell cart error.");
            }
          }
        } catch (error) {
          console.error("Swell cart error, proceeding with mock checkout fallback:", error);
        } finally {
          setCheckoutLoading(false);
        }
      }
    }

    // Trigger InitiateCheckout Meta event
    if (window.LacedBaddiesMeta) {
      const basePrice = PRICES[plan][length];
      const isSubscription = plan === "30-day";
      let accessoriesTotal = 0;
      if (!isSubscription) {
        state.cart.accessories.forEach(id => {
          if (id !== "wig_storage_bag") {
            accessoriesTotal += ACCESSORIES[id].price;
          }
        });
      }
      const grandTotal = basePrice + accessoriesTotal;
      window.LacedBaddiesMeta.track('InitiateCheckout', {}, {
        content_name: 'The 13x6 Body Wave Crown',
        content_category: 'Wigs',
        value: grandTotal,
        currency: 'USD'
      });
    }

    // Redirect to the custom checkout page
    window.location.assign("checkout.html");
    return true;
  }

  // Expose Global functions
  window.LacedBaddiesCommerce = {
    openDrawer: () => toggleDrawer(true),
    closeDrawer: () => toggleDrawer(false),
    toggleAccessory: (id) => toggleAccessory(id),
    updateWigSelection: (length, plan, addToCart = false) => {
      if (state.cart.wig.plan !== plan) {
        if (plan === "30-day") {
          state.cart.accessories = new Set(["bald_cap", "sleep_mask", "wig_storage_bag", "spray_comb"]);
        } else {
          state.cart.accessories = new Set(["wig_storage_bag"]);
        }
      }
      state.cart.wig.length = length;
      state.cart.wig.plan = plan;

      if (addToCart) {
        state.hasAddedToCart = true;
      }

      if (state.hasAddedToCart) {
        const currentCartData = {
          wig: { plan, length },
          accessories: Array.from(state.cart.accessories)
        };
        localStorage.setItem("laced_baddies_cart", JSON.stringify(currentCartData));
      }

      renderDrawer();
    },
    checkout,
    getConfig: () => state.config
  };

  document.addEventListener("DOMContentLoaded", () => {
    const saved = localStorage.getItem("laced_baddies_cart");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.wig) {
          state.cart.wig = parsed.wig;
          state.cart.accessories = new Set(parsed.accessories || []);
          state.hasAddedToCart = true;
        }
      } catch (e) {
        console.error("Error loading cart:", e);
      }
    }

    initSwell().catch((error) => {
      console.error(error);
      setStatus(STATUS.error, "error");
    });
    renderDrawer();
  });
})();
