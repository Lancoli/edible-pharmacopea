// Archive Botanique : armoires, fiches, caisse et herbier.
(function () {
  'use strict';

  const A = window.ARMOIRES, S = window.SPECIMENS, SECRETS = window.TIROIR_SECRET, F = window.FOURNITURES, R = window.RARETES;
  const TOUS = S.concat(SECRETS);
  const parId = Object.fromEntries(TOUS.map((p) => [p.id, p]));
  const fournitureParId = Object.fromEntries(F.map((x) => [x.id, x]));
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  // Position des étagères dans l'image de l'armoire (en % de la hauteur)
  const ETAGERES = { 1: 27.7, 2: 44.1, 3: 59.4 };
  const COLONNES = [32, 50, 68];
  const CLOCHE = { x: 50, base: 75.2 };
  const VITRE_BAS = 87.6;
  const SEUIL_TIROIR = 5;
  const FRANCO = 75, PORT = 7.9;
  const SORTIE_QUARANTAINE = new Date(2026, 10, 14, 18, 0);
  const PALIERS = [
    { seve: 100, texte: 'Un tube surprise glissé dans votre prochain colis' },
    { seve: 250, texte: 'Les arrivages 24 heures avant tout le monde' },
    { seve: 500, texte: 'Un spécimen d\'archive réservé à votre nom' }
  ];
  const ROMAINS = ['I', 'II', 'III'];

  // ---------- État, gardé dans ce navigateur ----------

  const CLE = 'archive-botanique-v1';
  const etat = { armoire: 0, neons: true, filtre: 'tout', panier: [], herbier: {}, pris: {}, seve: 0, rappels: [] };
  try {
    const lu = JSON.parse(localStorage.getItem(CLE) || 'null');
    if (lu && typeof lu === 'object') Object.assign(etat, lu);
  } catch (e) { /* stockage indisponible : on repart de zéro */ }
  if (!(etat.armoire >= 0 && etat.armoire < A.length)) etat.armoire = 0;
  etat.panier = (etat.panier || []).filter((l) => parId[l.id] || fournitureParId[l.id]);

  function sauver() {
    try {
      const { armoire, neons, panier, herbier, pris, seve, rappels } = etat;
      localStorage.setItem(CLE, JSON.stringify({ armoire, neons, panier, herbier, pris, seve, rappels }));
    } catch (e) { /* tant pis */ }
  }

  // ---------- Petits outils ----------

  const fmt = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
  const fmtRond = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  const euros = (n) => (Number.isInteger(n) ? fmtRond : fmt).format(n);
  const echap = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const sansAccents = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const numero = (p) => 'N° ' + String(p.n).padStart(2, '0');

  const stock = (p) => Math.max(0, p.stock - (etat.pris[p.id] || 0));
  const dansPanier = (id) => etat.panier.filter((l) => l.id === id).reduce((t, l) => t + l.qte, 0);
  const possedes = () => TOUS.filter((p) => etat.herbier[p.id] > 0);
  const nbPossedes = () => S.filter((p) => etat.herbier[p.id] > 0).length;
  const tiroirOuvert = () => nbPossedes() >= SEUIL_TIROIR;

  function nomHtml(p) {
    return `<i>${echap(p.latin)}</i>${p.cultivar ? ` <span class="fiche-cultivar">‘${echap(p.cultivar)}’</span>` : ''}`;
  }
  const nomTexte = (p) => p.latin + (p.cultivar ? ` ‘${p.cultivar}’` : '');

  function rareteHtml(p) {
    let pips = '';
    for (let i = 1; i <= 5; i++) pips += `<i class="${i <= p.rarete ? 'on' : ''}"></i>`;
    return `<span class="rarete r${p.rarete}"><span class="pips" aria-hidden="true">${pips}</span><span class="rarete-nom">${R[p.rarete].nom}</span></span>`;
  }

  function stockTexte(p) {
    const n = stock(p);
    if (!n) return 'Épuisé';
    if (n === 1) return 'Dernier tube';
    if (n <= 3) return `Plus que ${n} tubes`;
    return `${n} tubes en stock`;
  }

  function placeTexte(p) {
    if (p.secret) return 'Tiroir du collectionneur';
    const a = A[p.armoire];
    if (p.place[0] === 'cloche') return `Armoire ${a.numero} · sous cloche`;
    return `Armoire ${a.numero} · étagère ${ROMAINS[p.place[0] - 1]}`;
  }

  function prochainEnvoi() {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    do d.setDate(d.getDate() + 1); while (d.getDay() !== 1 && d.getDay() !== 2);
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  }
  const hiver = () => [10, 11, 0, 1, 2].includes(new Date().getMonth());

  function correspond(p) {
    switch (etat.filtre) {
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

  // ---------- Ornements posés sur les étagères ----------

  const ORNEMENTS = {
    livres: `<svg viewBox="0 0 90 64"><rect x="4" y="46" width="82" height="16" rx="1" fill="#5a1e1a"/><rect x="80" y="47" width="5" height="14" fill="#e6dcc0"/><path d="M14 46v16M70 46v16" stroke="#c9a35b" stroke-width="1.2"/><rect x="10" y="32" width="70" height="14" rx="1" fill="#24402c"/><rect x="74" y="33" width="5" height="12" fill="#e6dcc0"/><path d="M18 32v14M62 32v14" stroke="#c9a35b" stroke-width="1"/><rect x="6" y="20" width="74" height="12" rx="1" fill="#6a4a1e"/><rect x="74" y="21" width="5" height="10" fill="#efe4c8"/><text x="40" y="29" text-anchor="middle" font-family="IM Fell English SC, Georgia, serif" font-size="6.5" fill="#e8cf8f">FLORA</text><rect x="14" y="2" width="9" height="18" fill="#3a2a4a"/><path d="M14 6h9M14 16h9" stroke="#c9a35b" stroke-width=".8"/></svg>`,
    loupe: `<svg viewBox="0 0 80 50"><path d="M36 36L76 44" stroke="#3a2412" stroke-width="7" stroke-linecap="round"/><path d="M36 36L76 44" stroke="#7a5030" stroke-width="3" stroke-linecap="round"/><ellipse cx="22" cy="34" rx="18" ry="11" fill="rgba(200,230,255,.14)" stroke="#c9a35b" stroke-width="3.2"/><ellipse cx="17" cy="31" rx="7" ry="3" fill="#fff" opacity=".25"/><circle cx="38" cy="37" r="2.4" fill="#e8cf8f"/></svg>`,
    bocal: `<svg viewBox="0 0 44 66"><rect x="10" y="2" width="24" height="10" rx="2" fill="#a47a4a"/><path d="M8 14h28v42a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6Z" fill="rgba(210,235,225,.12)" stroke="rgba(230,250,240,.45)" stroke-width="1.2"/><path d="M9 40h26v16a5 5 0 0 1-5 5H14a5 5 0 0 1-5-5Z" fill="#6a4a24"/><g fill="#d8b878"><circle cx="14" cy="45" r="1.4"/><circle cx="20" cy="43" r="1.2"/><circle cx="27" cy="46" r="1.5"/><circle cx="31" cy="42" r="1.1"/><circle cx="17" cy="52" r="1.3"/><circle cx="24" cy="54" r="1.4"/></g><rect x="12" y="22" width="20" height="10" fill="#e8dcc0"/><text x="22" y="29.5" text-anchor="middle" font-family="Special Elite, monospace" font-size="5" fill="#3a2a1a">Semina</text><rect x="11" y="16" width="2" height="36" rx="1" fill="#fff" opacity=".25"/></svg>`
  };

  function ornement(nom, x, base, largeur) {
    return `<div class="ornement" style="left:${x}%;bottom:${100 - base}%;width:${largeur}%">${ORNEMENTS[nom]}</div>`;
  }

  function paillettes(p) {
    const pos = [[10, 18, 0], [82, 36, 1.1], [18, 62, 2.2], [76, 8, .6]];
    return `<span class="paillettes" aria-hidden="true">${pos.map(([x, y, d]) => `<i style="left:${x}%;top:${y}%;animation-delay:${d + (p.n % 3) * .4}s"></i>`).join('')}</span>`;
  }

  function ariaSpec(p) {
    return `${nomTexte(p)}, ${R[p.rarete].nom}${p.eclat ? ', éclat' : ''}, ${euros(p.prix)}, ${stockTexte(p)}`;
  }

  // ---------- L'armoire ----------

  const armoireEl = $('#armoire'), imgEl = $('#armoire-img'), contenuEl = $('#contenu');

  function rendreArmoire() {
    const specs = S.filter((p) => p.armoire === etat.armoire);
    let h = '';
    for (const e of [1, 2, 3]) {
      h += `<div class="ratelier" style="bottom:${100 - ETAGERES[e]}%"><span class="socle"></span><span class="pied g"></span><span class="pied d"></span><span class="rail"></span></div>`;
    }
    h += ornement('livres', 83.5, ETAGERES[1], 10);
    h += ornement('loupe', 16.5, ETAGERES[2], 9);
    h += ornement('bocal', 83, ETAGERES[3], 5.6);

    for (const p of specs) {
      const classes = `${p.eclat ? ' eclat' : ''}${stock(p) ? '' : ' epuise'}${correspond(p) ? '' : ' estompe'}`;
      if (p.place[0] === 'cloche') {
        h += `<div class="faisceau" style="top:62.4%;height:${CLOCHE.base - 62.4 - 6}%"></div>`;
        h += `<button type="button" class="cloche-btn${classes}" data-id="${p.id}" style="left:${CLOCHE.x}%;bottom:${100 - CLOCHE.base}%" aria-label="Sous cloche : ${echap(ariaSpec(p))}">${Dessin.cloche(p)}</button>`;
        h += `<span class="cartel" style="left:50%;top:76.9%">Spécimen d'archive</span>`;
      } else {
        const [e, c] = p.place;
        h += `<button type="button" class="tube r${p.rarete}${classes}" data-id="${p.id}" style="left:${COLONNES[c]}%;bottom:${100 - ETAGERES[e]}%" aria-label="${echap(ariaSpec(p))}"><span class="halo"></span>${Dessin.tube(p)}${p.eclat ? paillettes(p) : ''}${stock(p) ? '' : '<span class="badge-epuise">Épuisé</span>'}</button>`;
        // pas d'étiquette de prix dans l'armoire pour l'instant (ticket #27) : le prix est dans la fiche
      }
    }

    // la quarantaine, couchée sur la vitre du bas
    h += `<span class="carton" style="left:13.5%;top:81.6%">Quarantaine<br>sortie le 14 nov.</span>`;
    [35, 50, 65].forEach((x, i) => {
      const q = { id: `quarantaine-${etat.armoire}-${i}`, n: 0, rarete: 1, dessin: {} };
      h += `<button type="button" class="couche" data-quarantaine="1" style="left:${x}%;bottom:${100 - VITRE_BAS}%" aria-label="Tube en quarantaine, espèce révélée le 14 novembre">${Dessin.tube(q, { mystere: true, couche: true, sansEtiquette: true })}</button>`;
    });

    contenuEl.innerHTML = h;
    $('#tiroir-d-label').textContent = tiroirOuvert() ? 'Tiroir du collectionneur' : `Tiroir verrouillé · ${Math.min(nbPossedes(), SEUIL_TIROIR)}/${SEUIL_TIROIR}`;
  }

  function appliquerNeon() {
    document.documentElement.style.setProperty('--neon', A[etat.armoire].neon);
  }

  // d'une armoire à l'autre : l'armoire glisse sur le côté, la suivante arrive de l'autre (ticket #30)
  const calme = matchMedia('(prefers-reduced-motion: reduce)');
  let changement = 0;
  function changerArmoire(i, { instant = false, sens = 0 } = {}) {
    if (i === etat.armoire && !instant) return Promise.resolve();
    if (!sens) sens = i > etat.armoire ? 1 : -1;
    etat.armoire = i;
    sauver();
    rendreChoix();
    rendreIntro();
    montrerEtiquette(null);
    const jeton = ++changement;
    const a = A[i];
    return new Promise((fin) => {
      const pret = () => {
        if (jeton !== changement) return fin();
        imgEl.src = a.image;
        appliquerNeon();
        rendreArmoire();
        if (!instant && !calme.matches && armoireEl.animate) {
          armoireEl.getAnimations().forEach((x) => x.cancel());
          armoireEl.animate([{ transform: `translateX(${sens * 18}%)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.2, .8, .2, 1)' });
        }
        armoireEl.classList.remove('extinction');
        armoireEl.classList.remove('allumage');
        void armoireEl.offsetWidth;
        armoireEl.classList.add('allumage');
        setTimeout(() => armoireEl.classList.remove('allumage'), 1150);
        fin();
      };
      if (instant) return pret();
      armoireEl.classList.add('extinction');
      if (!calme.matches && armoireEl.animate) {
        armoireEl.animate([{ transform: 'none', opacity: 1 }, { transform: `translateX(${-sens * 18}%)`, opacity: 0 }], { duration: 230, easing: 'ease-in', fill: 'forwards' });
      }
      const pre = new Image();
      let charge = false, attendu = false;
      const essai = () => { if (charge && attendu) pret(); };
      pre.onload = pre.onerror = () => { charge = true; essai(); };
      pre.src = a.image;
      setTimeout(() => { attendu = true; essai(); }, 230);
    });
  }

  // ---------- Console : onglets d'armoires ----------

  function rendreChoix() {
    $('#choix-armoires').innerHTML = A.map((a, i) => {
      const specs = S.filter((p) => p.armoire === i);
      const faits = specs.filter((p) => etat.herbier[p.id] > 0).length;
      return `<button type="button" class="choix" role="tab" aria-selected="${i === etat.armoire}" data-armoire="${i}" style="--c:${a.neon}" title="${faits} sur ${specs.length} dans votre herbier">
        <span class="choix-num">${a.numero}</span>
        <span class="choix-nom">${a.nom}</span>
        <span class="choix-compte">${faits} / ${specs.length} à l'herbier</span>
        <span class="choix-barre"><i style="width:${(faits / specs.length) * 100}%"></i></span>
      </button>`;
    }).join('');
  }

  function rendreIntro() {
    const a = A[etat.armoire];
    const specs = S.filter((x) => x.armoire === etat.armoire);
    const tubes = specs.reduce((t, x) => t + stock(x), 0);
    const eclats = specs.filter((x) => x.eclat).length;
    $('#armoire-intro').innerHTML = `<div class="intro-in">
      <h2 class="intro-titre"><span>Armoire ${a.numero}</span> ${a.nom}</h2>
      <p class="intro-texte">${a.texte}</p>
      <p class="intro-chiffres">${specs.length} spécimens · ${tubes} tubes · ${eclats} éclat${eclats > 1 ? 's' : ''}</p>
    </div>`;
  }

  const FILTRES = [['tout', 'Tout'], ['dispo', 'Disponibles'], ['eclat', 'Éclats'], ['petit', 'Moins de 20 €'], ['rare', 'Rares et plus']];
  function rendreFiltres() {
    $('#filtres').innerHTML = FILTRES.map(([k, l]) => `<button type="button" class="puce" data-filtre="${k}" aria-pressed="${etat.filtre === k}">${l}</button>`).join('');
  }

  // ---------- La table : le tube cliqué y est posé, avec sa carte sur papier feuille (ticket #27) ----------
  // Sur grand écran, un clic sur un tube le pose sur la table : l'armoire glisse à gauche pour lui faire place.
  // Tant que la table est servie, survoler un autre tube change la carte. Un second clic ouvre la fiche complète.
  // Sur téléphone, pas de table : le clic ouvre la fiche, comme avant.

  const sceneEl = $('.scene'), tableEl = $('#table');
  const grandEcran = matchMedia('(min-width: 1000px) and (hover: hover)');
  let surTable = null;

  function montrerEtiquette(p) {
    $$('.tube.choisi, .cloche-btn.choisi', contenuEl).forEach((t) => t.classList.remove('choisi'));
    if (!p) {
      surTable = null;
      sceneEl.classList.remove('avec-table');
      tableEl.inert = true;
      return;
    }
    surTable = p.id;
    const t = contenuEl.querySelector(`[data-id="${p.id}"]`);
    if (t) t.classList.add('choisi');
    const n = stock(p);
    $('#table-tube').innerHTML = p.place[0] === 'cloche' ? Dessin.cloche(p) : Dessin.tube(p);
    $('#table-tube').classList.toggle('est-cloche', p.place[0] === 'cloche');
    $('#carte').innerHTML = `<p class="etq-num">${numero(p)} · ${placeTexte(p)}</p>
      <p class="etq-latin">${nomHtml(p)}</p>
      <p class="etq-fr">${p.fr}</p>
      <div class="etq-ligne">${rareteHtml(p)}${p.eclat ? '<span class="marque-eclat">éclat</span>' : ''}</div>
      <p class="etq-texte">${p.texte}</p>
      <p class="etq-origine"><b>Origine</b> · ${p.origine}</p>
      <div class="etq-ligne"><span class="etq-stock${n && n <= 2 ? ' bas' : ''}">${stockTexte(p)}</span><span class="etq-stock">${p.famille}</span></div>
      <button type="button" class="btn etq-ouvrir" data-fiche="${p.id}">Ouvrir la fiche</button>`;
    tableEl.classList.toggle('eclat', !!p.eclat);
    sceneEl.classList.add('avec-table');
    tableEl.inert = false;
  }

  tableEl.addEventListener('click', (e) => {
    if (e.target.closest('[data-ranger]')) return montrerEtiquette(null);
    const f = e.target.closest('[data-fiche]');
    if (f) ouvrirFiche(f.dataset.fiche);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && surTable && !document.querySelector('dialog[open]')) montrerEtiquette(null);
  });

  // ---------- Fiche ----------

  const ficheEl = $('#fiche');
  let ficheCourante = null;

  function voisins(p) {
    const liste = p.secret ? SECRETS : S.filter((x) => x.armoire === p.armoire);
    const i = liste.indexOf(p);
    return [liste[(i - 1 + liste.length) % liste.length], liste[(i + 1) % liste.length]];
  }

  function ouvrirFiche(id) {
    const p = parId[id];
    if (!p) return;
    ficheCourante = p;
    const neon = p.secret ? '#ead08f' : A[p.armoire].neon;
    const n = stock(p);
    const dejaPris = dansPanier(p.id);
    const possede = etat.herbier[p.id] || 0;
    const soins = ['Lumière', 'Humidité', 'Arrosage', 'Croissance'].map((nom, i) => {
      let pts = '';
      for (let k = 1; k <= 5; k++) pts += `<i class="${k <= p.soins[i] ? 'on' : ''}"></i>`;
      return `<div><dt>${nom}</dt><dd aria-label="${p.soins[i]} sur 5">${pts}</dd></div>`;
    }).join('');
    const formats = [`<label class="format"><input type="radio" name="format" id="format-bouture" value="bouture" checked><span>Bouture en tube<small>Un nœud, une ou deux feuilles, sur sphaigne</small></span><b>${euros(p.prix)}</b></label>`];
    if (p.racinee) formats.push(`<label class="format"><input type="radio" name="format" id="format-racinee" value="racinee"><span>Bouture racinée<small>Racines de 3 à 5 cm, prête à empoter</small></span><b>${euros(p.racinee)}</b></label>`);
    const vis = p.place && p.place[0] === 'cloche'
      ? `<div class="grande-cloche">${Dessin.cloche(p)}</div>`
      : `<div class="grand-tube">${Dessin.tube(p)}</div>`;

    ficheEl.innerHTML = `<div class="fiche-corps" style="--neon:${neon}">
      <button type="button" class="fermer" data-fermer aria-label="Fermer la fiche">×</button>
      <div class="visionneuse">
        <button type="button" class="nav-fiche prec" data-voisin="-1" aria-label="Spécimen précédent">‹</button>
        ${vis}
        <button type="button" class="nav-fiche suiv" data-voisin="1" aria-label="Spécimen suivant">›</button>
        <p class="visionneuse-legende">${placeTexte(p)}</p>
      </div>
      <div class="feuille-fiche${p.eclat ? ' eclat' : ''}">
        <p class="fiche-ref">Fiche ${numero(p)} · ${p.famille}</p>
        <span class="tampon r${p.rarete}" aria-hidden="true">${R[p.rarete].nom}</span>
        <h2 class="fiche-latin" id="fiche-titre">${nomHtml(p)}</h2>
        <p class="fiche-fr">${p.fr}</p>
        <div class="fiche-meta">${rareteHtml(p)}${p.eclat ? '<span class="marque-eclat" title="Spécimen panaché ou irisé : compte double en sève">éclat · sève ×2</span>' : ''}</div>
        <p class="fiche-texte">${p.texte}</p>
        <p class="fiche-origine"><b>Origine</b> · ${p.origine}</p>
        <dl class="soins">${soins}</dl>
        ${n ? `<fieldset class="formats"><legend>Format</legend>${formats.join('')}</fieldset>` : ''}
        <div class="fiche-actions">
          ${n
            ? `<button type="button" class="btn" id="fiche-ajout">Ajouter au colis · <span id="fiche-ajout-prix">${euros(p.prix)}</span></button>`
            : `<button type="button" class="btn btn-creux" id="fiche-rappel">Me prévenir au retour</button>`}
          <span class="fiche-stock${n && n <= 2 ? ' bas' : ''}">${stockTexte(p)}${dejaPris ? ` · ${dejaPris} déjà dans le colis` : ''}</span>
        </div>
        <p class="fiche-herbier${possede ? '' : ' manque'}">${possede ? `Dans votre herbier · reçu ${possede} fois` : 'Manque à votre herbier'}</p>
      </div>
    </div>`;
    if (!ficheEl.open) ficheEl.showModal();
    const premier = $('#fiche-ajout, #fiche-rappel', ficheEl);
    if (premier) premier.focus({ preventScroll: true });
  }

  ficheEl.addEventListener('click', (e) => {
    if (e.target === ficheEl || e.target.closest('[data-fermer]')) return ficheEl.close();
    const v = e.target.closest('[data-voisin]');
    if (v && ficheCourante) return ouvrirFiche(voisins(ficheCourante)[v.dataset.voisin === '-1' ? 0 : 1].id);
    if (e.target.closest('#fiche-ajout')) {
      const format = ($('input[name="format"]:checked', ficheEl) || {}).value || 'bouture';
      if (ajouter(ficheCourante.id, format)) ficheEl.close();
      return;
    }
    if (e.target.closest('#fiche-rappel')) {
      if (!etat.rappels.includes(ficheCourante.id)) etat.rappels.push(ficheCourante.id);
      sauver();
      toast(`Rappel noté pour <b>${echap(ficheCourante.latin)}</b>.`);
      e.target.closest('#fiche-rappel').disabled = true;
    }
  });
  ficheEl.addEventListener('change', (e) => {
    if (e.target.name !== 'format' || !ficheCourante) return;
    const prix = e.target.value === 'racinee' ? ficheCourante.racinee : ficheCourante.prix;
    $('#fiche-ajout-prix', ficheEl).textContent = euros(prix);
  });
  ficheEl.addEventListener('keydown', (e) => {
    if (!ficheCourante || e.target.matches('input[type="radio"]')) return;
    if (e.key === 'ArrowLeft') ouvrirFiche(voisins(ficheCourante)[0].id);
    if (e.key === 'ArrowRight') ouvrirFiche(voisins(ficheCourante)[1].id);
  });
  ficheEl.addEventListener('pointermove', (e) => {
    const f = e.target.closest('.feuille-fiche.eclat');
    if (!f) return;
    const r = f.getBoundingClientRect();
    f.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    f.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
  });

  // ---------- Caisse ----------

  const caisseEl = $('#caisse');
  let modeCaisse = 'liste';

  function prixLigne(l) {
    if (l.format === 'fourniture') return fournitureParId[l.id].prix;
    const p = parId[l.id];
    return l.format === 'racinee' ? p.racinee : p.prix;
  }

  function ajouter(id, format) {
    if (format !== 'fourniture') {
      const p = parId[id];
      const reste = stock(p) - dansPanier(id);
      if (reste <= 0) {
        toast(stock(p) ? `Tous les tubes de <b>${echap(p.latin)}</b> sont déjà dans votre colis.` : `<b>${echap(p.latin)}</b> est épuisé.`);
        return false;
      }
    }
    const l = etat.panier.find((x) => x.id === id && x.format === format);
    if (l) l.qte += 1; else etat.panier.push({ id, format, qte: 1 });
    sauver();
    majCompteur(true);
    const nom = format === 'fourniture' ? fournitureParId[id].nom : parId[id].latin;
    toast(`<b>${echap(nom)}</b> est dans le colis.`);
    return true;
  }

  function majCompteur(tape) {
    const n = etat.panier.reduce((t, l) => t + l.qte, 0);
    const el = $('#caisse-nb');
    el.textContent = n;
    if (tape) { el.classList.remove('tape'); void el.offsetWidth; el.classList.add('tape'); }
    $('#seve-nb').textContent = Math.round(etat.seve);
  }

  function totaux() {
    const sous = etat.panier.reduce((t, l) => t + prixLigne(l) * l.qte, 0);
    const port = !etat.panier.length || sous >= FRANCO ? 0 : PORT;
    return { sous, port, total: sous + port };
  }

  function seveDe(panier) {
    return panier.reduce((t, l) => {
      if (l.format === 'fourniture') return t;
      return t + prixLigne(l) * l.qte * (parId[l.id].eclat ? 2 : 1);
    }, 0);
  }

  function rendreCaisse() {
    const { sous, port, total } = totaux();
    let corps = '';
    if (modeCaisse === 'scelle') {
      corps = `<div class="scelle">${SCEAU}<h3>Colis scellé</h3><p>${dernierBilan}</p><button type="button" class="btn" data-herbier>Voir mon herbier</button></div>`;
      caisseEl.innerHTML = `<div class="caisse-corps"><div class="caisse-tete"><h2 id="caisse-titre">Le colis</h2></div><div class="caisse-lignes">${corps}</div><div></div><button type="button" class="fermer" data-fermer aria-label="Fermer le colis">×</button></div>`;
      return;
    }
    if (!etat.panier.length) {
      corps = `<div class="caisse-vide"><p>Le colis est vide. Les tubes vous attendent sur les étagères.</p><button type="button" class="btn btn-creux" data-fermer>Retour aux armoires</button></div>`;
    } else if (modeCaisse === 'commande') {
      corps = `<form class="commande" id="form-commande">
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
      corps = etat.panier.map((l, i) => {
        const four = l.format === 'fourniture';
        const p = four ? null : parId[l.id];
        const max = four ? 99 : stock(p) - dansPanier(l.id) + l.qte;
        const vis = four ? `<span class="ligne-vis fourniture" aria-hidden="true">✦</span>` : `<span class="ligne-vis">${Dessin.tube(p, { sansEtiquette: true })}</span>`;
        const nom = four
          ? `${echap(fournitureParId[l.id].nom)}<small>${echap(fournitureParId[l.id].detail)}</small>`
          : `${nomHtml(p)}<small>${numero(p)} · ${l.format === 'racinee' ? 'bouture racinée' : 'bouture en tube'}</small>`;
        return `<div class="ligne">${vis}<div class="ligne-nom">${nom}</div><div class="ligne-droite"><span class="ligne-prix">${euros(prixLigne(l) * l.qte)}</span><span class="qte"><button type="button" data-moins="${i}" aria-label="Retirer un">−</button><span>${l.qte}</span><button type="button" data-plus="${i}" aria-label="Ajouter un"${l.qte >= max ? ' disabled' : ''}>+</button></span></div></div>`;
      }).join('');
    }

    let pied = '';
    if (etat.panier.length) {
      const manque = FRANCO - sous;
      pied = `<div class="caisse-pied">
        <div class="total-ligne"><span>Sous-total</span><span>${fmt.format(sous)}</span></div>
        <div class="total-ligne${port ? '' : ' offert'}"><span>Colissimo suivi</span><span>${port ? fmt.format(port) : 'offert'}</span></div>
        ${hiver() ? '<div class="total-ligne offert"><span>Sachet chauffant 40 h</span><span>offert</span></div>' : ''}
        <div class="total-ligne grand"><span>Total</span><span>${fmt.format(total)}</span></div>
        <p class="caisse-note">${manque > 0 ? `Encore ${fmt.format(manque)} pour le port offert. ` : ''}Prochain envoi : ${prochainEnvoi()}. Sève gagnée : ${Math.round(seveDe(etat.panier))} gouttes.</p>
        ${modeCaisse === 'commande'
          ? `<div class="fiche-actions"><button type="submit" class="btn" form="form-commande">Sceller le colis · ${fmt.format(total)}</button><button type="button" class="btn btn-creux" data-retour>Retour</button></div>`
          : `<button type="button" class="btn" data-commander>Passer commande</button>`}
      </div>`;
    }
    const n = etat.panier.reduce((t, l) => t + l.qte, 0);
    caisseEl.innerHTML = `<div class="caisse-corps">
      <div class="caisse-tete"><h2 id="caisse-titre">${modeCaisse === 'commande' ? 'Expédition' : 'Le colis'}</h2><p>${n ? `${n} article${n > 1 ? 's' : ''} · calés dans la paille de bois` : 'Caisse en bois, paille, sachet chauffant en hiver'}</p></div>
      <div class="caisse-lignes">${corps}</div>
      ${pied || '<div></div>'}
      <button type="button" class="fermer" data-fermer aria-label="Fermer le colis">×</button>
    </div>`;
  }

  const SCEAU = `<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M60 6c10 0 14 8 22 10s16-2 21 6-1 15 2 23 10 12 8 21-11 11-14 19 0 16-8 21-15-1-23 2-12 10-21 8-11-11-19-14-16 0-21-8 1-15-2-23S-1 71 1 62s11-11 14-19S15 27 23 22s15 1 23-2S50 6 60 6Z" fill="#8f2b22"/><circle cx="60" cy="60" r="36" fill="none" stroke="#5a1410" stroke-width="2"/><circle cx="60" cy="60" r="30" fill="none" stroke="#c4584a" stroke-width="1" stroke-dasharray="2 3"/><path d="M60 84V44" stroke="#f0c0b0" stroke-width="2.5"/><path d="M60 72c-14-3-18-16-12-26 9 5 13 15 12 26Z" fill="#f0c0b0"/><path d="M60 60c12-3 15-14 10-22-8 4-11 13-10 22Z" fill="#f0c0b0" opacity=".75"/></svg>`;
  let dernierBilan = '';

  function sceller() {
    const panier = etat.panier.slice();
    const avantPossedes = nbPossedes();
    const avantArmoires = A.map((_, i) => armoireComplete(i));
    const nouveaux = [];
    for (const l of panier) {
      if (l.format === 'fourniture') continue;
      if (!etat.herbier[l.id]) nouveaux.push(parId[l.id]);
      etat.herbier[l.id] = (etat.herbier[l.id] || 0) + l.qte;
      etat.pris[l.id] = (etat.pris[l.id] || 0) + l.qte;
    }
    const gagne = seveDe(panier);
    const avantSeve = etat.seve;
    etat.seve += gagne;
    etat.panier = [];
    sauver();

    const k = nouveaux.length;
    dernierBilan = k
      ? `${k === 1 ? 'Un nouveau spécimen rejoint' : `${k} nouveaux spécimens rejoignent`} votre herbier, avec ${Math.round(gagne)} gouttes de sève. Départ ${prochainEnvoi()}.`
      : `Vos tubes partent ${prochainEnvoi()}. ${Math.round(gagne)} gouttes de sève gagnées.`;
    modeCaisse = 'scelle';
    rendreCaisse();
    toutRendre();

    let delai = 600;
    const plus = (html) => { setTimeout(() => toast(html), delai); delai += 900; };
    A.forEach((a, i) => { if (!avantArmoires[i] && armoireComplete(i)) plus(`Armoire ${a.numero} complétée : la plaque de laiton est à vous.`); });
    if (avantPossedes < SEUIL_TIROIR && nbPossedes() >= SEUIL_TIROIR) plus('Le tiroir du collectionneur vient de se déverrouiller.');
    PALIERS.forEach((pl) => { if (avantSeve < pl.seve && etat.seve >= pl.seve) plus(`Palier de sève atteint : ${pl.texte.toLowerCase()}.`); });
  }

  caisseEl.addEventListener('click', (e) => {
    if (e.target === caisseEl || e.target.closest('[data-fermer]')) return caisseEl.close();
    const moins = e.target.closest('[data-moins]'), plus = e.target.closest('[data-plus]');
    if (moins || plus) {
      const l = etat.panier[+(moins || plus).dataset[moins ? 'moins' : 'plus']];
      if (!l) return;
      l.qte += plus ? 1 : -1;
      if (l.qte <= 0) etat.panier.splice(etat.panier.indexOf(l), 1);
      sauver(); majCompteur(); rendreCaisse();
      return;
    }
    if (e.target.closest('[data-commander]')) { modeCaisse = 'commande'; rendreCaisse(); $('#c-nom').focus(); return; }
    if (e.target.closest('[data-retour]')) { modeCaisse = 'liste'; rendreCaisse(); return; }
    if (e.target.closest('[data-herbier]')) { caisseEl.close(); ouvrirVue('herbier'); }
  });
  caisseEl.addEventListener('submit', (e) => {
    e.preventDefault();
    sceller();
  });
  caisseEl.addEventListener('close', () => { if (modeCaisse !== 'commande') modeCaisse = 'liste'; });

  function ouvrirCaisse() {
    if (modeCaisse === 'scelle') modeCaisse = 'liste';
    rendreCaisse();
    caisseEl.showModal();
  }

  // ---------- Tiroirs et quarantaine ----------

  const tiroirEl = $('#tiroir');
  function ouvrirTiroir(html) {
    tiroirEl.innerHTML = `<div class="tiroir-corps">${html}<button type="button" class="fermer" data-fermer aria-label="Fermer">×</button></div>`;
    tiroirEl.showModal();
  }

  function tiroirFournitures() {
    ouvrirTiroir(`<h2 id="tiroir-titre">Fournitures</h2><p>Tout ce qu'il faut pour sortir une bouture de son tube et l'installer.</p>
      <div class="fournitures">${F.map((x) => `<div class="fourniture"><span><b>${x.nom}</b><small>${x.detail}</small></span><span class="prix">${euros(x.prix)}</span><button type="button" class="btn" data-fourniture="${x.id}">Ajouter</button></div>`).join('')}</div>`);
  }

  const CADENAS = `<svg viewBox="0 0 70 80" aria-hidden="true"><path d="M18 34V24a17 17 0 0 1 34 0v10" fill="none" stroke="currentColor" stroke-width="6"/><rect x="8" y="34" width="54" height="42" rx="5" fill="currentColor"/><circle cx="35" cy="52" r="6" fill="#1a120a"/><path d="M35 56v10" stroke="#1a120a" stroke-width="4"/></svg>`;

  function tiroirCollection() {
    const n = nbPossedes();
    if (!tiroirOuvert()) {
      ouvrirTiroir(`<h2 id="tiroir-titre">Tiroir du collectionneur</h2><p>Deux spécimens qu'on ne montre pas sur les étagères. Le tiroir s'ouvre quand votre herbier compte ${SEUIL_TIROIR} spécimens différents.</p>
        <div class="cadenas">${CADENAS}<div class="cadenas-barre"><i style="width:${(n / SEUIL_TIROIR) * 100}%"></i></div><p>${n} sur ${SEUIL_TIROIR} spécimens dans votre herbier</p></div>`);
      return;
    }
    ouvrirTiroir(`<h2 id="tiroir-titre">Tiroir du collectionneur</h2><p>Réservé aux herbiers de ${SEUIL_TIROIR} spécimens et plus. Un seul exemplaire de chaque, rarement réassorti.</p>
      <div class="secrets">${SECRETS.map((p) => `<button type="button" class="secret" data-ouvrir="${p.id}"><span class="mini">${Dessin.tube(p, { sansEtiquette: true })}</span><span><b>${nomHtml(p)}</b><span>${R[p.rarete].nom} · ${euros(p.prix)} · ${stockTexte(p)}</span></span></button>`).join('')}</div>`);
  }

  let minuterie = null;
  function tiroirQuarantaine() {
    ouvrirTiroir(`<h2 id="tiroir-titre">En quarantaine</h2><p>Trois espèces arrivées cette semaine. Elles restent isolées deux semaines, le temps de vérifier qu'elles ne portent ni thrips ni cochenilles. Elles entrent dans les armoires le samedi 14 novembre à 18 h.</p>
      <div class="decompte" id="decompte"></div>
      <form class="rappel" id="form-rappel"><label class="etiquette-champ" for="rappel-mail" hidden>E-mail</label><input id="rappel-mail" type="email" placeholder="votre@adresse.fr" autocomplete="email" required><button type="submit" class="btn">Me prévenir</button></form>`);
    const maj = () => {
      const el = $('#decompte');
      if (!el) return clearInterval(minuterie);
      let ms = Math.max(0, SORTIE_QUARANTAINE - new Date());
      const j = Math.floor(ms / 864e5); ms -= j * 864e5;
      const h = Math.floor(ms / 36e5); ms -= h * 36e5;
      const m = Math.floor(ms / 6e4);
      el.innerHTML = [[j, 'jours'], [h, 'heures'], [m, 'minutes']].map(([v, l]) => `<div><b>${String(v).padStart(2, '0')}</b><span>${l}</span></div>`).join('');
    };
    clearInterval(minuterie);
    maj();
    minuterie = setInterval(maj, 30000);
  }

  tiroirEl.addEventListener('click', (e) => {
    if (e.target === tiroirEl || e.target.closest('[data-fermer]')) return tiroirEl.close();
    const f = e.target.closest('[data-fourniture]');
    if (f) return ajouter(f.dataset.fourniture, 'fourniture');
    const o = e.target.closest('[data-ouvrir]');
    if (o) { tiroirEl.close(); ouvrirFiche(o.dataset.ouvrir); }
  });
  tiroirEl.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!etat.rappels.includes('quarantaine')) etat.rappels.push('quarantaine');
    sauver();
    toast('Rappel noté pour le 14 novembre.');
    tiroirEl.close();
  });
  tiroirEl.addEventListener('close', () => clearInterval(minuterie));

  // ---------- Registre ----------

  let tri = { cle: 'n', sens: 1 };
  function rendreRegistre() {
    const lignes = S.slice().sort((a, b) => (a[tri.cle] - b[tri.cle]) * tri.sens || a.n - b.n);
    let h = '', derniere = null;
    for (const p of lignes) {
      if (tri.cle === 'n' && p.armoire !== derniere) {
        derniere = p.armoire;
        h += `<tr class="armoire-sep"><td colspan="7">Armoire ${A[p.armoire].numero} · ${A[p.armoire].nom}</td></tr>`;
      }
      const n = stock(p);
      h += `<tr class="${correspond(p) ? '' : 'estompe'}">
        <td class="num">${String(p.n).padStart(2, '0')}</td>
        <td><button type="button" class="lien-spec" data-ouvrir="${p.id}">${nomHtml(p)}</button>${p.eclat ? ' <span class="marque-eclat">éclat</span>' : ''}</td>
        <td class="col-fr">${p.fr}</td>
        <td class="col-famille">${p.famille}</td>
        <td>${rareteHtml(p)}</td>
        <td class="col-stock${n ? '' : ' zero'}">${n ? n : 'épuisé'}</td>
        <td class="col-prix">${euros(p.prix)}</td>
      </tr>`;
    }
    $('#registre-corps').innerHTML = h;
    $$('#registre-table th button').forEach((b) => {
      if (b.dataset.tri === tri.cle) b.dataset.actif = tri.sens > 0 ? 'asc' : 'desc';
      else delete b.dataset.actif;
    });
  }
  $('#registre-table thead').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tri]');
    if (!b) return;
    tri = b.dataset.tri === tri.cle ? { cle: tri.cle, sens: -tri.sens } : { cle: b.dataset.tri, sens: b.dataset.tri === 'n' ? 1 : -1 };
    rendreRegistre();
  });

  // ---------- Herbier ----------

  const armoireComplete = (i) => S.filter((p) => p.armoire === i).every((p) => etat.herbier[p.id] > 0);

  // « Monstera deliciosa » devient « M. deliciosa », comme sur une planche d'herbier
  function abrege(latin) {
    const mots = latin.split(' ');
    return mots.length > 1 ? `${mots[0][0]}. ${mots.slice(1).join(' ')}` : latin;
  }

  function caseHtml(p, cachee) {
    if (cachee) {
      return `<div class="case cachee" aria-label="Spécimen secret"><span class="case-num">··</span>${Dessin.pressee({ id: p.id, dessin: { forme: 'ovale', w: .5 } }, false)}<span class="case-nom">? ? ?</span></div>`;
    }
    const n = etat.herbier[p.id] || 0;
    return `<button type="button" class="case${n ? ' possede' : ''}${p.eclat ? ' eclat' : ''}" data-ouvrir="${p.id}" aria-label="${echap(nomTexte(p))}, ${n ? 'dans votre herbier' : 'manquant'}">
      <span class="case-num">${String(p.n).padStart(2, '0')}</span>${n > 1 ? `<span class="case-compte">×${n}</span>` : ''}
      ${Dessin.pressee(p, n > 0)}
      <span class="case-nom">${echap(abrege(p.latin))}${p.cultivar ? ` ‘${echap(p.cultivar)}’` : ''}</span>
    </button>`;
  }

  function rendreHerbier() {
    const total = S.length;
    const n = nbPossedes();
    const eclats = possedes().filter((p) => p.eclat).length;
    const max = PALIERS[PALIERS.length - 1].seve;
    const suivant = PALIERS.find((pl) => etat.seve < pl.seve);
    $('#herbier-bilan').innerHTML = `
      <div class="bilan-compte"><b>${n}<small style="font-size:.45em;color:var(--texte-doux)"> / ${total}</small></b><span>spécimens · ${eclats} éclat${eclats > 1 ? 's' : ''}</span></div>
      <div class="seve-jauge">
        <div class="seve-titre"><span>Carnet de sève : <b>${Math.round(etat.seve)} gouttes</b></span><span>${suivant ? `encore ${Math.ceil(suivant.seve - etat.seve)} avant le prochain palier` : 'tous les paliers sont atteints'}</span></div>
        <div class="seve-tube" role="img" aria-label="${Math.round(etat.seve)} gouttes sur ${max}"><i style="width:calc(${Math.min(1, etat.seve / max) * 100}% - 4px)"></i></div>
        <div class="paliers">${PALIERS.map((pl) => `<div class="palier${etat.seve >= pl.seve ? ' atteint' : ''}"><b>${pl.seve} gouttes</b>${pl.texte}</div>`).join('')}</div>
      </div>`;
    let h = A.map((a, i) => {
      const specs = S.filter((p) => p.armoire === i);
      const faits = specs.filter((p) => etat.herbier[p.id] > 0).length;
      return `<section class="planche${faits === specs.length ? ' complete' : ''}" aria-label="Planche de l'armoire ${a.numero}">
        <header class="planche-tete"><h3>${a.numero} · ${a.nom}</h3><span>${faits} / ${specs.length}</span></header>
        <div class="cases">${specs.map((p) => caseHtml(p)).join('')}</div>
      </section>`;
    }).join('');
    const ouvert = tiroirOuvert();
    h += `<section class="planche planche-secret" aria-label="Planche du tiroir du collectionneur">
      <header class="planche-tete"><h3>Tiroir du collectionneur</h3><span>${ouvert ? `${SECRETS.filter((p) => etat.herbier[p.id]).length} / ${SECRETS.length}` : `s'ouvre à ${SEUIL_TIROIR} spécimens`}</span></header>
      <div class="cases">${SECRETS.map((p) => caseHtml(p, !ouvert)).join('')}</div>
    </section>`;
    $('#planches').innerHTML = h;
    $('#invite-herbier').textContent = `${n} spécimen${n > 1 ? 's' : ''} sur ${total} · ${Math.round(etat.seve)} gouttes de sève`;
  }

  // ---------- L'herbier et le registre : consultés à part, en plein écran (ticket #30) ----------

  function ouvrirVue(nom) {
    const v = $(`#vue-${nom}`);
    if (!v) return;
    if (!v.open) v.showModal();
    v.scrollTop = 0;
  }
  $$('dialog.vue').forEach((v) => v.addEventListener('click', (e) => {
    if (e.target === v || e.target.closest('[data-fermer]')) v.close();
  }));
  document.addEventListener('click', (e) => {
    const l = e.target.closest('[data-vue], a[href="#herbier"], a[href="#registre"]');
    if (!l) return;
    e.preventDefault();
    ouvrirVue(l.dataset.vue || l.getAttribute('href').slice(1));
  });

  // ---------- Chiffres d'ouverture ----------

  function rendreChiffres() {
    const tubes = S.reduce((t, p) => t + stock(p), 0);
    const eclats = S.filter((p) => p.eclat).length;
    $('#chiffres').innerHTML = [
      [S.length, 'espèces'],
      [tubes, 'tubes en stock'],
      [eclats, 'éclats'],
      [prochainEnvoi(), 'prochain envoi']
    ].map(([v, l]) => `<div><dt>${l}</dt><dd>${v}</dd></div>`).join('');
  }

  // ---------- Recherche ----------

  const champ = $('#recherche'), resultats = $('#recherche-res');
  function chercher() {
    const q = sansAccents(champ.value.trim());
    if (q.length < 2) { resultats.hidden = true; return; }
    const base = tiroirOuvert() ? TOUS : S;
    const trouves = base.filter((p) => sansAccents(`${p.latin} ${p.cultivar || ''} ${p.fr} ${p.famille}`).includes(q)).slice(0, 7);
    resultats.innerHTML = trouves.length
      ? trouves.map((p) => `<li><button type="button" data-cherche="${p.id}"><span class="l">${nomHtml(p)}</span><span class="s">${numero(p)} · ${p.fr} · ${placeTexte(p)}</span></button></li>`).join('')
      : `<li><span class="s" style="display:block;padding:6px 8px">Aucun spécimen à ce nom.</span></li>`;
    resultats.hidden = false;
  }
  function choisirRecherche(id) {
    const p = parId[id];
    resultats.hidden = true;
    champ.value = '';
    if (p.secret) return ouvrirFiche(id);
    changerArmoire(p.armoire).then(() => ouvrirFiche(id));
  }
  champ.addEventListener('input', chercher);
  champ.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { resultats.hidden = true; return; }
    if (e.key === 'Enter') {
      e.preventDefault();
      const b = $('[data-cherche]', resultats);
      if (b) choisirRecherche(b.dataset.cherche);
    }
    if (e.key === 'ArrowDown') { const b = $('[data-cherche]', resultats); if (b) { e.preventDefault(); b.focus(); } }
  });
  resultats.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cherche]');
    if (b) choisirRecherche(b.dataset.cherche);
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('.recherche')) resultats.hidden = true; });

  // ---------- Événements généraux ----------

  $('#choix-armoires').addEventListener('click', (e) => {
    const b = e.target.closest('[data-armoire]');
    if (b) changerArmoire(+b.dataset.armoire);
  });
  $('#choix-armoires').addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const pas = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1;
    const i = (etat.armoire + pas + A.length) % A.length;
    changerArmoire(i).then(() => $(`[data-armoire="${i}"]`).focus());
  });

  $('#filtres').addEventListener('click', (e) => {
    const b = e.target.closest('[data-filtre]');
    if (!b) return;
    etat.filtre = b.dataset.filtre;
    rendreFiltres();
    $$('[data-id]', contenuEl).forEach((t) => t.classList.toggle('estompe', !correspond(parId[t.dataset.id])));
    $$('[data-tag]', contenuEl).forEach((t) => t.classList.toggle('estompe', !correspond(parId[t.dataset.tag])));
    rendreRegistre();
  });

  contenuEl.addEventListener('click', (e) => {
    const t = e.target.closest('[data-id]');
    if (t) {
      if (!grandEcran.matches || surTable === t.dataset.id) return ouvrirFiche(t.dataset.id);
      return montrerEtiquette(parId[t.dataset.id]);
    }
    if (e.target.closest('[data-quarantaine]')) tiroirQuarantaine();
  });
  // la table servie : survoler un autre tube change la carte, sans faire bouger l'armoire
  const survol = (e) => {
    const t = e.target.closest('[data-id]');
    if (t && surTable && surTable !== t.dataset.id) montrerEtiquette(parId[t.dataset.id]);
  };
  contenuEl.addEventListener('pointerover', survol);
  contenuEl.addEventListener('focusin', survol);

  // passer d'une armoire à l'autre : flèches de la console, flèches du clavier, glissé du doigt, molette horizontale
  const voisine = (pas) => changerArmoire((etat.armoire + pas + A.length) % A.length, { sens: pas });
  $$('.fleche[data-pas]').forEach((b) => b.addEventListener('click', () => voisine(+b.dataset.pas)));
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    if (document.querySelector('dialog[open]') || e.target.closest('input, textarea, [role="tablist"]')) return;
    const r = armoireEl.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    e.preventDefault();
    voisine(e.key === 'ArrowRight' ? 1 : -1);
  });
  let depart = null;
  armoireEl.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') depart = { x: e.clientX, y: e.clientY }; });
  armoireEl.addEventListener('pointerup', (e) => {
    if (!depart) return;
    const dx = e.clientX - depart.x, dy = e.clientY - depart.y;
    depart = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) voisine(dx < 0 ? 1 : -1);
  });
  let molette = 0, repos = 0;
  sceneEl.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    if (Date.now() < repos) return;
    molette += e.deltaX;
    if (Math.abs(molette) > 80) { voisine(molette > 0 ? 1 : -1); molette = 0; repos = Date.now() + 700; }
  }, { passive: false });

  document.addEventListener('click', (e) => {
    const o = e.target.closest('[data-ouvrir]');
    if (o && !o.closest('dialog:not(.vue)')) ouvrirFiche(o.dataset.ouvrir);
  });

  $('#tiroir-g').addEventListener('click', tiroirFournitures);
  $('#tiroir-d').addEventListener('click', tiroirCollection);
  $('#btn-caisse').addEventListener('click', ouvrirCaisse);

  $('#btn-neons').addEventListener('click', () => {
    etat.neons = !etat.neons;
    sauver();
    appliquerNeons();
    if (!etat.neons) toast('Dans le noir, seuls les éclats brillent.');
  });
  function appliquerNeons() {
    $('#btn-neons').setAttribute('aria-pressed', String(etat.neons));
    armoireEl.classList.toggle('nuit', !etat.neons);
  }

  function toutRendre() {
    rendreChoix();
    rendreIntro();
    rendreArmoire();
    rendreRegistre();
    rendreHerbier();
    rendreChiffres();
    montrerEtiquette(null);
    majCompteur();
  }

  // ---------- Démarrage ----------

  imgEl.src = A[etat.armoire].image;
  appliquerNeon();
  rendreFiltres();
  rendreIntro();
  appliquerNeons();
  toutRendre();
  // les néons s'allument une fois l'image prête
  const allumer = () => {
    armoireEl.classList.add('allumage');
    setTimeout(() => armoireEl.classList.remove('allumage'), 1150);
  };
  if (imgEl.complete) allumer(); else imgEl.addEventListener('load', allumer, { once: true });

  // lien direct vers une fiche : #specimen-thai-constellation
  function lireLien() {
    if (location.hash === '#herbier' || location.hash === '#registre') return ouvrirVue(location.hash.slice(1));
    const m = /^#specimen-([a-z0-9-]+)$/.exec(location.hash);
    const p = m && parId[m[1]];
    if (!p || (p.secret && !tiroirOuvert())) return;
    if (p.secret) return ouvrirFiche(p.id);
    changerArmoire(p.armoire, { instant: p.armoire !== etat.armoire }).then(() => ouvrirFiche(p.id));
  }
  lireLien();
  window.addEventListener('hashchange', lireLien);
  // précharge les autres armoires
  window.addEventListener('load', () => A.forEach((a) => { const i = new Image(); i.src = a.image; }));
})();
