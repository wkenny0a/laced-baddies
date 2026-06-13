(function() {
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  function trackMetaEvent(eventName, userData = {}, customData = {}) {
    const eventId = "evt_" + Math.random().toString(36).substring(2, 15) + "_" + Date.now();
    const eventSourceUrl = window.location.href;

    // 1. Trigger Browser Pixel
    if (window.fbq) {
      window.fbq('track', eventName, customData, { eventID: eventId });
    }

    // 2. Trigger Conversions API (Server)
    const fbp = getCookie('_fbp');
    const fbc = getCookie('_fbc');

    const payload = {
      event_name: eventName,
      event_id: eventId,
      event_source_url: eventSourceUrl,
      user_data: {
        fbp,
        fbc,
        ...userData
      },
      custom_data: customData
    };

    fetch('/api/meta-capi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(err => console.warn('CAPI error:', err));
  }

  window.LacedBaddiesMeta = {
    track: trackMetaEvent,
    getCookie: getCookie
  };
})();
