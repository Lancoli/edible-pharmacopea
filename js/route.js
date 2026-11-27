// Archive Botanique: routing — the screen is in the URL.
// See docs/routing.md for the model (Hal).
(function () {
  'use strict';

  // Parse hash into an object: #armoire=1&filtre=dispo → {armoire: '1', filtre: 'dispo'}
  function parseHash(hash) {
    const params = {};
    if (!hash || hash === '#') return params;
    const clean = hash.startsWith('#') ? hash.slice(1) : hash;
    for (const pair of clean.split('&')) {
      const [key, val] = pair.split('=');
      if (key) params[decodeURIComponent(key)] = val ? decodeURIComponent(val) : '';
    }
    return params;
  }

  // Build hash from an object: {armoire: '1', filtre: 'dispo'} → #armoire=1&filtre=dispo
  function buildHash(params) {
    const parts = [];
    for (const [key, val] of Object.entries(params)) {
      if (val !== null && val !== undefined && val !== '') {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
      }
    }
    return parts.length ? '#' + parts.join('&') : '';
  }

  // Current route state
  const route = {
    armoire: null,
    filtre: null,
    fiche: null,     // specimen ID when sheet is open
    vue: null,       // 'herbier' or 'registre'
    tiroir: null,    // 'fournitures' or 'collection' or 'quarantaine'
    caisse: null     // 'ouverte' when checkout is open
  };

  // Apply route to the app
  function apply(params, { instant = false } = {}) {
    // armoire
    const cabinetIndex = params.armoire ? parseInt(params.armoire, 10) : null;
    if (cabinetIndex !== null && cabinetIndex !== route.armoire && window.archiveSwitchCabinet) {
      window.archiveSwitchCabinet(cabinetIndex, { instant });
      route.armoire = cabinetIndex;
    }

    // filtre
    const filter = params.filtre || null;
    if (filter !== route.filtre && window.archiveSetFilter) {
      window.archiveSetFilter(filter);
      route.filtre = filter;
    }

    // Close all dialogs first
    if (!params.fiche && route.fiche && window.archiveCloseSheet) {
      window.archiveCloseSheet();
      route.fiche = null;
    }
    if (!params.vue && route.vue && window.archiveCloseView) {
      window.archiveCloseView(route.vue);
      route.vue = null;
    }
    if (!params.tiroir && route.tiroir && window.archiveCloseDrawer) {
      window.archiveCloseDrawer();
      route.tiroir = null;
    }
    if (!params.caisse && route.caisse && window.archiveCloseCheckout) {
      window.archiveCloseCheckout();
      route.caisse = null;
    }

    // Open dialogs
    if (params.fiche && params.fiche !== route.fiche && window.archiveOpenSheet) {
      window.archiveOpenSheet(params.fiche);
      route.fiche = params.fiche;
    }
    if (params.vue && params.vue !== route.vue && window.archiveOpenView) {
      window.archiveOpenView(params.vue);
      route.vue = params.vue;
    }
    if (params.tiroir && params.tiroir !== route.tiroir && window.archiveOpenDrawer) {
      window.archiveOpenDrawer(params.tiroir);
      route.tiroir = params.tiroir;
    }
    if (params.caisse && !route.caisse && window.archiveOpenCheckout) {
      window.archiveOpenCheckout();
      route.caisse = 'ouverte';
    }

    document.body.dataset.route = 'ready';
  }

  // Read current hash and apply it
  function load({ instant = false } = {}) {
    const params = parseHash(location.hash);
    apply(params, { instant });
  }

  // Update hash from current route state
  function write() {
    const params = {};
    if (route.armoire !== null) params.armoire = String(route.armoire);
    if (route.filtre) params.filtre = route.filtre;
    if (route.fiche) params.fiche = route.fiche;
    if (route.vue) params.vue = route.vue;
    if (route.tiroir) params.tiroir = route.tiroir;
    if (route.caisse) params.caisse = 'ouverte';

    const hash = buildHash(params);
    if (location.hash !== hash) {
      history.replaceState(null, '', hash || '#');
    }
  }

  // Public API
  window.archiveRoute = {
    // Set a route parameter and update URL
    set(key, value) {
      route[key] = value;
      write();
    },

    // Remove a route parameter and update URL
    clear(key) {
      route[key] = null;
      write();
    },

    // Get current route value
    get(key) {
      return route[key];
    },

    // Load route from URL
    load
  };

  // Listen to hash changes (back/forward navigation)
  window.addEventListener('hashchange', () => load({ instant: false }));

  // Load initial route on startup
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => load({ instant: true }));
  } else {
    load({ instant: true });
  }
})();
