// Dessin des spécimens : tubes, cloches, feuilles pressées.
// Tout est généré en SVG à partir de la fiche « dessin » de chaque plante,
// avec un hasard graine (l'id) pour que chaque tube soit toujours le même.
(function () {
  'use strict';

  function seededRandom(seed) {
    let a = 0;
    for (const c of String(seed)) a = (a * 31 + c.charCodeAt(0)) | 0;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  let counter = 0;
  const newId = (p) => `${p}${(counter++).toString(36)}`;
  const f = (n) => Math.round(n * 1000) / 1000;

  // ---------- Formes de feuilles (unité : base en 0,0, pointe en 0,-1) ----------

  function shape(name, w) {
    switch (name) {
      case 'coeur':
      case 'monstera':
      case 'decoupee':
        return `M0 -.1C${f(.3 * w)} .08 ${f(1.15 * w)} .05 ${f(1.05 * w)} -.35C${f(.95 * w)} -.7 ${f(.3 * w)} -.88 0 -1C${f(-.3 * w)} -.88 ${f(-.95 * w)} -.7 ${f(-1.05 * w)} -.35C${f(-1.15 * w)} .05 ${f(-.3 * w)} .08 0 -.1Z`;
      case 'coeurInv':
        return `M0 0C${f(.6 * w)} -.2 ${f(1.25 * w)} -.55 ${f(.9 * w)} -.9C${f(.6 * w)} -1.08 ${f(.15 * w)} -1.02 0 -.86C${f(-.15 * w)} -1.02 ${f(-.6 * w)} -1.08 ${f(-.9 * w)} -.9C${f(-1.25 * w)} -.55 ${f(-.6 * w)} -.2 0 0Z`;
      case 'aile':
        return `M0 0C${f(1.4 * w)} .02 ${f(1.1 * w)} -.62 ${f(.12 * w)} -1C${f(-.35 * w)} -.72 ${f(-.55 * w)} -.22 0 0Z`;
      case 'rond':
      case 'ecaille':
        return `M0 0C${f(1.1 * w)} -.04 ${f(1.2 * w)} -.82 0 -1C${f(-1.2 * w)} -.82 ${f(-1.1 * w)} -.04 0 0Z`;
      case 'ovale':
      case 'perforee':
        return `M0 0C${f(.85 * w)} -.08 ${f(.95 * w)} -.78 0 -1C${f(-.95 * w)} -.78 ${f(-.85 * w)} -.08 0 0Z`;
      default: // lance, aiguille
        return `M0 0C${f(.6 * w)} -.12 ${f(1.05 * w)} -.45 0 -1C${f(-1.05 * w)} -.45 ${f(-.6 * w)} -.12 0 0Z`;
    }
  }

  // ---------- Motifs (dessinés en unité, découpés par la feuille) ----------

  function patterns(d, w, r, ctx) {
    const mc = d.mc || '#efe6c8';
    let s = '';
    for (const m of d.motif || []) {
      switch (m) {
        case 'nervures': {
          s += `<path d="M0 -.04L0 -.96" stroke="${mc}" stroke-width=".022" opacity=".85"/>`;
          for (let i = 1; i <= 5; i++) {
            const y = -.1 - i * .15;
            for (const c of [1, -1]) s += `<path d="M0 ${f(y)}Q${f(c * w * .45)} ${f(y - .02)} ${f(c * w * 1.05)} ${f(y - .16)}" stroke="${mc}" stroke-width=".014" fill="none" opacity=".75"/>`;
          }
          break;
        }
        case 'nervures-sombres': {
          s += `<path d="M0 -.04L0 -.96" stroke="${mc}" stroke-width=".03" opacity=".7"/>`;
          for (let i = 1; i <= 6; i++) {
            const y = -.08 - i * .13;
            for (const c of [1, -1]) s += `<path d="M0 ${f(y)}Q${f(c * w * .5)} ${f(y - .03)} ${f(c * w * 1.1)} ${f(y - .12)}" stroke="${mc}" stroke-width=".02" fill="none" opacity=".6"/>`;
          }
          break;
        }
        case 'or': {
          s += `<path d="M0 -.02L0 -.98" stroke="${mc}" stroke-width=".035"/>`;
          for (const c of [1, -1]) {
            s += `<path d="M0 -.04C${f(c * w * .7)} -.2 ${f(c * w * .7)} -.7 0 -.97" stroke="${mc}" stroke-width=".024" fill="none"/>`;
            s += `<path d="M0 -.03C${f(c * w * 1.05)} -.15 ${f(c * w * 1.05)} -.75 0 -.97" stroke="${mc}" stroke-width=".018" fill="none" opacity=".85"/>`;
          }
          for (let i = 0; i < 9; i++) {
            const y = -.12 - i * .095;
            s += `<path d="M${f(-w)} ${f(y)}L${f(w)} ${f(y - .03)}" stroke="${mc}" stroke-width=".01" opacity=".55"/>`;
          }
          s += `<g class="scintille">`;
          for (let i = 0; i < 10; i++) s += `<circle cx="${f((r() - .5) * w * 1.2)}" cy="${f(-.1 - r() * .8)}" r=".022" fill="#fff6d8"/>`;
          s += `</g>`;
          break;
        }
        case 'constellation': {
          for (let i = 0; i < 46; i++) {
            const x = (r() - .5) * w * 2.2, y = -r() * 1;
            const big = r() < .18;
            s += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(big ? .06 + r() * .07 : .008 + r() * .02)}" ry="${f(big ? .04 + r() * .05 : .008 + r() * .02)}" fill="${mc}" opacity="${f(.65 + r() * .35)}" transform="rotate(${Math.round(r() * 180)} ${f(x)} ${f(y)})"/>`;
          }
          break;
        }
        case 'menthe': {
          for (let i = 0; i < 9; i++) {
            const x = (r() - .5) * w * 2, y = -.1 - r() * .85;
            s += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(.1 + r() * .2)}" ry="${f(.06 + r() * .12)}" fill="${mc}" opacity=".85" transform="rotate(${Math.round(r() * 180)} ${f(x)} ${f(y)})"/>`;
          }
          break;
        }
        case 'demi': {
          const side = r() < .5 ? 1 : -1;
          let p = `M0 -1.05`;
          for (let i = 0; i <= 8; i++) p += `L${f(side * (.02 + r() * .05))} ${f(-1.05 + i * .14)}`;
          p += `L0 .1L${side * 2} .1L${side * 2} -1.1Z`;
          s += `<path d="${p}" fill="${mc}" opacity=".96"/>`;
          for (let i = 0; i < 14; i++) s += `<circle cx="${f(-side * r() * w)}" cy="${f(-r())}" r="${f(.01 + r() * .025)}" fill="${mc}" opacity=".8"/>`;
          break;
        }
        case 'rose': {
          for (let i = 0; i < 7; i++) {
            const x = (r() - .5) * w * 2.2, y = -.05 - r() * .95;
            s += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(.05 + r() * .22)}" ry="${f(.03 + r() * .12)}" fill="${mc}" opacity="${f(.75 + r() * .25)}" transform="rotate(${Math.round(r() * 180)} ${f(x)} ${f(y)})"/>`;
          }
          break;
        }
        case 'argent':
        case 'argent-plein': {
          const nbItems = m === 'argent' ? 34 : 70;
          for (let i = 0; i < nbItems; i++) {
            const x = (r() - .5) * w * 2.1, y = -r();
            s += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(.02 + r() * .06)}" ry="${f(.015 + r() * .04)}" fill="${mc}" opacity="${f(.35 + r() * .4)}"/>`;
          }
          if (m === 'argent-plein') s += `<path d="M0 -.04L0 -.96" stroke="#5a3a20" stroke-width=".06" opacity=".7"/>`;
          break;
        }
        case 'pois': {
          for (let i = 0; i < 26; i++) s += `<circle cx="${f((r() - .5) * w * 2)}" cy="${f(-.05 - r() * .92)}" r="${f(.022 + r() * .022)}" fill="${mc}" opacity=".92"/>`;
          break;
        }
        case 'pois-rouges': {
          for (let i = 0; i < 18; i++) s += `<circle cx="${f((r() - .5) * w * 1.8)}" cy="${f(-.08 - r() * .85)}" r="${f(.015 + r() * .02)}" fill="${mc}" opacity=".9"/>`;
          break;
        }
        case 'paillettes': {
          for (let i = 0; i < 60; i++) s += `<circle cx="${f((r() - .5) * w * 2)}" cy="${f(-r())}" r=".006" fill="${mc}" opacity="${f(.4 + r() * .6)}"/>`;
          break;
        }
        case 'bord':
        case 'bord-rouge': {
          const g = newId('bd');
          ctx.defs.push(`<linearGradient id="${g}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${mc}"/><stop offset="1" stop-color="${d.mc2 || mc}"/></linearGradient>`);
          s += `<path d="${shape(d.forme === 'perles' ? (d.feuille || 'coeur') : d.forme, w)}" fill="none" stroke="url(#${g})" stroke-width="${m === 'bord' ? .13 : .06}"/>`;
          break;
        }
        case 'iris': {
          const g = newId('ir');
          ctx.defs.push(`<linearGradient id="${g}" x1="-1" y1="0" x2="1" y2="-1" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#1b6fae" stop-opacity="0"/><stop offset=".35" stop-color="#2ec6e8" stop-opacity=".85"/><stop offset=".55" stop-color="#7a6cff" stop-opacity=".7"/><stop offset=".8" stop-color="#2ec6a0" stop-opacity="0"/><animateTransform attributeName="gradientTransform" type="translate" values="-.6 .3;.6 -.3;-.6 .3" dur="5s" repeatCount="indefinite"/></linearGradient>`);
          s += `<rect x="-2" y="-1.2" width="4" height="1.4" fill="url(#${g})"/>`;
          break;
        }
        case 'metal': {
          const g = newId('mt');
          ctx.defs.push(`<linearGradient id="${g}" x1="-1" y1="0" x2="1" y2="-1" gradientUnits="userSpaceOnUse"><stop offset=".2" stop-color="#d8f0f0" stop-opacity="0"/><stop offset=".5" stop-color="#d8f0f0" stop-opacity=".45"/><stop offset=".8" stop-color="#d8f0f0" stop-opacity="0"/></linearGradient>`);
          s += `<rect x="-2" y="-1.2" width="4" height="1.4" fill="url(#${g})"/>`;
          break;
        }
        case 'cloques': {
          for (let i = 0; i < 40; i++) {
            const x = (r() - .5) * w * 2, y = -.06 - r() * .9;
            s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(.025 + r() * .03)}" fill="${mc}" stroke="#0e140a" stroke-width=".008" opacity=".9"/>`;
          }
          break;
        }
        case 'spirale': {
          let p = '';
          const cx = 0, cy = -.52;
          for (let t = 0; t < 4.2 * Math.PI; t += .25) {
            const rr = .02 + t * .045;
            p += `${p ? 'L' : 'M'}${f(cx + Math.cos(t) * rr * w * 1.4)} ${f(cy + Math.sin(t) * rr)}`;
          }
          s += `<path d="${p}" stroke="${mc}" stroke-width=".085" fill="none" stroke-linecap="round" opacity=".9"/>`;
          s += `<path d="${p}" stroke="#7a2a3a" stroke-width=".02" fill="none" opacity=".5"/>`;
          break;
        }
        case 'raye':
        case 'raye-rose': {
          for (let i = -3; i <= 3; i++) {
            const x = i * w * .28;
            s += `<path d="M${f(x * .4)} 0Q${f(x * 1.2)} -.5 ${f(x * .2)} -.98" stroke="${mc}" stroke-width="${m === 'raye' ? .05 : .07}" fill="none" opacity="${i % 2 ? .9 : .55}"/>`;
          }
          break;
        }
        case 'gaufre': {
          for (let i = 0; i < 14; i++) {
            const y = -i * .075;
            s += `<path d="M${f(-w * 1.2)} ${f(y)}Q0 ${f(y - .06)} ${f(w * 1.2)} ${f(y)}" stroke="#10160c" stroke-width=".016" fill="none" opacity=".45"/>`;
          }
          for (let i = -4; i <= 4; i++) s += `<path d="M${f(i * w * .25)} 0L${f(i * w * .12)} -1" stroke="#10160c" stroke-width=".014" opacity=".35"/>`;
          break;
        }
        case 'carapace': {
          for (let i = 0; i < 12; i++) {
            const x = (r() - .5) * w * 1.6, y = -.12 - r() * .76;
            s += `<path d="M${f(x)} ${f(y)}l.08 .04l.02 .09l-.08 .05l-.09 -.04l0 -.09z" stroke="${mc}" stroke-width=".022" fill="none" opacity=".8"/>`;
          }
          break;
        }
        case 'coeur-rouge': {
          const g = newId('cr');
          ctx.defs.push(`<radialGradient id="${g}" cx="0" cy="-.4" r=".5" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${mc}" stop-opacity=".95"/><stop offset="1" stop-color="${mc}" stop-opacity="0"/></radialGradient>`);
          s += `<rect x="-2" y="-1.2" width="4" height="1.4" fill="url(#${g})"/>`;
          break;
        }
        case 'taches': {
          for (let i = 0; i < 16; i++) s += `<circle cx="${f((r() - .5) * w * 1.8)}" cy="${f(-.1 - r() * .8)}" r="${f(.015 + r() * .03)}" fill="${mc}" opacity=".55"/>`;
          break;
        }
        case 'duvet':
        case 'epais':
        case 'velours':
          break;
      }
    }
    return s;
  }

  // ---------- Une feuille ----------

  function leaf(d, x, y, angle, long, ctx, r, opts = {}) {
    const w = (opts.w || d.w || .5);
    const fo = opts.forme || (d.forme === 'perles' ? (d.feuille || 'coeur') : d.forme);
    const path = shape(fo, w);
    const gid = newId('fg');
    const c = opts.couleur || d.c, c2 = opts.couleur2 || d.c2 || d.c;
    ctx.defs.push(`<linearGradient id="${gid}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${c}"/><stop offset="1" stop-color="${c2}"/></linearGradient>`);
    const clip = newId('fc');
    ctx.defs.push(`<clipPath id="${clip}"><path d="${path}"/></clipPath>`);

    // trous et découpes
    let mask = '';
    if (!opts.sansTrous && (fo === 'monstera' || fo === 'perforee' || fo === 'decoupee')) {
      const mid = newId('fm');
      let black = '';
      if (fo === 'monstera') {
        for (const s of [1, -1]) for (let k = 0; k < 4; k++) {
          const y0 = -.22 - k * .17;
          black += `<path d="M${f(s * w * 1.3)} ${f(y0 - .06)}L${f(s * w * (.32 + r() * .12))} ${f(y0 + .02)}" stroke="#000" stroke-width=".045" stroke-linecap="round"/>`;
          if (k < 3) black += `<ellipse cx="${f(s * w * .22)}" cy="${f(y0 - .08)}" rx=".035" ry=".022" fill="#000"/>`;
        }
      } else if (fo === 'decoupee') {
        for (const s of [1, -1]) for (let k = 0; k < 3; k++) {
          const y0 = -.25 - k * .22;
          black += `<path d="M${f(s * w * 1.4)} ${f(y0 - .1)}L${f(s * .06)} ${f(y0 + .04)}" stroke="#000" stroke-width=".06" stroke-linecap="round"/>`;
        }
      } else {
        const t = d.trous || .5;
        for (const s of [1, -1]) for (let k = 0; k < 4; k++) {
          const y0 = -.18 - k * .2 - r() * .04;
          black += `<ellipse cx="${f(s * w * (.42 + r() * .12))}" cy="${f(y0)}" rx="${f(w * (.18 + t * .22))}" ry="${f(.04 + t * .05)}" fill="#000" transform="rotate(${Math.round(s * -18)} ${f(s * w * .5)} ${f(y0)})"/>`;
        }
      }
      ctx.defs.push(`<mask id="${mid}" maskContentUnits="userSpaceOnUse" x="-1" y="-1" width="3" height="3"><rect x="-3" y="-3" width="6" height="6" fill="#fff"/>${black}</mask>`);
      mask = ` mask="url(#${mid})"`;
    }

    const folds = `<path d="M0 0L0 -1.05L2 -1.05L2 .1Z" fill="#000" opacity="${opts.plat ? .06 : .18}"/>`;
    const shine = d.motif && d.motif.includes('velours')
      ? `<path d="M0 -.1C${f(-w * .2)} -.4 ${f(-w * .2)} -.7 0 -.95" stroke="#fff" stroke-width=".12" opacity=".06" fill="none"/>`
      : `<path d="M${f(-w * .35)} -.15C${f(-w * .55)} -.45 ${f(-w * .45)} -.7 ${f(-w * .1)} -.9" stroke="#fff" stroke-width=".07" opacity="${d.motif && d.motif.includes('epais') ? .28 : .14}" fill="none" stroke-linecap="round"/>`;
    const vein = `<path d="M0 -.02L0 -.95" stroke="${opts.nervure || 'rgba(255,255,240,.28)'}" stroke-width=".018"/>`;

    return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(angle)}) scale(${f(long)})"><g${mask}>`
      + `<path d="${path}" fill="url(#${gid})"/>`
      + `<g clip-path="url(#${clip})">${opts.revers ? '' : patterns(d, w, r, ctx)}${folds}${shine}</g>`
      + `${opts.revers ? '' : vein}</g></g>`;
  }

  // ---------- La plante, dans une zone donnée ----------
  // z = { cx, base, haut, l (largeur dispo), s (échelle) }

  function plant(p, z, ctx) {
    const d = p.dessin, r = seededRandom(p.id), s = z.s;
    let o = '';
    const stem = d.tige || '#5d6b3a';

    if (d.forme === 'ecaille') {
      // planche de bois, feuilles plaquées en tuiles
      const pw = 9 * s, top = z.haut + 4 * s;
      o += `<rect x="${f(z.cx - pw / 2)}" y="${f(top)}" width="${f(pw)}" height="${f(z.base - top + 6 * s)}" rx="${f(1.2 * s)}" fill="#5b3e26"/>`;
      for (let i = 0; i < 6; i++) o += `<path d="M${f(z.cx - pw / 2 + 1.5 * s + i * 1.2 * s)} ${f(top)}V${f(z.base)}" stroke="#3b2716" stroke-width="${f(.4 * s)}" opacity=".6"/>`;
      const n = d.n || 5, step = (z.base - top - 6 * s) / n;
      for (let i = 0; i < n; i++) {
        const y = z.base - 2 * s - i * step;
        const sideSign = i % 2 ? 1 : -1;
        o += leaf(d, z.cx + sideSign * 2 * s, y, sideSign * 8, step * 1.5 * (d.l || 1), ctx, r, { plat: true, w: .5 });
      }
      return o;
    }

    if (d.forme === 'fronde') {
      for (let k = 0; k < (d.n || 3); k++) {
        const a = (k - 1) * 22 + (r() - .5) * 8;
        const L = (z.base - z.haut) * (.72 + r() * .2);
        const ex = z.cx + Math.sin(a * Math.PI / 180) * L, ey = z.base - Math.cos(a * Math.PI / 180) * L;
        const mx = z.cx + (ex - z.cx) * .4 + (r() - .5) * 6 * s, my = z.base - L * .55;
        o += `<path d="M${f(z.cx)} ${f(z.base)}Q${f(mx)} ${f(my)} ${f(ex)} ${f(ey)}" stroke="${d.c}" stroke-width="${f(.9 * s)}" fill="none"/>`;
        const step = 18;
        for (let i = 2; i < step; i++) {
          const t = i / step, u = 1 - t;
          const x = u * u * z.cx + 2 * u * t * mx + t * t * ex, y = u * u * z.base + 2 * u * t * my + t * t * ey;
          const size = (1 - t * .7) * 7 * s;
          for (const c of [1, -1]) o += leaf(d, x, y, a + c * 62, size, ctx, r, { w: .38, forme: 'ovale' });
        }
      }
      return o;
    }

    if (d.forme === 'perles') {
      // tige qui monte puis retombe, feuilles par paires
      const n = d.n || 8;
      const hx = z.cx + (r() < .5 ? -1 : 1) * z.l * .18, hy = z.haut + 6 * s;
      const fx = z.cx + (hx > z.cx ? 1 : -1) * z.l * .32, fy = z.base - (z.base - z.haut) * .25;
      o += `<path d="M${f(z.cx)} ${f(z.base)}C${f(z.cx)} ${f(hy)} ${f(hx)} ${f(hy - 6 * s)} ${f(fx)} ${f(fy)}" stroke="${d.tige || '#7a5a6a'}" stroke-width="${f(.7 * s)}" fill="none"/>`;
      for (let i = 1; i <= n; i++) {
        const t = i / (n + .5), u = 1 - t;
        const x = u * u * u * z.cx + 3 * u * u * t * z.cx + 3 * u * t * t * hx + t * t * t * fx;
        const y = u * u * u * z.base + 3 * u * u * t * hy + 3 * u * t * t * (hy - 6 * s) + t * t * t * fy;
        const size = (d.l || .5) * 19 * s;
        for (const c of [1, -1]) o += leaf(d, x, y, c * (60 + r() * 30) + (t > .6 ? 180 : 0), size, ctx, r);
      }
      return o;
    }

    // tige classique, nœuds alternés
    const n = d.n || 3;
    const thin = d.forme === 'aiguille';
    const h = (z.base - z.haut) * (d.h || (thin ? .85 : .64));
    const sway = (r() - .5) * 8 * s;
    const sx = z.cx, sy = z.base, ex = z.cx + sway, ey = z.base - h, qx = z.cx - sway * 1.2, qy = z.base - h * .5;
    o += `<path d="M${f(sx)} ${f(sy)}Q${f(qx)} ${f(qy)} ${f(ex)} ${f(ey)}" stroke="${stem}" stroke-width="${f(1.9 * s * (d.epais || 1))}" fill="none" stroke-linecap="round"/>`;
    let sideSign = r() < .5 ? 1 : -1;
    const sizeN = thin ? 1 : n <= 2 ? 1 : n === 3 ? .86 : .72;
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? .9 : .3 + (i / (n - 1)) * .7;
      const u = 1 - t;
      const x = u * u * sx + 2 * u * t * qx + t * t * ex, y = u * u * sy + 2 * u * t * qy + t * t * ey;
      // nœud
      o += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(1.5 * s)}" ry="${f(.9 * s)}" fill="${stem}" opacity=".9"/>`;
      if (i === 0 && !thin) o += `<path d="M${f(x)} ${f(y)}q${f(sideSign * -3 * s)} ${f(6 * s)} ${f(sideSign * -2 * s)} ${f(14 * s)}" stroke="#8a6a44" stroke-width="${f(.8 * s)}" fill="none" stroke-linecap="round"/>`;
      const base = thin ? 11 : 50 * sizeN;
      const long = base * s * (d.l || 1) * (.8 + r() * .2) * (thin ? 1 : (1 - i * .12 / n));
      const ang = sideSign * (thin ? 25 + r() * 25 : 16 + r() * 20);
      const petiole = thin ? 0 : 5 * s;
      const px = x + Math.sin(ang * Math.PI / 180) * petiole, py = y - Math.cos(ang * Math.PI / 180) * petiole;
      if (petiole) o += `<path d="M${f(x)} ${f(y)}L${f(px)} ${f(py)}" stroke="${stem}" stroke-width="${f(1 * s)}"/>`;
      if (d.revers && i === 0) o += leaf(d, px, py, ang, long * .8, ctx, r, { couleur: d.revers, couleur2: d.revers, revers: true });
      else o += leaf(d, px, py, ang, long, ctx, r);
      if (thin) o += leaf(d, x, y, -ang, long * .9, ctx, r);
      sideSign = -sideSign;
    }
    return o;
  }

  // ---------- Le milieu au fond du tube ----------

  function middle(type, x0, x1, topY, bottomY, r) {
    if (type === 'gel') {
      return `<rect x="${x0}" y="${topY}" width="${x1 - x0}" height="${bottomY - topY}" fill="#d8a64a" opacity=".38"/>`
        + `<path d="M${x0} ${topY}Q${(x0 + x1) / 2} ${topY + 3} ${x1} ${topY}" stroke="#ffe0a0" stroke-width=".8" fill="none" opacity=".6"/>`;
    }
    if (type === 'eau') {
      return `<rect x="${x0}" y="${topY}" width="${x1 - x0}" height="${bottomY - topY}" fill="#8fc8d0" opacity=".2"/>`
        + `<path d="M${x0} ${topY + 1}Q${(x0 + x1) / 2} ${topY - 1.5} ${x1} ${topY + 1}" stroke="#e0ffff" stroke-width=".7" fill="none" opacity=".6"/>`;
    }
    let s = `<rect x="${x0}" y="${topY}" width="${x1 - x0}" height="${bottomY - topY}" fill="#4a3a22"/>`;
    for (let i = 0; i < 38; i++) {
      const x = x0 + r() * (x1 - x0), y = topY + 2 + r() * (bottomY - topY - 2);
      s += `<path d="M${f(x)} ${f(y)}q${f(2 + r() * 3)} ${f(-2 + r() * 2)} ${f(4 + r() * 4)} ${f(-1 + r() * 3)}" stroke="${r() < .5 ? '#8a7a4a' : '#6a8a4a'}" stroke-width=".7" fill="none" opacity=".85"/>`;
    }
    s += `<path d="M${x0} ${topY + 2}q4 -4 8 -1t8 -1t8 0t8 -1" stroke="#7a8a4a" stroke-width="1.2" fill="none"/>`;
    return s;
  }

  // ---------- Tube scellé ----------

  const WAX = { 1: '#7a3326', 2: '#2f5a3a', 3: '#a07a2e', 4: '#5a3a7a', 5: '#c9a040' };

  function tube(p, opts = {}) {
    const ctx = { defs: [] };
    const r = seededRandom(p.id + 'tube');
    const id = newId('t');
    const x0 = 12, x1 = 48, top = 30, bg = 202;
    const inner = `M${x0} ${top}V184A18 18 0 0 0 ${x1} 184V${top}Z`;
    const mystery = opts.mystere;

    ctx.defs.push(`<clipPath id="${id}c"><path d="${inner}"/></clipPath>`);
    ctx.defs.push(`<linearGradient id="${id}v" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".12" stop-color="#fff" stop-opacity=".04"/><stop offset=".7" stop-color="#fff" stop-opacity=".02"/><stop offset=".92" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#fff" stop-opacity=".22"/></linearGradient>`);
    ctx.defs.push(`<linearGradient id="${id}b" x1="0" x2="1"><stop offset="0" stop-color="#8a6a44"/><stop offset=".35" stop-color="#c49a66"/><stop offset=".7" stop-color="#a47a4a"/><stop offset="1" stop-color="#6a4a2a"/></linearGradient>`);

    const midType = mystery ? 'sphaigne' : (p.dessin.milieu || 'sphaigne');
    const midTop = midType === 'sphaigne' ? 172 : 150;
    ctx.defs.push(`<radialGradient id="${id}e" cx=".5" cy=".3" r=".7"><stop offset="0" stop-color="#e8fff0" stop-opacity=".16"/><stop offset="1" stop-color="#bfe0d0" stop-opacity=".04"/></radialGradient>`);
    let mainBody = '';
    mainBody += `<path d="${inner}" fill="url(#${id}e)"/>`;
    mainBody += `<g clip-path="url(#${id}c)">`;
    mainBody += middle(midType, x0, x1, midTop, bg, r);
    if (mystery) {
      mainBody += `<rect x="${x0}" y="${top}" width="${x1 - x0}" height="${bg - top}" fill="#d8e4dc" opacity=".5"/>`;
      mainBody += `<text x="30" y="118" text-anchor="middle" font-family="IM Fell English, Georgia, serif" font-size="30" fill="#2a3a30" opacity=".55">?</text>`;
    } else {
      mainBody += plant(p, { cx: 30, base: midTop + 6, haut: top + 8, l: x1 - x0, s: 1 }, ctx);
      // racines dans la sphaigne ou l'eau
      for (let i = 0; i < 4; i++) mainBody += `<path d="M30 ${midTop + 5}q${f((r() - .5) * 10)} ${f(6 + r() * 6)} ${f((r() - .5) * 14)} ${f(12 + r() * 10)}" stroke="#e8dcc0" stroke-width=".6" fill="none" opacity="${midType === 'sphaigne' ? .35 : .75}"/>`;
      // buée
      for (let i = 0; i < 14; i++) mainBody += `<circle cx="${f(x0 + 2 + r() * (x1 - x0 - 4))}" cy="${f(top + 4 + r() * 46)}" r="${f(.4 + r() * 1.1)}" fill="#fff" opacity="${f(.12 + r() * .2)}"/>`;
    }
    mainBody += `</g>`;
    // verre
    mainBody += `<path d="${inner}" fill="url(#${id}v)" stroke="rgba(230,250,240,.42)" stroke-width=".9"/>`;
    mainBody += `<rect x="${x0 + 3}" y="${top + 6}" width="2.2" height="140" rx="1.1" fill="#fff" opacity=".28"/>`;
    mainBody += `<rect x="${x1 - 5}" y="${top + 12}" width="1" height="120" rx=".5" fill="#fff" opacity=".18"/>`;
    // étiquette papier collée
    if (!opts.sansEtiquette) {
      mainBody += `<g transform="translate(30 ${midTop + 15})"><rect x="-11" y="-6" width="22" height="12" fill="#e8dcc0" opacity=".93"/><text y="2.6" text-anchor="middle" font-family="Special Elite, Courier New, monospace" font-size="6.2" fill="#3a2a1a">${mystery ? '· · ·' : 'N°' + String(p.n).padStart(2, '0')}</text></g>`;
    }
    // lèvre, bouchon de liège et cire
    const wax = mystery ? '#3a3a3a' : (p.eclat ? `url(#${id}i)` : WAX[p.rarete]);
    if (p.eclat && !mystery) ctx.defs.push(`<linearGradient id="${id}i" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#f2c4e8"/><stop offset=".3" stop-color="#9ad8f0"/><stop offset=".6" stop-color="#c8f0b0"/><stop offset="1" stop-color="#f0d890"/><animateTransform attributeName="gradientTransform" type="rotate" values="0 .5 .5;360 .5 .5" dur="6s" repeatCount="indefinite"/></linearGradient>`);
    mainBody += `<rect x="${x0 - 2.5}" y="${top - 3}" width="${x1 - x0 + 5}" height="5" rx="2.5" fill="rgba(230,250,240,.32)"/>`;
    mainBody += `<path d="M14 6H46L45 31H15Z" fill="url(#${id}b)"/>`;
    for (let i = 0; i < 12; i++) mainBody += `<circle cx="${f(16 + r() * 28)}" cy="${f(8 + r() * 21)}" r="${f(.4 + r() * .7)}" fill="#5a3a1a" opacity=".55"/>`;
    mainBody += `<path d="M13 3H47V11Q44 15 42 11.5T36 14T30 11T24 15.5T18 11.5T13 13Z" fill="${wax}"/>`;
    mainBody += `<path d="M15 4.5H45" stroke="#fff" stroke-width=".8" opacity=".25"/>`;
    if (mystery) mainBody += `<text x="30" y="10" text-anchor="middle" font-family="IM Fell English, Georgia, serif" font-size="7" fill="#c9a35b">?</text>`;

    if (opts.couche) {
      return `<svg viewBox="0 0 216 60" aria-hidden="true" focusable="false"><defs>${ctx.defs.join('')}</defs><g transform="translate(0 60) rotate(-90)">${mainBody}</g></svg>`;
    }
    return `<svg viewBox="0 0 60 216" class="tube-svg" aria-hidden="true" focusable="false"><defs>${ctx.defs.join('')}</defs>${mainBody}</svg>`;
  }

  // ---------- Cloche de verre (spécimen d'archive) ----------

  function bellJar(p) {
    const ctx = { defs: [] };
    const id = newId('c');
    const r = seededRandom(p.id + 'cloche');
    const dome = `M38 214V96A62 62 0 0 1 162 96V214Z`;
    ctx.defs.push(`<clipPath id="${id}c"><path d="${dome}"/></clipPath>`);
    ctx.defs.push(`<linearGradient id="${id}v" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".15" stop-color="#fff" stop-opacity=".04"/><stop offset=".8" stop-color="#fff" stop-opacity=".03"/><stop offset="1" stop-color="#fff" stop-opacity=".2"/></linearGradient>`);
    ctx.defs.push(`<linearGradient id="${id}l" x1="0" x2="1"><stop offset="0" stop-color="#6a4a1e"/><stop offset=".3" stop-color="#e8c878"/><stop offset=".55" stop-color="#b08a3e"/><stop offset="1" stop-color="#5a3e18"/></linearGradient>`);
    ctx.defs.push(`<radialGradient id="${id}h" cx=".5" cy=".3" r=".6"><stop offset="0" stop-color="#fff8e0" stop-opacity=".35"/><stop offset="1" stop-color="#fff8e0" stop-opacity="0"/></radialGradient>`);
    let o = '';
    o += `<path d="${dome}" fill="url(#${id}h)"/>`;
    o += `<g clip-path="url(#${id}c)">`;
    // butte de mousse
    o += `<path d="M44 214Q60 186 100 184T156 214Z" fill="#3a4a26"/>`;
    for (let i = 0; i < 40; i++) o += `<circle cx="${f(50 + r() * 100)}" cy="${f(194 + r() * 18)}" r="${f(1 + r() * 2.4)}" fill="${r() < .5 ? '#5a7a34' : '#4a6a2a'}"/>`;
    o += plant(p, { cx: 100, base: 192, haut: 50, l: 110, s: 2 }, ctx);
    for (let i = 0; i < 18; i++) o += `<circle cx="${f(46 + r() * 108)}" cy="${f(50 + r() * 70)}" r="${f(.6 + r() * 1.4)}" fill="#fff" opacity="${f(.12 + r() * .2)}"/>`;
    o += `</g>`;
    o += `<path d="${dome}" fill="url(#${id}v)" stroke="rgba(240,250,240,.5)" stroke-width="1.4"/>`;
    o += `<path d="M52 200V100A48 48 0 0 1 82 52" stroke="#fff" stroke-width="3" fill="none" opacity=".25" stroke-linecap="round"/>`;
    // bouton du dessus
    o += `<rect x="94" y="22" width="12" height="14" rx="3" fill="url(#${id}l)"/><circle cx="100" cy="20" r="7" fill="url(#${id}l)"/>`;
    // socle en laiton et bois
    o += `<rect x="28" y="212" width="144" height="10" rx="3" fill="url(#${id}l)"/>`;
    o += `<rect x="22" y="221" width="156" height="15" rx="2" fill="#3a2414"/><rect x="22" y="221" width="156" height="3" fill="#5a3a20"/>`;
    o += `<rect x="78" y="225" width="44" height="8" rx="1" fill="url(#${id}l)"/><text x="100" y="231.4" text-anchor="middle" font-family="Special Elite, Courier New, monospace" font-size="5.6" fill="#2a1a0a">N°${String(p.n).padStart(2, '0')}</text>`;
    return `<svg viewBox="0 0 200 240" class="cloche-svg" aria-hidden="true" focusable="false"><defs>${ctx.defs.join('')}</defs>${o}</svg>`;
  }

  // ---------- Feuille pressée pour l'herbier ----------

  function pressed(p, owned) {
    const ctx = { defs: [] };
    const r = seededRandom(p.id + 'herbier');
    const d = p.dessin;
    const fo = d.forme === 'perles' ? (d.feuille || 'coeur') : (d.forme === 'fronde' || d.forme === 'aiguille' ? 'lance' : d.forme);
    const w = d.forme === 'aiguille' ? .14 : d.forme === 'fronde' ? .35 : (d.w || .5);
    // la feuille doit tenir dans la case, quelle que soit sa largeur
    const scaleN = Math.round(Math.min(74, 40 / (1.15 * w)));
    const bottomY = 92 - (74 - scaleN) * .35;
    if (!owned) {
      return `<svg viewBox="0 0 100 110" aria-hidden="true" focusable="false"><g transform="translate(52 ${f(bottomY)}) rotate(-8) scale(${scaleN})"><path d="${shape(fo, w)}" fill="none" stroke="currentColor" stroke-width="${f(.9 / scaleN)}" stroke-dasharray="${f(2.2 / scaleN)} ${f(1.8 / scaleN)}"/><path d="M0 .1L0 -.9" stroke="currentColor" stroke-width="${f(.6 / scaleN)}" stroke-dasharray="${f(1.5 / scaleN)} ${f(1.5 / scaleN)}"/></g></svg>`;
    }
    const mainBody = leaf(Object.assign({}, d, { forme: fo }), 52, bottomY, -8, scaleN, ctx, r, { w, forme: fo, plat: true });
    return `<svg viewBox="0 0 100 110" aria-hidden="true" focusable="false"><defs>${ctx.defs.join('')}</defs><path d="M52 ${f(bottomY)}L54 108" stroke="${d.tige || '#5d6b3a'}" stroke-width="1.6"/>${mainBody}<rect x="34" y="99" width="20" height="7" fill="#efe4c8" opacity=".75" transform="rotate(-6 44 102)"/></svg>`;
  }

  window.Drawing = { tube, cloche: bellJar, pressee: pressed };
})();
