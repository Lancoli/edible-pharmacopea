// Archive Botanique: cabinets, sheets, checkout and herbarium.
(function () {
  'use strict';

  const A = window.ARMOIRES, S = window.SPECIMENS, SECRET_SPECIMENS = window.TIROIR_SECRET, F = window.FOURNITURES, R = window.RARETES;
  const ALL_SPECIMENS = S.concat(SECRET_SPECIMENS);
  const byId = Object.fromEntries(ALL_SPECIMENS.map((p) => [p.id, p]));
  const supplyById = Object.fromEntries(F.map((x) => [x.id, x]));
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  // Shelf positions in the cabinet image (in % of the height)
  const SHELVES = { 1: 27.7, 2: 44.1, 3: 59.4 };
  const COLUMNS = [32, 50, 68];
  const BELL_JAR = { x: 50, base: 75.2 };
  const GLASS_BOTTOM = 87.6;
  const DRAWER_THRESHOLD = 5;
  const FREE_SHIPPING = 75, SHIPPING = 7.9;
  const QUARANTINE_END = new Date(2026, 10, 14, 18, 0);
  const TIERS = [
    { seve: 100, texte: 'Un tube surprise glissé dans votre prochain colis' },
    { seve: 250, texte: 'Les arrivages 24 heures avant tout le monde' },
    { seve: 500, texte: 'Un spécimen d\'archive réservé à votre nom' }
  ];
  const ROMAN_NUMERALS = ['I', 'II', 'III'];

  // ---------- State, stored in this browser ----------

  const STORE_KEY = 'archive-botanique-v1';
  const state = { armoire: 0, neons: true, filtre: 'tout', panier: [], herbier: {}, pris: {}, seve: 0, rappels: [] };
  try {
    const stored = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (stored && typeof stored === 'object') Object.assign(state, stored);
  } catch (e) { /* storage unavailable: start from scratch */ }
  if (!(state.armoire >= 0 && state.armoire < A.length)) state.armoire = 0;
  state.panier = (state.panier || []).filter((l) => byId[l.id] || supplyById[l.id]);

  function save() {
    try {
      const { armoire: cabinet, neons, panier: cart, herbier: herbarium, pris: taken, seve: sap, rappels: reminders } = state;
      localStorage.setItem(STORE_KEY, JSON.stringify({ armoire: cabinet, neons, panier: cart, herbier: herbarium, pris: taken, seve: sap, rappels: reminders }));
    } catch (e) { /* never mind */ }
  }

  // ---------- Helpers ----------

  const fmt = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
  const fmtRond = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  const euros = (n) => (Number.isInteger(n) ? fmtRond : fmt).format(n);
  const escapeHtml = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const stripAccents = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const number = (p) => 'N° ' + String(p.n).padStart(2, '0');

  const stock = (p) => Math.max(0, p.stock - (state.pris[p.id] || 0));
  const inCart = (id) => state.panier.filter((l) => l.id === id).reduce((t, l) => t + l.qte, 0);
  const ownedList = () => ALL_SPECIMENS.filter((p) => state.herbier[p.id] > 0);
  const ownedCount = () => S.filter((p) => state.herbier[p.id] > 0).length;
  const drawerOpen = () => ownedCount() >= DRAWER_THRESHOLD;

  function nameHtml(p) {
    return `<i>${escapeHtml(p.latin)}</i>${p.cultivar ? ` <span class="fiche-cultivar">‘${escapeHtml(p.cultivar)}’</span>` : ''}`;
  }
  const nameText = (p) => p.latin + (p.cultivar ? ` ‘${p.cultivar}’` : '');

  function rarityHtml(p) {
    let pips = '';
    for (let i = 1; i <= 5; i++) pips += `<i class="${i <= p.rarete ? 'on' : ''}"></i>`;
    return `<span class="rarete r${p.rarete}"><span class="pips" aria-hidden="true">${pips}</span><span class="rarete-nom">${R[p.rarete].nom}</span></span>`;
  }

  function stockText(p) {
    const n = stock(p);
    if (!n) return 'Épuisé';
    if (n === 1) return 'Dernier tube';
    if (n <= 3) return `Plus que ${n} tubes`;
    return `${n} tubes en stock`;
  }

  function placeText(p) {
    if (p.secret) return 'Tiroir du collectionneur';
    const a = A[p.armoire];
    if (p.place[0] === 'cloche') return `Armoire ${a.numero} · sous cloche`;
    return `Armoire ${a.numero} · étagère ${ROMAN_NUMERALS[p.place[0] - 1]}`;
  }

  function nextShipping() {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    do d.setDate(d.getDate() + 1); while (d.getDay() !== 1 && d.getDay() !== 2);
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  }
  const isWinter = () => [10, 11, 0, 1, 2].includes(new Date().getMonth());

  function isMatch(p) {
    switch (state.filtre) {
      case 'dispo': return stock(p) > 0;
      case 'eclat': return !!p.eclat;
      case 'petit': return p.prix < 20;
      case 'rare': return p.rarete >= 3;
      default: return true;
    }
  }

  function toast(html) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = html;
    $('#toasts').appendChild(t);
    setTimeout(() => t.remove(), 4300);
  }

  // ---------- Ornaments set on the shelves ----------

  const ORNAMENTS = {
    livres: `<svg viewBox="0 0 90 64"><rect x="4" y="46" width="82" height="16" rx="1" fill="#5a1e1a"/><rect x="80" y="47" width="5" height="14" fill="#e6dcc0"/><path d="M14 46v16M70 46v16" stroke="#c9a35b" stroke-width="1.2"/><rect x="10" y="32" width="70" height="14" rx="1" fill="#24402c"/><rect x="74" y="33" width="5" height="12" fill="#e6dcc0"/><path d="M18 32v14M62 32v14" stroke="#c9a35b" stroke-width="1"/><rect x="6" y="20" width="74" height="12" rx="1" fill="#6a4a1e"/><rect x="74" y="21" width="5" height="10" fill="#efe4c8"/><text x="40" y="29" text-anchor="middle" font-family="IM Fell English SC, Georgia, serif" font-size="6.5" fill="#e8cf8f">FLORA</text><rect x="14" y="2" width="9" height="18" fill="#3a2a4a"/><path d="M14 6h9M14 16h9" stroke="#c9a35b" stroke-width=".8"/></svg>`,
    loupe: `<svg viewBox="0 0 80 50"><path d="M36 36L76 44" stroke="#3a2412" stroke-width="7" stroke-linecap="round"/><path d="M36 36L76 44" stroke="#7a5030" stroke-width="3" stroke-linecap="round"/><ellipse cx="22" cy="34" rx="18" ry="11" fill="rgba(200,230,255,.14)" stroke="#c9a35b" stroke-width="3.2"/><ellipse cx="17" cy="31" rx="7" ry="3" fill="#fff" opacity=".25"/><circle cx="38" cy="37" r="2.4" fill="#e8cf8f"/></svg>`,
    bocal: `<svg viewBox="0 0 44 66"><rect x="10" y="2" width="24" height="10" rx="2" fill="#a47a4a"/><path d="M8 14h28v42a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6Z" fill="rgba(210,235,225,.12)" stroke="rgba(230,250,240,.45)" stroke-width="1.2"/><path d="M9 40h26v16a5 5 0 0 1-5 5H14a5 5 0 0 1-5-5Z" fill="#6a4a24"/><g fill="#d8b878"><circle cx="14" cy="45" r="1.4"/><circle cx="20" cy="43" r="1.2"/><circle cx="27" cy="46" r="1.5"/><circle cx="31" cy="42" r="1.1"/><circle cx="17" cy="52" r="1.3"/><circle cx="24" cy="54" r="1.4"/></g><rect x="12" y="22" width="20" height="10" fill="#e8dcc0"/><text x="22" y="29.5" text-anchor="middle" font-family="Special Elite, monospace" font-size="5" fill="#3a2a1a">Semina</text><rect x="11" y="16" width="2" height="36" rx="1" fill="#fff" opacity=".25"/></svg>`
  };

  function ornament(name, x, base, boxWidth) {
    return `<div class="ornement" style="left:${x}%;bottom:${100 - base}%;width:${boxWidth}%">${ORNAMENTS[name]}</div>`;
  }

  function glitter(p) {
    const pos = [[10, 18, 0], [82, 36, 1.1], [18, 62, 2.2], [76, 8, .6]];
    return `<span class="paillettes" aria-hidden="true">${pos.map(([x, y, d]) => `<i style="left:${x}%;top:${y}%;animation-delay:${d + (p.n % 3) * .4}s"></i>`).join('')}</span>`;
  }

  function ariaSpec(p) {
    return `${nameText(p)}, ${R[p.rarete].nom}${p.eclat ? ', éclat' : ''}, ${euros(p.prix)}, ${stockText(p)}`;
  }

  // ---------- The cabinet ----------

  const cabinetEl = $('#armoire'), imgEl = $('#armoire-img'), contentEl = $('#contenu');

  function renderCabinet() {
    const specs = S.filter((p) => p.armoire === state.armoire);
    let h = '';
    for (const e of [1, 2, 3]) {
      h += `<div class="ratelier" style="bottom:${100 - SHELVES[e]}%"><span class="socle"></span><span class="pied g"></span><span class="pied d"></span><span class="rail"></span></div>`;
    }
    h += ornament('livres', 83.5, SHELVES[1], 10);
    h += ornament('loupe', 16.5, SHELVES[2], 9);
    h += ornament('bocal', 83, SHELVES[3], 5.6);

    for (const p of specs) {
      const classes = `${p.eclat ? ' eclat' : ''}${stock(p) ? '' : ' epuise'}${isMatch(p) ? '' : ' estompe'}`;
      if (p.place[0] === 'cloche') {
        h += `<div class="faisceau" style="top:62.4%;height:${BELL_JAR.base - 62.4 - 6}%"></div>`;
        h += `<button type="button" class="cloche-btn${classes}" data-id="${p.id}" style="left:${BELL_JAR.x}%;bottom:${100 - BELL_JAR.base}%" aria-label="Sous cloche : ${escapeHtml(ariaSpec(p))}">${Drawing.cloche(p)}</button>`;
        h += `<span class="cartel" style="left:50%;top:76.9%">Spécimen d'archive</span>`;
      } else {
        const [e, c] = p.place;
        h += `<button type="button" class="tube r${p.rarete}${classes}" data-id="${p.id}" style="left:${COLUMNS[c]}%;bottom:${100 - SHELVES[e]}%" aria-label="${escapeHtml(ariaSpec(p))}"><span class="halo"></span>${Drawing.tube(p)}${p.eclat ? glitter(p) : ''}${stock(p) ? '' : '<span class="badge-epuise">Épuisé</span>'}</button>`;
        // no price tag in the cabinet for now (ticket #27): the price is on the sheet
      }
    }

    // Quarantine specimens lying on the bottom pane
    h += `<span class="carton" style="left:13.5%;top:81.6%">Quarantaine<br>sortie le 14 nov.</span>`;
    [35, 50, 65].forEach((x, i) => {
      const q = { id: `quarantaine-${state.armoire}-${i}`, n: 0, rarete: 1, dessin: {} };
      h += `<button type="button" class="couche" data-quarantaine="1" style="left:${x}%;bottom:${100 - GLASS_BOTTOM}%" aria-label="Tube en quarantaine, espèce révélée le 14 novembre">${Drawing.tube(q, { mystere: true, couche: true, sansEtiquette: true })}</button>`;
    });

    contentEl.innerHTML = h;
    $('#tiroir-d-label').textContent = drawerOpen() ? 'Tiroir du collectionneur' : `Tiroir verrouillé · ${Math.min(ownedCount(), DRAWER_THRESHOLD)}/${DRAWER_THRESHOLD}`;
  }

  function applyNeon() {
    document.documentElement.style.setProperty('--neon', A[state.armoire].neon);
  }

  // Cabinet transition: the current one slides to one side, the next arrives from the other (ticket #30)
  const calme = matchMedia('(prefers-reduced-motion: reduce)');
  let change = 0;
  function switchCabinet(i, { instant = false, direction = 0 } = {}) {
    if (i === state.armoire && !instant) return Promise.resolve();
    if (!direction) direction = i > state.armoire ? 1 : -1;
    state.armoire = i;
    save();
    if (window.archiveRoute) window.archiveRoute.set('armoire', i);
    renderChoice();
    renderIntro();
    showLabel(null);
    const token = ++change;
    const a = A[i];
    return new Promise((endAt) => {
      const ready = () => {
        if (token !== change) return endAt();
        imgEl.src = a.image;
        applyNeon();
        renderCabinet();
        if (!instant && !calme.matches && cabinetEl.animate) {
          cabinetEl.getAnimations().forEach((x) => x.cancel());
          cabinetEl.animate([{ transform: `translateX(${direction * 18}%)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.2, .8, .2, 1)' });
        }
        cabinetEl.classList.remove('extinction');
        cabinetEl.classList.remove('allumage');
        void cabinetEl.offsetWidth;
        cabinetEl.classList.add('allumage');
        setTimeout(() => cabinetEl.classList.remove('allumage'), 1150);
        endAt();
      };
      if (instant) return ready();
      cabinetEl.classList.add('extinction');
      if (!calme.matches && cabinetEl.animate) {
        cabinetEl.animate([{ transform: 'none', opacity: 1 }, { transform: `translateX(${-direction * 18}%)`, opacity: 0 }], { duration: 230, easing: 'ease-in', fill: 'forwards' });
      }
      const preload = new Image();
      let loaded = false, awaited = false;
      const tryReady = () => { if (loaded && awaited) ready(); };
      preload.onload = preload.onerror = () => { loaded = true; tryReady(); };
      preload.src = a.image;
      setTimeout(() => { awaited = true; tryReady(); }, 230);
    });
  }

  // ---------- Console: cabinet tabs ----------

  function renderChoice() {
    $('#choix-armoires').innerHTML = A.map((a, i) => {
      const specs = S.filter((p) => p.armoire === i);
      const pressedCount = specs.filter((p) => state.herbier[p.id] > 0).length;
      return `<button type="button" class="choix" role="tab" aria-selected="${i === state.armoire}" data-armoire="${i}" style="--c:${a.neon}" title="${pressedCount} sur ${specs.length} dans votre herbier">
        <span class="choix-num">${a.numero}</span>
        <span class="choix-nom">${a.nom}</span>
        <span class="choix-compte">${pressedCount} / ${specs.length} à l'herbier</span>
        <span class="choix-barre"><i style="width:${(pressedCount / specs.length) * 100}%"></i></span>
      </button>`;
    }).join('');
  }

  function renderIntro() {
    const a = A[state.armoire];
    const specs = S.filter((x) => x.armoire === state.armoire);
    const tubes = specs.reduce((t, x) => t + stock(x), 0);
    const sparkles = specs.filter((x) => x.eclat).length;
    $('#armoire-intro').innerHTML = `<div class="intro-in">
      <h2 class="intro-titre"><span>Armoire ${a.numero}</span> ${a.nom}</h2>
      <p class="intro-texte">${a.texte}</p>
      <p class="intro-chiffres">${specs.length} spécimens · ${tubes} tubes · ${sparkles} éclat${sparkles > 1 ? 's' : ''}</p>
    </div>`;
  }

  const FILTERS = [['tout', 'Tout'], ['dispo', 'Disponibles'], ['eclat', 'Éclats'], ['petit', 'Moins de 20 €'], ['rare', 'Rares et plus']];
  function renderFilters() {
    $('#filtres').innerHTML = FILTERS.map(([k, l]) => `<button type="button" class="puce" data-filtre="${k}" aria-pressed="${state.filtre === k}">${l}</button>`).join('');
  }

  function setFilter(f) {
    if (!f || !FILTERS.some(([k]) => k === f)) f = 'tout';
    state.filtre = f;
    renderFilters();
    $$('[data-id]', contentEl).forEach((t) => t.classList.toggle('estompe', !isMatch(byId[t.dataset.id])));
    $$('[data-tag]', contentEl).forEach((t) => t.classList.toggle('estompe', !isMatch(byId[t.dataset.tag])));
    renderRegistry();
    if (window.archiveRoute) window.archiveRoute.set('filtre', f === 'tout' ? null : f);
  }

  // ---------- Table: clicked tube with its card on leaf paper (ticket #27) ----------
  // On a large screen, clicking a tube displays it on the table: the cabinet slides left to make room.
  // While the table is active, hovering another tube changes the card. A second click opens the full sheet.
  // On a phone, no table: clicking directly opens the sheet.

  const sceneEl = $('.scene'), tableEl = $('#table');
  const wideScreen = matchMedia('(min-width: 1000px) and (hover: hover)');
  let onTable = null;

  function showLabel(p) {
    $$('.tube.choisi, .cloche-btn.choisi', contentEl).forEach((t) => t.classList.remove('choisi'));
    if (!p) {
      onTable = null;
      sceneEl.classList.remove('avec-table');
      tableEl.inert = true;
      return;
    }
    onTable = p.id;
    const t = contentEl.querySelector(`[data-id="${p.id}"]`);
    if (t) t.classList.add('choisi');
    const n = stock(p);
    $('#table-tube').innerHTML = p.place[0] === 'cloche' ? Drawing.cloche(p) : Drawing.tube(p);
    $('#table-tube').classList.toggle('est-cloche', p.place[0] === 'cloche');
    $('#carte').innerHTML = `<p class="etq-num">${number(p)} · ${placeText(p)}</p>
      <p class="etq-latin">${nameHtml(p)}</p>
      <p class="etq-fr">${p.fr}</p>
      <div class="etq-ligne">${rarityHtml(p)}${p.eclat ? '<span class="marque-eclat">éclat</span>' : ''}</div>
      <p class="etq-texte">${p.texte}</p>
      <p class="etq-origine"><b>Origine</b> · ${p.origine}</p>
      <div class="etq-ligne"><span class="etq-stock${n && n <= 2 ? ' bas' : ''}">${stockText(p)}</span><span class="etq-stock">${p.famille}</span></div>
      <button type="button" class="btn etq-ouvrir" data-fiche="${p.id}">Ouvrir la fiche</button>`;
    tableEl.classList.toggle('eclat', !!p.eclat);
    sceneEl.classList.add('avec-table');
    tableEl.inert = false;
  }

  tableEl.addEventListener('click', (e) => {
    if (e.target.closest('[data-ranger]')) return showLabel(null);
    const f = e.target.closest('[data-fiche]');
    if (f) openSheet(f.dataset.fiche);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && onTable && !document.querySelector('dialog[open]')) showLabel(null);
  });

  // ---------- Sheet ----------

  const sheetEl = $('#fiche');
  let currentSheet = null;

  function neighbours(p) {
    const itemList = p.secret ? SECRET_SPECIMENS : S.filter((x) => x.armoire === p.armoire);
    const i = itemList.indexOf(p);
    return [itemList[(i - 1 + itemList.length) % itemList.length], itemList[(i + 1) % itemList.length]];
  }

  function openSheet(id) {
    const p = byId[id];
    if (!p) return;
    currentSheet = p;
    if (window.archiveRoute) window.archiveRoute.set('fiche', id);
    const neon = p.secret ? '#ead08f' : A[p.armoire].neon;
    const n = stock(p);
    const alreadyTaken = inCart(p.id);
    const owned = state.herbier[p.id] || 0;
    const care = ['Lumière', 'Humidité', 'Arrosage', 'Croissance'].map((name, i) => {
      let pts = '';
      for (let k = 1; k <= 5; k++) pts += `<i class="${k <= p.soins[i] ? 'on' : ''}"></i>`;
      return `<div><dt>${name}</dt><dd aria-label="${p.soins[i]} sur 5">${pts}</dd></div>`;
    }).join('');
    const formats = [`<label class="format"><input type="radio" name="format" id="format-bouture" value="bouture" checked><span>Bouture en tube<small>Un nœud, une ou deux feuilles, sur sphaigne</small></span><b>${euros(p.prix)}</b></label>`];
    if (p.racinee) formats.push(`<label class="format"><input type="radio" name="format" id="format-racinee" value="racinee"><span>Bouture racinée<small>Racines de 3 à 5 cm, prête à empoter</small></span><b>${euros(p.racinee)}</b></label>`);
    const underBell = p.place && p.place[0] === 'cloche'
      ? `<div class="grande-cloche">${Drawing.cloche(p)}</div>`
      : `<div class="grand-tube">${Drawing.tube(p)}</div>`;

    sheetEl.innerHTML = `<div class="fiche-corps" style="--neon:${neon}">
      <button type="button" class="fermer" data-fermer aria-label="Fermer la fiche">×</button>
      <div class="visionneuse">
        <button type="button" class="nav-fiche prec" data-voisin="-1" aria-label="Spécimen précédent">‹</button>
        ${underBell}
        <button type="button" class="nav-fiche suiv" data-voisin="1" aria-label="Spécimen suivant">›</button>
        <p class="visionneuse-legende">${placeText(p)}</p>
      </div>
      <div class="feuille-fiche${p.eclat ? ' eclat' : ''}">
        <p class="fiche-ref">Fiche ${number(p)} · ${p.famille}</p>
        <span class="tampon r${p.rarete}" aria-hidden="true">${R[p.rarete].nom}</span>
        <h2 class="fiche-latin" id="fiche-titre">${nameHtml(p)}</h2>
        <p class="fiche-fr">${p.fr}</p>
        <div class="fiche-meta">${rarityHtml(p)}${p.eclat ? '<span class="marque-eclat" title="Spécimen panaché ou irisé : compte double en sève">éclat · sève ×2</span>' : ''}</div>
        <p class="fiche-texte">${p.texte}</p>
        <p class="fiche-origine"><b>Origine</b> · ${p.origine}</p>
        <dl class="soins">${care}</dl>
        ${n ? `<fieldset class="formats"><legend>Format</legend>${formats.join('')}</fieldset>` : ''}
        <div class="fiche-actions">
          ${n
            ? `<button type="button" class="btn" id="fiche-ajout">Ajouter au colis · <span id="fiche-ajout-prix">${euros(p.prix)}</span></button>`
            : `<button type="button" class="btn btn-creux" id="fiche-rappel">Me prévenir au retour</button>`}
          <span class="fiche-stock${n && n <= 2 ? ' bas' : ''}">${stockText(p)}${alreadyTaken ? ` · ${alreadyTaken} déjà dans le colis` : ''}</span>
        </div>
        <p class="fiche-herbier${owned ? '' : ' manque'}">${owned ? `Dans votre herbier · reçu ${owned} fois` : 'Manque à votre herbier'}</p>
      </div>
    </div>`;
    if (!sheetEl.open) sheetEl.showModal();
    const first = $('#fiche-ajout, #fiche-rappel', sheetEl);
    if (first) first.focus({ preventScroll: true });
  }

  function closeSheet() {
    sheetEl.close();
    currentSheet = null;
    if (window.archiveRoute) window.archiveRoute.clear('fiche');
  }

  sheetEl.addEventListener('click', (e) => {
    if (e.target === sheetEl || e.target.closest('[data-fermer]')) return closeSheet();
    const v = e.target.closest('[data-voisin]');
    if (v && currentSheet) return openSheet(neighbours(currentSheet)[v.dataset.voisin === '-1' ? 0 : 1].id);
    if (e.target.closest('#fiche-ajout')) {
      const format = ($('input[name="format"]:checked', sheetEl) || {}).value || 'bouture';
      if (addToCart(currentSheet.id, format)) closeSheet();
      return;
    }
    if (e.target.closest('#fiche-rappel')) {
      if (!state.rappels.includes(currentSheet.id)) state.rappels.push(currentSheet.id);
      save();
      toast(`Rappel noté pour <b>${escapeHtml(currentSheet.latin)}</b>.`);
      e.target.closest('#fiche-rappel').disabled = true;
    }
  });
  sheetEl.addEventListener('change', (e) => {
    if (e.target.name !== 'format' || !currentSheet) return;
    const price = e.target.value === 'racinee' ? currentSheet.racinee : currentSheet.prix;
    $('#fiche-ajout-prix', sheetEl).textContent = euros(price);
  });
  sheetEl.addEventListener('keydown', (e) => {
    if (!currentSheet || e.target.matches('input[type="radio"]')) return;
    if (e.key === 'ArrowLeft') openSheet(neighbours(currentSheet)[0].id);
    if (e.key === 'ArrowRight') openSheet(neighbours(currentSheet)[1].id);
  });
  sheetEl.addEventListener('pointermove', (e) => {
    const f = e.target.closest('.feuille-fiche.eclat');
    if (!f) return;
    const r = f.getBoundingClientRect();
    f.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    f.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
  });

  // ---------- Checkout ----------

  const checkoutEl = $('#caisse');
  let checkoutMode = 'liste';

  function linePrice(l) {
    if (l.format === 'fourniture') return supplyById[l.id].prix;
    const p = byId[l.id];
    return l.format === 'racinee' ? p.racinee : p.prix;
  }

  function addToCart(id, format) {
    if (format !== 'fourniture') {
      const p = byId[id];
      const remaining = stock(p) - inCart(id);
      if (remaining <= 0) {
        toast(stock(p) ? `Tous les tubes de <b>${escapeHtml(p.latin)}</b> sont déjà dans votre colis.` : `<b>${escapeHtml(p.latin)}</b> est épuisé.`);
        return false;
      }
    }
    const l = state.panier.find((x) => x.id === id && x.format === format);
    if (l) l.qte += 1; else state.panier.push({ id, format, qte: 1 });
    save();
    updateCounter(true);
    const name = format === 'fourniture' ? supplyById[id].nom : byId[id].latin;
    toast(`<b>${escapeHtml(name)}</b> est dans le colis.`);
    return true;
  }

  function updateCounter(typed) {
    const n = state.panier.reduce((t, l) => t + l.qte, 0);
    const el = $('#caisse-nb');
    el.textContent = n;
    if (typed) { el.classList.remove('tape'); void el.offsetWidth; el.classList.add('tape'); }
    $('#seve-nb').textContent = Math.round(state.seve);
  }

  function totals() {
    const subtotal = state.panier.reduce((t, l) => t + linePrice(l) * l.qte, 0);
    const shippingCost = !state.panier.length || subtotal >= FREE_SHIPPING ? 0 : SHIPPING;
    return { sous: subtotal, port: shippingCost, total: subtotal + shippingCost };
  }

  function sapOf(cart) {
    return cart.reduce((t, l) => {
      if (l.format === 'fourniture') return t;
      return t + linePrice(l) * l.qte * (byId[l.id].eclat ? 2 : 1);
    }, 0);
  }

  function renderCheckout() {
    const { sous: subtotal, port: shippingCost, total } = totals();
    let mainBody = '';
    if (checkoutMode === 'scelle') {
      mainBody = `<div class="scelle">${SEAL}<h3>Colis scellé</h3><p>${lastReport}</p><button type="button" class="btn" data-herbier>Voir mon herbier</button></div>`;
      checkoutEl.innerHTML = `<div class="caisse-corps"><div class="caisse-tete"><h2 id="caisse-titre">Le colis</h2></div><div class="caisse-lignes">${mainBody}</div><div></div><button type="button" class="fermer" data-fermer aria-label="Fermer le colis">×</button></div>`;
      return;
    }
    if (!state.panier.length) {
      mainBody = `<div class="caisse-vide"><p>Le colis est vide. Les tubes vous attendent sur les étagères.</p><button type="button" class="btn btn-creux" data-fermer>Retour aux armoires</button></div>`;
    } else if (checkoutMode === 'commande') {
      mainBody = `<form class="commande" id="form-commande">
        <label for="c-nom">Nom<input id="c-nom" name="nom" autocomplete="name" required></label>
        <label for="c-mail">E-mail<input id="c-mail" name="mail" type="email" autocomplete="email" required></label>
        <label for="c-adresse">Adresse<textarea id="c-adresse" name="adresse" autocomplete="street-address" required></textarea></label>
        <div class="duo">
          <label for="c-cp">Code postal<input id="c-cp" name="cp" autocomplete="postal-code" inputmode="numeric" required></label>
          <label for="c-ville">Ville<input id="c-ville" name="ville" autocomplete="address-level2" required></label>
        </div>
        <p class="caisse-note">Prototype : aucun paiement n'est demandé. Valider remplit votre herbier pour la démonstration.</p>
      </form>`;
    } else {
      mainBody = state.panier.map((l, i) => {
        const isSupply = l.format === 'fourniture';
        const p = isSupply ? null : byId[l.id];
        const max = isSupply ? 99 : stock(p) - inCart(l.id) + l.qte;
        const underBell = isSupply ? `<span class="ligne-vis fourniture" aria-hidden="true">✦</span>` : `<span class="ligne-vis">${Drawing.tube(p, { sansEtiquette: true })}</span>`;
        const name = isSupply
          ? `${escapeHtml(supplyById[l.id].nom)}<small>${escapeHtml(supplyById[l.id].detail)}</small>`
          : `${nameHtml(p)}<small>${number(p)} · ${l.format === 'racinee' ? 'bouture racinée' : 'bouture en tube'}</small>`;
        return `<div class="ligne">${underBell}<div class="ligne-nom">${name}</div><div class="ligne-droite"><span class="ligne-prix">${euros(linePrice(l) * l.qte)}</span><span class="qte"><button type="button" data-moins="${i}" aria-label="Retirer un">−</button><span>${l.qte}</span><button type="button" data-plus="${i}" aria-label="Ajouter un"${l.qte >= max ? ' disabled' : ''}>+</button></span></div></div>`;
      }).join('');
    }

    let foot = '';
    if (state.panier.length) {
      const missing = FREE_SHIPPING - subtotal;
      foot = `<div class="caisse-pied">
        <div class="total-ligne"><span>Sous-total</span><span>${fmt.format(subtotal)}</span></div>
        <div class="total-ligne${shippingCost ? '' : ' offert'}"><span>Colissimo suivi</span><span>${shippingCost ? fmt.format(shippingCost) : 'offert'}</span></div>
        ${isWinter() ? '<div class="total-ligne offert"><span>Sachet chauffant 40 h</span><span>offert</span></div>' : ''}
        <div class="total-ligne grand"><span>Total</span><span>${fmt.format(total)}</span></div>
        <p class="caisse-note">${missing > 0 ? `Encore ${fmt.format(missing)} pour le port offert. ` : ''}Prochain envoi : ${nextShipping()}. Sève gagnée : ${Math.round(sapOf(state.panier))} gouttes.</p>
        ${checkoutMode === 'commande'
          ? `<div class="fiche-actions"><button type="submit" class="btn" form="form-commande">Sceller le colis · ${fmt.format(total)}</button><button type="button" class="btn btn-creux" data-retour>Retour</button></div>`
          : `<button type="button" class="btn" data-commander>Passer commande</button>`}
      </div>`;
    }
    const n = state.panier.reduce((t, l) => t + l.qte, 0);
    checkoutEl.innerHTML = `<div class="caisse-corps">
      <div class="caisse-tete"><h2 id="caisse-titre">${checkoutMode === 'commande' ? 'Expédition' : 'Le colis'}</h2><p>${n ? `${n} article${n > 1 ? 's' : ''} · calés dans la paille de bois` : 'Caisse en bois, paille, sachet chauffant en hiver'}</p></div>
      <div class="caisse-lignes">${mainBody}</div>
      ${foot || '<div></div>'}
      <button type="button" class="fermer" data-fermer aria-label="Fermer le colis">×</button>
    </div>`;
  }

  const SEAL = `<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M60 6c10 0 14 8 22 10s16-2 21 6-1 15 2 23 10 12 8 21-11 11-14 19 0 16-8 21-15-1-23 2-12 10-21 8-11-11-19-14-16 0-21-8 1-15-2-23S-1 71 1 62s11-11 14-19S15 27 23 22s15 1 23-2S50 6 60 6Z" fill="#8f2b22"/><circle cx="60" cy="60" r="36" fill="none" stroke="#5a1410" stroke-width="2"/><circle cx="60" cy="60" r="30" fill="none" stroke="#c4584a" stroke-width="1" stroke-dasharray="2 3"/><path d="M60 84V44" stroke="#f0c0b0" stroke-width="2.5"/><path d="M60 72c-14-3-18-16-12-26 9 5 13 15 12 26Z" fill="#f0c0b0"/><path d="M60 60c12-3 15-14 10-22-8 4-11 13-10 22Z" fill="#f0c0b0" opacity=".75"/></svg>`;
  let lastReport = '';

  function seal() {
    const cart = state.panier.slice();
    const ownedBefore = ownedCount();
    const cabinetsBefore = A.map((_, i) => cabinetComplete(i));
    const fresh = [];
    for (const l of cart) {
      if (l.format === 'fourniture') continue;
      if (!state.herbier[l.id]) fresh.push(byId[l.id]);
      state.herbier[l.id] = (state.herbier[l.id] || 0) + l.qte;
      state.pris[l.id] = (state.pris[l.id] || 0) + l.qte;
    }
    const gained = sapOf(cart);
    const sapBefore = state.seve;
    state.seve += gained;
    state.panier = [];
    save();

    const k = fresh.length;
    lastReport = k
      ? `${k === 1 ? 'Un nouveau spécimen rejoint' : `${k} nouveaux spécimens rejoignent`} votre herbier, avec ${Math.round(gained)} gouttes de sève. Départ ${nextShipping()}.`
      : `Vos tubes partent ${nextShipping()}. ${Math.round(gained)} gouttes de sève gagnées.`;
    checkoutMode = 'scelle';
    renderCheckout();
    renderAll();

    let delay = 600;
    const queueToast = (html) => { setTimeout(() => toast(html), delay); delay += 900; };
    A.forEach((a, i) => { if (!cabinetsBefore[i] && cabinetComplete(i)) queueToast(`Armoire ${a.numero} complétée : la plaque de laiton est à vous.`); });
    if (ownedBefore < DRAWER_THRESHOLD && ownedCount() >= DRAWER_THRESHOLD) queueToast('Le tiroir du collectionneur vient de se déverrouiller.');
    TIERS.forEach((pl) => { if (sapBefore < pl.seve && state.seve >= pl.seve) queueToast(`Palier de sève atteint : ${pl.texte.toLowerCase()}.`); });
  }

  checkoutEl.addEventListener('click', (e) => {
    if (e.target === checkoutEl || e.target.closest('[data-fermer]')) return checkoutEl.close();
    const less = e.target.closest('[data-moins]'), queueToast = e.target.closest('[data-plus]');
    if (less || queueToast) {
      const l = state.panier[+(less || queueToast).dataset[less ? 'moins' : 'plus']];
      if (!l) return;
      l.qte += queueToast ? 1 : -1;
      if (l.qte <= 0) state.panier.splice(state.panier.indexOf(l), 1);
      save(); updateCounter(); renderCheckout();
      return;
    }
    if (e.target.closest('[data-commander]')) { checkoutMode = 'commande'; renderCheckout(); $('#c-nom').focus(); return; }
    if (e.target.closest('[data-retour]')) { checkoutMode = 'liste'; renderCheckout(); return; }
    if (e.target.closest('[data-herbier]')) { checkoutEl.close(); openView('herbier'); }
  });
  checkoutEl.addEventListener('submit', (e) => {
    e.preventDefault();
    seal();
  });
  checkoutEl.addEventListener('close', () => {
    if (checkoutMode !== 'commande') checkoutMode = 'liste';
    if (window.archiveRoute) window.archiveRoute.clear('caisse');
  });

  function openCheckout() {
    if (checkoutMode === 'scelle') checkoutMode = 'liste';
    renderCheckout();
    checkoutEl.showModal();
    if (window.archiveRoute) window.archiveRoute.set('caisse', 'ouverte');
  }

  function closeCheckout() {
    checkoutEl.close();
  }

  // ---------- Drawers and quarantine ----------

  const drawerEl = $('#tiroir');
  let currentDrawer = null;

  function openDrawer(html, name) {
    drawerEl.innerHTML = `<div class="tiroir-corps">${html}<button type="button" class="fermer" data-fermer aria-label="Fermer">×</button></div>`;
    drawerEl.showModal();
    currentDrawer = name;
    if (window.archiveRoute) window.archiveRoute.set('tiroir', name);
  }

  function closeDrawer() {
    drawerEl.close();
    currentDrawer = null;
    if (window.archiveRoute) window.archiveRoute.clear('tiroir');
  }

  function suppliesDrawer() {
    openDrawer(`<h2 id="tiroir-titre">Fournitures</h2><p>Tout ce qu'il faut pour sortir une bouture de son tube et l'installer.</p>
      <div class="fournitures">${F.map((x) => `<div class="fourniture"><span><b>${x.nom}</b><small>${x.detail}</small></span><span class="prix">${euros(x.prix)}</span><button type="button" class="btn" data-fourniture="${x.id}">Ajouter</button></div>`).join('')}</div>`, 'fournitures');
  }

  const PADLOCK = `<svg viewBox="0 0 70 80" aria-hidden="true"><path d="M18 34V24a17 17 0 0 1 34 0v10" fill="none" stroke="currentColor" stroke-width="6"/><rect x="8" y="34" width="54" height="42" rx="5" fill="currentColor"/><circle cx="35" cy="52" r="6" fill="#1a120a"/><path d="M35 56v10" stroke="#1a120a" stroke-width="4"/></svg>`;

  function collectionDrawer() {
    const n = ownedCount();
    if (!drawerOpen()) {
      openDrawer(`<h2 id="tiroir-titre">Tiroir du collectionneur</h2><p>Deux spécimens qu'on ne montre pas sur les étagères. Le tiroir s'ouvre quand votre herbier compte ${DRAWER_THRESHOLD} spécimens différents.</p>
        <div class="cadenas">${PADLOCK}<div class="cadenas-barre"><i style="width:${(n / DRAWER_THRESHOLD) * 100}%"></i></div><p>${n} sur ${DRAWER_THRESHOLD} spécimens dans votre herbier</p></div>`, 'collection');
      return;
    }
    openDrawer(`<h2 id="tiroir-titre">Tiroir du collectionneur</h2><p>Réservé aux herbiers de ${DRAWER_THRESHOLD} spécimens et plus. Un seul exemplaire de chaque, rarement réassorti.</p>
      <div class="secrets">${SECRET_SPECIMENS.map((p) => `<button type="button" class="secret" data-ouvrir="${p.id}"><span class="mini">${Drawing.tube(p, { sansEtiquette: true })}</span><span><b>${nameHtml(p)}</b><span>${R[p.rarete].nom} · ${euros(p.prix)} · ${stockText(p)}</span></span></button>`).join('')}</div>`, 'collection');
  }

  let timer = null;
  function quarantineDrawer() {
    openDrawer(`<h2 id="tiroir-titre">En quarantaine</h2><p>Trois espèces arrivées cette semaine. Elles restent isolées deux semaines, le temps de vérifier qu'elles ne portent ni thrips ni cochenilles. Elles entrent dans les armoires le samedi 14 novembre à 18 h.</p>
      <div class="decompte" id="decompte"></div>
      <form class="rappel" id="form-rappel"><label class="etiquette-champ" for="rappel-mail" hidden>E-mail</label><input id="rappel-mail" type="email" placeholder="votre@adresse.fr" autocomplete="email" required><button type="submit" class="btn">Me prévenir</button></form>`, 'quarantaine');
    const refresh = () => {
      const el = $('#decompte');
      if (!el) return clearInterval(timer);
      let ms = Math.max(0, QUARANTINE_END - new Date());
      const j = Math.floor(ms / 864e5); ms -= j * 864e5;
      const h = Math.floor(ms / 36e5); ms -= h * 36e5;
      const m = Math.floor(ms / 6e4);
      el.innerHTML = [[j, 'jours'], [h, 'heures'], [m, 'minutes']].map(([v, l]) => `<div><b>${String(v).padStart(2, '0')}</b><span>${l}</span></div>`).join('');
    };
    clearInterval(timer);
    refresh();
    timer = setInterval(refresh, 30000);
  }

  drawerEl.addEventListener('click', (e) => {
    if (e.target === drawerEl || e.target.closest('[data-fermer]')) return closeDrawer();
    const f = e.target.closest('[data-fourniture]');
    if (f) return addToCart(f.dataset.fourniture, 'fourniture');
    const o = e.target.closest('[data-ouvrir]');
    if (o) { closeDrawer(); openSheet(o.dataset.ouvrir); }
  });
  drawerEl.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!state.rappels.includes('quarantaine')) state.rappels.push('quarantaine');
    save();
    toast('Rappel noté pour le 14 novembre.');
    closeDrawer();
  });
  drawerEl.addEventListener('close', () => {
    clearInterval(timer);
    if (window.archiveRoute && currentDrawer) window.archiveRoute.clear('tiroir');
    currentDrawer = null;
  });

  // ---------- Registry ----------

  let sortBy = { cle: 'n', sens: 1 };
  function renderRegistry() {
    const lines = S.slice().sort((a, b) => (a[sortBy.cle] - b[sortBy.cle]) * sortBy.sens || a.n - b.n);
    let h = '', lastOne = null;
    for (const p of lines) {
      if (sortBy.cle === 'n' && p.armoire !== lastOne) {
        lastOne = p.armoire;
        h += `<tr class="armoire-sep"><td colspan="7">Armoire ${A[p.armoire].numero} · ${A[p.armoire].nom}</td></tr>`;
      }
      const n = stock(p);
      h += `<tr class="${isMatch(p) ? '' : 'estompe'}">
        <td class="num">${String(p.n).padStart(2, '0')}</td>
        <td><button type="button" class="lien-spec" data-ouvrir="${p.id}">${nameHtml(p)}</button>${p.eclat ? ' <span class="marque-eclat">éclat</span>' : ''}</td>
        <td class="col-fr">${p.fr}</td>
        <td class="col-famille">${p.famille}</td>
        <td>${rarityHtml(p)}</td>
        <td class="col-stock${n ? '' : ' zero'}">${n ? n : 'épuisé'}</td>
        <td class="col-prix">${euros(p.prix)}</td>
      </tr>`;
    }
    $('#registre-corps').innerHTML = h;
    $$('#registre-table th button').forEach((b) => {
      if (b.dataset.tri === sortBy.cle) b.dataset.actif = sortBy.sens > 0 ? 'asc' : 'desc';
      else delete b.dataset.actif;
    });
  }
  $('#registre-table thead').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tri]');
    if (!b) return;
    sortBy = b.dataset.tri === sortBy.cle ? { cle: sortBy.cle, sens: -sortBy.sens } : { cle: b.dataset.tri, sens: b.dataset.tri === 'n' ? 1 : -1 };
    renderRegistry();
  });

  // ---------- Herbarium ----------

  const cabinetComplete = (i) => S.filter((p) => p.armoire === i).every((p) => state.herbier[p.id] > 0);

  // "Monstera deliciosa" becomes "M. deliciosa", as on herbarium plates
  function abbreviate(latin) {
    const words = latin.split(' ');
    return words.length > 1 ? `${words[0][0]}. ${words.slice(1).join(' ')}` : latin;
  }

  function cellHtml(p, isHidden) {
    if (isHidden) {
      return `<div class="case cachee" aria-label="Spécimen secret"><span class="case-num">··</span>${Drawing.pressee({ id: p.id, dessin: { forme: 'ovale', w: .5 } }, false)}<span class="case-nom">? ? ?</span></div>`;
    }
    const n = state.herbier[p.id] || 0;
    return `<button type="button" class="case${n ? ' possede' : ''}${p.eclat ? ' eclat' : ''}" data-ouvrir="${p.id}" aria-label="${escapeHtml(nameText(p))}, ${n ? 'dans votre herbier' : 'manquant'}">
      <span class="case-num">${String(p.n).padStart(2, '0')}</span>${n > 1 ? `<span class="case-compte">×${n}</span>` : ''}
      ${Drawing.pressee(p, n > 0)}
      <span class="case-nom">${escapeHtml(abbreviate(p.latin))}${p.cultivar ? ` ‘${escapeHtml(p.cultivar)}’` : ''}</span>
    </button>`;
  }

  function renderHerbarium() {
    const total = S.length;
    const n = ownedCount();
    const sparkles = ownedList().filter((p) => p.eclat).length;
    const max = TIERS[TIERS.length - 1].seve;
    const next = TIERS.find((pl) => state.seve < pl.seve);
    $('#herbier-bilan').innerHTML = `
      <div class="bilan-compte"><b>${n}<small style="font-size:.45em;color:var(--texte-doux)"> / ${total}</small></b><span>spécimens · ${sparkles} éclat${sparkles > 1 ? 's' : ''}</span></div>
      <div class="seve-jauge">
        <div class="seve-titre"><span>Carnet de sève : <b>${Math.round(state.seve)} gouttes</b></span><span>${next ? `encore ${Math.ceil(next.seve - state.seve)} avant le prochain palier` : 'tous les paliers sont atteints'}</span></div>
        <div class="seve-tube" role="img" aria-label="${Math.round(state.seve)} gouttes sur ${max}"><i style="width:calc(${Math.min(1, state.seve / max) * 100}% - 4px)"></i></div>
        <div class="paliers">${TIERS.map((pl) => `<div class="palier${state.seve >= pl.seve ? ' atteint' : ''}"><b>${pl.seve} gouttes</b>${pl.texte}</div>`).join('')}</div>
      </div>`;
    let h = A.map((a, i) => {
      const specs = S.filter((p) => p.armoire === i);
      const pressedCount = specs.filter((p) => state.herbier[p.id] > 0).length;
      return `<section class="planche${pressedCount === specs.length ? ' complete' : ''}" aria-label="Planche de l'armoire ${a.numero}">
        <header class="planche-tete"><h3>${a.numero} · ${a.nom}</h3><span>${pressedCount} / ${specs.length}</span></header>
        <div class="cases">${specs.map((p) => cellHtml(p)).join('')}</div>
      </section>`;
    }).join('');
    const isOpen = drawerOpen();
    h += `<section class="planche planche-secret" aria-label="Planche du tiroir du collectionneur">
      <header class="planche-tete"><h3>Tiroir du collectionneur</h3><span>${isOpen ? `${SECRET_SPECIMENS.filter((p) => state.herbier[p.id]).length} / ${SECRET_SPECIMENS.length}` : `s'ouvre à ${DRAWER_THRESHOLD} spécimens`}</span></header>
      <div class="cases">${SECRET_SPECIMENS.map((p) => cellHtml(p, !isOpen)).join('')}</div>
    </section>`;
    $('#planches').innerHTML = h;
    $('#invite-herbier').textContent = `${n} spécimen${n > 1 ? 's' : ''} sur ${total} · ${Math.round(state.seve)} gouttes de sève`;
  }

  // ---------- Herbarium and registry: opened separately, full screen (ticket #30) ----------

  function openView(name) {
    const v = $(`#vue-${name}`);
    if (!v) return;
    if (!v.open) v.showModal();
    v.scrollTop = 0;
    if (window.archiveRoute) window.archiveRoute.set('vue', name);
  }

  function closeView(name) {
    const v = $(`#vue-${name}`);
    if (v) v.close();
  }

  $$('dialog.vue').forEach((v) => {
    v.addEventListener('click', (e) => {
      if (e.target === v || e.target.closest('[data-fermer]')) v.close();
    });
    v.addEventListener('close', () => {
      if (window.archiveRoute) window.archiveRoute.clear('vue');
    });
  });
  document.addEventListener('click', (e) => {
    const l = e.target.closest('[data-vue], a[href="#herbier"], a[href="#registre"]');
    if (!l) return;
    e.preventDefault();
    openView(l.dataset.vue || l.getAttribute('href').slice(1));
  });

  // ---------- Opening statistics ----------

  function renderFigures() {
    const tubes = S.reduce((t, p) => t + stock(p), 0);
    const sparkles = S.filter((p) => p.eclat).length;
    $('#chiffres').innerHTML = [
      [S.length, 'espèces'],
      [tubes, 'tubes en stock'],
      [sparkles, 'éclats'],
      [nextShipping(), 'prochain envoi']
    ].map(([v, l]) => `<div><dt>${l}</dt><dd>${v}</dd></div>`).join('');
  }

  // ---------- Search ----------

  const field = $('#recherche'), results = $('#recherche-res');
  function search() {
    const q = stripAccents(field.value.trim());
    if (q.length < 2) { results.hidden = true; return; }
    const base = drawerOpen() ? ALL_SPECIMENS : S;
    const found = base.filter((p) => stripAccents(`${p.latin} ${p.cultivar || ''} ${p.fr} ${p.famille}`).includes(q)).slice(0, 7);
    results.innerHTML = found.length
      ? found.map((p) => `<li><button type="button" data-cherche="${p.id}"><span class="l">${nameHtml(p)}</span><span class="s">${number(p)} · ${p.fr} · ${placeText(p)}</span></button></li>`).join('')
      : `<li><span class="s" style="display:block;padding:6px 8px">Aucun spécimen à ce nom.</span></li>`;
    results.hidden = false;
  }
  function pickSearchResult(id) {
    const p = byId[id];
    results.hidden = true;
    field.value = '';
    if (p.secret) return openSheet(id);
    switchCabinet(p.armoire).then(() => openSheet(id));
  }
  field.addEventListener('input', search);
  field.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { results.hidden = true; return; }
    if (e.key === 'Enter') {
      e.preventDefault();
      const b = $('[data-cherche]', results);
      if (b) pickSearchResult(b.dataset.cherche);
    }
    if (e.key === 'ArrowDown') { const b = $('[data-cherche]', results); if (b) { e.preventDefault(); b.focus(); } }
  });
  results.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cherche]');
    if (b) pickSearchResult(b.dataset.cherche);
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('.recherche')) results.hidden = true; });

  // ---------- Global events ----------

  $('#choix-armoires').addEventListener('click', (e) => {
    const b = e.target.closest('[data-armoire]');
    if (b) switchCabinet(+b.dataset.armoire);
  });
  $('#choix-armoires').addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const step = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1;
    const i = (state.armoire + step + A.length) % A.length;
    switchCabinet(i).then(() => $(`[data-armoire="${i}"]`).focus());
  });

  $('#filtres').addEventListener('click', (e) => {
    const b = e.target.closest('[data-filtre]');
    if (!b) return;
    setFilter(b.dataset.filtre);
  });

  contentEl.addEventListener('click', (e) => {
    const t = e.target.closest('[data-id]');
    if (t) {
      if (!wideScreen.matches || onTable === t.dataset.id) return openSheet(t.dataset.id);
      return showLabel(byId[t.dataset.id]);
    }
    if (e.target.closest('[data-quarantaine]')) quarantineDrawer();
  });
  // Table active: hovering another tube changes the card without moving the cabinet
  const hovered = (e) => {
    const t = e.target.closest('[data-id]');
    if (t && onTable && onTable !== t.dataset.id) showLabel(byId[t.dataset.id]);
  };
  contentEl.addEventListener('pointerover', hovered);
  contentEl.addEventListener('focusin', hovered);

  // Cabinet navigation: console arrows, keyboard arrows, touch swipe, horizontal wheel
  const neighbour = (step) => switchCabinet((state.armoire + step + A.length) % A.length, { sens: step });
  $$('.fleche[data-pas]').forEach((b) => b.addEventListener('click', () => neighbour(+b.dataset.pas)));
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    if (document.querySelector('dialog[open]') || e.target.closest('input, textarea, [role="tablist"]')) return;
    const r = cabinetEl.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    e.preventDefault();
    neighbour(e.key === 'ArrowRight' ? 1 : -1);
  });
  let startAt = null;
  cabinetEl.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') startAt = { x: e.clientX, y: e.clientY }; });
  cabinetEl.addEventListener('pointerup', (e) => {
    if (!startAt) return;
    const dx = e.clientX - startAt.x, dy = e.clientY - startAt.y;
    startAt = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) neighbour(dx < 0 ? 1 : -1);
  });
  let wheel = 0, rest = 0;
  sceneEl.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    if (Date.now() < rest) return;
    wheel += e.deltaX;
    if (Math.abs(wheel) > 80) { neighbour(wheel > 0 ? 1 : -1); wheel = 0; rest = Date.now() + 700; }
  }, { passive: false });

  document.addEventListener('click', (e) => {
    const o = e.target.closest('[data-ouvrir]');
    if (o && !o.closest('dialog:not(.vue)')) openSheet(o.dataset.ouvrir);
  });

  $('#tiroir-g').addEventListener('click', suppliesDrawer);
  $('#tiroir-d').addEventListener('click', collectionDrawer);
  $('#btn-caisse').addEventListener('click', openCheckout);

  $('#btn-neons').addEventListener('click', () => {
    state.neons = !state.neons;
    save();
    applyNeons();
    if (!state.neons) toast('Dans le noir, seuls les éclats brillent.');
  });
  function applyNeons() {
    $('#btn-neons').setAttribute('aria-pressed', String(state.neons));
    cabinetEl.classList.toggle('nuit', !state.neons);
  }

  function renderAll() {
    renderChoice();
    renderIntro();
    renderCabinet();
    renderRegistry();
    renderHerbarium();
    renderFigures();
    showLabel(null);
    updateCounter();
  }

  // ---------- Public API for routing ----------

  window.archiveSwitchCabinet = switchCabinet;
  window.archiveSetFilter = setFilter;
  window.archiveOpenSheet = openSheet;
  window.archiveCloseSheet = closeSheet;
  window.archiveOpenView = openView;
  window.archiveCloseView = closeView;
  window.archiveOpenDrawer = (name) => {
    if (name === 'fournitures') suppliesDrawer();
    else if (name === 'collection') collectionDrawer();
    else if (name === 'quarantaine') quarantineDrawer();
  };
  window.archiveCloseDrawer = closeDrawer;
  window.archiveOpenCheckout = openCheckout;
  window.archiveCloseCheckout = closeCheckout;

  // ---------- Start ----------

  imgEl.src = A[state.armoire].image;
  applyNeon();
  renderFilters();
  renderIntro();
  applyNeons();
  renderAll();
  // Neons light up once the image is loaded
  const lightUp = () => {
    cabinetEl.classList.add('allumage');
    setTimeout(() => cabinetEl.classList.remove('allumage'), 1150);
  };
  if (imgEl.complete) lightUp(); else imgEl.addEventListener('load', lightUp, { once: true });

  // Preload other cabinet images
  window.addEventListener('load', () => A.forEach((a) => { const i = new Image(); i.src = a.image; }));
})();
