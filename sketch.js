// Schematic frame sketches for pro-photo tips and camera-move icons for video shots.
// A pro entry opts in with `sketch: { p: "<preset>", a, b, c, side, k, n, lens, o }` and `ex: "search query"`.
(() => {
  let uid = 0;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const lbl = (x, y, t, cls = "", anchor = "middle") =>
    t ? `<text class="sk-lbl ${cls}" x="${x}" y="${y}" text-anchor="${anchor}">${esc(t)}</text>` : "";
  const person = (x, yb, h, cls = "sk-main") => {
    const r = h * 0.15;
    return `<circle class="${cls}" cx="${x}" cy="${yb - h + r}" r="${r}"/>` +
      `<path class="${cls}" d="M${x - h * 0.2} ${yb} L${x - h * 0.15} ${yb - h + 2.5 * r} Q${x} ${yb - h + 2 * r} ${x + h * 0.15} ${yb - h + 2.5 * r} L${x + h * 0.2} ${yb} Z"/>`;
  };
  const arrow = (x1, y1, x2, y2, both = false) => {
    const head = (xa, ya, xb, yb) => {
      const a = Math.atan2(yb - ya, xb - xa), l = 6;
      return `<path class="sk-arrow-head" d="M${xb} ${yb} L${xb - l * Math.cos(a - 0.5)} ${yb - l * Math.sin(a - 0.5)} L${xb - l * Math.cos(a + 0.5)} ${yb - l * Math.sin(a + 0.5)} Z"/>`;
    };
    return `<line class="sk-arrow" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>` + head(x1, y1, x2, y2) + (both ? head(x2, y2, x1, y1) : "");
  };
  const bokeh = (pts) => pts.map(([x, y, r]) => `<circle class="sk-bokeh" cx="${x}" cy="${y}" r="${r}"/>`).join("");

  // each preset: [title, orientation "h" (160×120) | "v" (120×160), body(spec)]
  const P = {
    symmetry: ["Симетрія", "h", (s) =>
      `<line class="sk-axis" x1="80" y1="0" x2="80" y2="120"/>
       <path class="sk-main" d="M44 108 V52 Q80 18 116 52 V108 H104 V58 Q80 36 56 58 V108 Z"/>
       ${person(80, 112, 16, "sk-sec")}${lbl(80, 13, s.a)}`],

    facade: ["Фасад рівно, назва на ⅓", "h", (s) =>
      `<rect class="sk-soft" x="16" y="22" width="128" height="88"/>
       <rect class="sk-main" x="30" y="34" width="100" height="14" rx="2"/>${lbl(80, 44, s.a, "sk-inv")}
       ${lbl(80, 76, s.b)}${person(34, 114, 20, "sk-sec")}${person(48, 114, 17, "sk-sec")}${person(126, 114, 20, "sk-sec")}`],

    leading: ["Провідні лінії", "h", (s) =>
      `<line class="sk-line" x1="0" y1="120" x2="107" y2="40"/>
       <line class="sk-line" x1="52" y1="120" x2="107" y2="40"/>
       <line class="sk-guide" x1="160" y1="96" x2="107" y2="40"/>
       ${person(107, 44, 18, "sk-sec")}${lbl(6, 78, s.a, "", "start")}${lbl(114, 30, s.b, "", "start")}`],

    portrait: ["Портрет: очі на ⅓, фон розмитий", "v", (s) => {
      const x = s.side === "l" ? 40 : 80, bx = s.side === "l" ? 92 : 28;
      return `${bokeh([[bx, 36, 12], [bx + 8, 84, 8], [bx - 4, 120, 14]])}
        ${s.sun ? `<circle class="sk-sun" cx="${bx}" cy="22" r="10"/>` : ""}
        <circle class="sk-main" cx="${x}" cy="53" r="13"/>
        <path class="sk-main" d="M${x - 32} 160 Q${x - 30} 74 ${x} 72 Q${x + 30} 74 ${x + 32} 160 Z"/>
        ${lbl(x, 32, s.a)}${lbl(bx, 150, s.b)}`;
    }],

    flatlay: ["Flat lay строго зверху", "h", (s) => {
      const n = s.n || ["№", "№", "№"], cols = n.length <= 4 ? n.length : 3, rows = Math.ceil(n.length / cols);
      const cw = 132 / cols, ch = 84 / rows;
      return n.map((t, i) => {
        const cx = 14 + cw * (i % cols) + cw / 2, cy = 12 + ch * Math.floor(i / cols) + ch / 2;
        return t === "●"
          ? `<circle class="sk-main" cx="${cx}" cy="${cy}" r="${Math.min(cw, ch) * 0.32}"/>`
          : `<rect class="sk-main" x="${cx - cw * 0.35}" y="${cy - ch * 0.36}" width="${cw * 0.7}" height="${ch * 0.72}" rx="3"/>${lbl(cx, cy + 3, t, "sk-inv")}`;
      }).join("") + lbl(80, 114, s.a || "рівні відступи");
    }],

    crowd: ["Стиснення натовпу", "h", (s) => {
      let heads = "";
      for (let r = 0; r < 5; r++) {
        const y = 70 + r * 11, cnt = 13 + r * 2, rad = 3.4 + r * 0.8;
        for (let i = 0; i < cnt; i++) heads += `<circle class="sk-sec" cx="${(160 / cnt) * (i + 0.5) + (r % 2 ? 3 : 0)}" cy="${y}" r="${rad}"/>`;
      }
      return `<path class="sk-main" d="M26 66 V36 H134 V66 H125 V45 H35 V66 Z"/>${lbl(80, 30, s.a)}${heads}`;
    }],

    action: ["Рух у вільний простір", "h", (s) =>
      `${person(53, 104, 48)}
       <line class="sk-guide" x1="14" y1="66" x2="32" y2="66"/><line class="sk-guide" x1="10" y1="78" x2="30" y2="78"/><line class="sk-guide" x1="16" y1="90" x2="32" y2="90"/>
       ${arrow(72, 74, 146, 74)}${lbl(110, 64, s.a || "простір попереду")}`],

    object: ["Предмет на ⅓ + розмитий фон", "v", (s) => {
      const k = s.k || 1;
      const pos = k === 1 ? [[80, 58, 22]] : k === 2 ? [[70, 56, 19], [90, 66, 19]] : [[58, 64, 17], [80, 54, 17], [102, 64, 17]];
      return `${bokeh([[24, 112, 15], [62, 140, 10], [102, 124, 12], [28, 58, 8]])}
        <path class="sk-sec" d="M14 0 L32 0 L${pos[0][0] + 6} ${pos[0][1] - 10} L${pos[0][0] - 6} ${pos[0][1] - 2} Z"/>
        ${pos.map(([x, y, r]) => `<circle class="sk-main" cx="${x}" cy="${y}" r="${r}"/><circle class="sk-light" cx="${x - r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.18}"/>`).join("")}
        ${lbl(80, 100, s.a)}`;
    }],

    reflection: ["Відображення: лінія по центру", "h", (s) => {
      const b = `<rect x="22" y="30" width="18" height="30"/><rect x="42" y="20" width="22" height="40"/><rect x="66" y="34" width="16" height="26"/><rect x="84" y="16" width="26" height="44"/><rect x="112" y="28" width="22" height="32"/>`;
      return `<rect class="sk-water" x="0" y="60" width="160" height="60"/>
        <g class="sk-main">${b}</g><g class="sk-main" opacity=".35" transform="translate(0 120) scale(1 -1)">${b}</g>
        <line class="sk-axis" x1="0" y1="60" x2="160" y2="60"/>${lbl(80, 11, s.a)}${lbl(80, 114, s.b || "відображення")}`;
    }],

    low: ["Ракурс знизу", "v", (s) =>
      `<path class="sk-main" d="M16 160 L104 160 L80 22 L66 12 Z"/>
       ${lbl(60, 118, s.a, "sk-inv")}
       ${arrow(12, 96, 12, 56)}${lbl(6, 46, "камера низько", "", "start")}`],

    foreground: ["Розмитий передній план", "h", (s) =>
      `<circle class="sk-bokeh strong" cx="30" cy="94" r="36"/>${lbl(5, 52, s.b || "близько, розмите", "", "start")}
       <path class="sk-guide" d="M58 34 Q108 56 160 36"/>
       ${[70, 86, 102, 118, 134, 150].map((x, i) => `<circle class="sk-main" cx="${x}" cy="${40 + Math.sin(i) * 6 + (i < 3 ? 6 : 2)}" r="5"/>`).join("")}
       ${lbl(112, 76, s.a)}`],

    minime: ["Близький план + пам'ятка вдалині", "h", (s) =>
      `<line class="sk-horizon" x1="0" y1="72" x2="160" y2="72"/>
       <path class="sk-soft strong" d="M96 72 L106 28 L116 72 Z M122 72 V50 H150 V72 Z"/>${lbl(124, 86, s.b)}
       ${person(46, 116, 44)}${lbl(46, 66, s.a)}`],

    pair: ["Діалог двох об'єктів на третинах", "h", (s) =>
      `<rect class="sk-main" x="45" y="32" width="16" height="78" rx="3"/>
       <path class="sk-sec" d="M88 110 V74 Q107 42 126 74 V110 Z"/>
       ${lbl(53, 24, s.a)}${lbl(107, 34, s.b)}`],

    detail: ["Деталь на весь кадр", "h", (s) => {
      let dots = "";
      for (let y = 10; y < 120; y += 14) for (let x = 8; x < 160; x += 14) dots += `<circle class="sk-soft strong" cx="${x}" cy="${y}" r="3"/>`;
      return `${dots}<circle class="sk-main" cx="98" cy="70" r="64"/>${lbl(98, 74, s.a, "sk-inv")}${lbl(5, 113, "обріж сміливо", "", "start")}`;
    }],

    layers: ["Три шари по третинах", "h", (s) =>
      `<rect class="sk-sky" x="0" y="0" width="160" height="40"/>${lbl(80, 24, s.a)}
       <g class="sk-main"><rect x="8" y="48" width="24" height="32"/><rect x="34" y="40" width="30" height="40"/><rect x="66" y="52" width="22" height="28"/><rect x="90" y="42" width="30" height="38"/><rect x="122" y="50" width="30" height="30"/></g>
       ${lbl(80, 68, s.b, "sk-inv")}
       <rect class="sk-water" x="0" y="80" width="160" height="40"/>${lbl(80, 104, s.c)}`],

    follow: ["Кадр зі спини: ти йдеш до мети", "h", (s) =>
      `<line class="sk-guide" x1="30" y1="34" x2="30" y2="120"/><line class="sk-guide" x1="130" y1="34" x2="130" y2="120"/>
       <rect class="sk-main" x="24" y="12" width="112" height="22" rx="2"/>${lbl(80, 26, s.a, "sk-inv sk-s")}
       ${person(72, 118, 42, "sk-sec")}${arrow(90, 80, 104, 50)}`],

    thirds: ["Правило третин", "h", (s) => {
      const x = s.side === "l" ? 53 : 107, ox = s.side === "l" ? 118 : 42;
      return `<line class="sk-horizon" x1="0" y1="86" x2="160" y2="86"/>
        ${s.sky ? `<rect class="sk-sky" x="0" y="0" width="160" height="86"/>` : `<rect class="sk-water" x="0" y="86" width="160" height="34"/>`}
        <ellipse class="sk-soft strong" cx="${x}" cy="88" rx="22" ry="6"/>
        <path class="sk-main" d="M${x - 12} 86 Q${x - 4} 52 ${x + 6} 56 L${x + 14} 86 Z"/><circle class="sk-main" cx="${x}" cy="44" r="8"/>
        ${lbl(x, 26, s.a)}${lbl(ox, 60, s.b)}`;
    }],

    negative: ["Порожній простір як сенс", "h", (s) =>
      `<rect class="sk-soft" x="0" y="8" width="160" height="92"/>${lbl(104, 44, s.b)}
       <line class="sk-horizon" x1="0" y1="100" x2="160" y2="100"/>
       <rect class="sk-main" x="44" y="78" width="18" height="22"/>${lbl(53, 114, s.a)}`],

    silhouette: ["Силует проти світла", "h", (s) =>
      `<rect class="sk-sky" x="0" y="0" width="160" height="84"/><rect class="sk-water" x="0" y="84" width="160" height="36"/>
       <circle class="sk-sun" cx="116" cy="50" r="17"/>
       <line class="sk-horizon" x1="0" y1="84" x2="160" y2="84"/>
       <path class="sk-dark" d="M100 84 Q106 48 120 58 L128 84 Z"/><circle class="sk-dark" cx="114" cy="48" r="8"/>
       ${lbl(46, 40, s.a)}${lbl(46, 104, "експозиція по небу")}`],

    diptych: ["Диптих: однакове кадрування", "h", (s) => {
      const f = (x0) => `<rect class="sk-soft" x="${x0}" y="16" width="68" height="84" rx="3"/>
        <path class="sk-main" d="M${x0 + 38} 88 Q${x0 + 44} 56 ${x0 + 52} 60 L${x0 + 56} 88 Z"/><circle class="sk-main" cx="${x0 + 47}" cy="50" r="6"/>
        <line class="sk-horizon" x1="${x0}" y1="88" x2="${x0 + 68}" y2="88"/>`;
      return `${f(6)}${f(86)}<text class="sk-lbl" x="80" y="62" text-anchor="middle">=</text>${lbl(40, 114, s.a)}${lbl(120, 114, s.b)}`;
    }],

    ensemble: ["Група з головним акцентом", "h", (s) =>
      `<line class="sk-horizon" x1="0" y1="108" x2="160" y2="108"/>
       <rect class="sk-main" x="45" y="22" width="16" height="86" rx="4"/>
       ${[[18, 40], [80, 46], [100, 36], [124, 50], [146, 32]].map(([x, h]) => `<rect class="sk-sec" x="${x - 6}" y="${108 - h}" width="12" height="${h}" rx="3"/>`).join("")}
       ${lbl(53, 16, s.a)}`],

    underwater: ["Згори на підсвічену воду", "h", (s) =>
      `<rect class="sk-soft strong" x="0" y="0" width="160" height="22"/>${lbl(80, 14, s.b || "міст")}
       <rect class="sk-water deep" x="0" y="22" width="160" height="98"/>
       <circle class="sk-glow" cx="80" cy="80" r="36"/>
       ${person(56, 100, 14)}${person(68, 98, 18)}${person(82, 96, 26)}${person(96, 98, 18)}${person(108, 100, 14)}
       ${lbl(80, 44, s.a)}`],
  };

  function render(spec) {
    const preset = P[spec.p];
    if (!preset) return "";
    const [title, o, body] = preset;
    const [w, h] = o === "v" ? [120, 160] : [160, 120];
    const id = `skc${++uid}`;
    const grid = `<line class="sk-grid" x1="${w / 3}" y1="0" x2="${w / 3}" y2="${h}"/><line class="sk-grid" x1="${(2 * w) / 3}" y1="0" x2="${(2 * w) / 3}" y2="${h}"/>` +
      `<line class="sk-grid" x1="0" y1="${h / 3}" x2="${w}" y2="${h / 3}"/><line class="sk-grid" x1="0" y1="${(2 * h) / 3}" x2="${w}" y2="${h / 3 * 2}"/>`;
    const svg = `<svg class="skv ${o}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}">
      <defs><clipPath id="${id}"><rect width="${w}" height="${h}" rx="6"/></clipPath></defs>
      <g clip-path="url(#${id})"><rect class="sk-bg" width="${w}" height="${h}"/>${body(spec)}${grid}</g>
      <rect class="sk-border" x=".75" y=".75" width="${w - 1.5}" height="${h - 1.5}" rx="6"/></svg>`;
    return { svg, title };
  }

  // ── camera moves for video shots ──
  const CAM = [
    ["tilt", "нахил", /нахил|знизу вгору|підйом камери|вниз до води/i],
    ["orbit", "обліт", /обліт|по колу/i],
    ["whip", "whip-pan", /whip|різкий поворот/i],
    ["pan", "панорама", /панорам|повільним рухом|проходка|вздовж будинків/i],
    ["push", "наближення", /наближення|проривання/i],
    ["follow", "зі спини", /зі спини|за спиною|за тобою|прохід крізь|проходиш|заходиш/i],
    ["timelapse", "таймлапс", /таймлапс/i],
    ["slowmo", "slow-mo", /slow-mo/i],
    ["close", "крупно", /крупно|деталь|деталі|макро/i],
    ["wide", "загальний", /загальний план/i],
    ["selfie", "селфі", /селфі|реакція/i],
    ["static", "статика", /статичний/i],
    ["sound", "звук", /звук/i],
  ];
  const ICON = {
    tilt: () => arrow(24, 30, 24, 7, true),
    pan: () => arrow(6, 18, 42, 18, true),
    orbit: () => `<ellipse class="sk-arrow" cx="24" cy="20" rx="17" ry="7" fill="none"/><circle class="sk-main" cx="24" cy="17" r="5"/><path class="sk-arrow-head" d="M41 20 L37 14 L44 15 Z"/>`,
    whip: () => `<path class="sk-arrow" d="M8 26 Q24 4 40 20" fill="none"/><path class="sk-arrow-head" d="M40 20 L33 19 L38 13 Z"/><line class="sk-guide" x1="10" y1="12" x2="18" y2="10"/><line class="sk-guide" x1="8" y1="18" x2="15" y2="16"/>`,
    push: () => `<rect class="sk-main" x="17" y="12" width="14" height="12" rx="2"/>${arrow(4, 3, 14, 10)}${arrow(44, 33, 34, 26)}`,
    follow: () => `${person(24, 34, 22, "sk-sec")}${arrow(34, 22, 40, 6)}`,
    static: () => `<circle class="sk-main" cx="24" cy="14" r="6"/><line class="sk-guide" x1="24" y1="20" x2="16" y2="33"/><line class="sk-guide" x1="24" y1="20" x2="32" y2="33"/><line class="sk-guide" x1="24" y1="20" x2="24" y2="33"/>`,
    timelapse: () => `<circle class="sk-arrow" cx="24" cy="18" r="11" fill="none"/><line class="sk-arrow" x1="24" y1="18" x2="24" y2="11"/><line class="sk-arrow" x1="24" y1="18" x2="30" y2="21"/>`,
    slowmo: () => `<circle class="sk-main" cx="36" cy="18" r="6"/><circle class="sk-main" cx="23" cy="18" r="4.5" opacity=".55"/><circle class="sk-main" cx="13" cy="18" r="3.5" opacity=".3"/><circle class="sk-main" cx="6" cy="18" r="2.5" opacity=".15"/>`,
    close: () => `<circle class="sk-main" cx="26" cy="20" r="17"/><circle class="sk-light" cx="20" cy="14" r="3"/>`,
    wide: () => `<line class="sk-horizon" x1="0" y1="24" x2="48" y2="24"/><path class="sk-soft strong" d="M6 24 L12 10 L18 24 Z M30 24 V14 H42 V24 Z"/>${person(22, 31, 8, "sk-sec")}${person(28, 31, 7, "sk-sec")}`,
    selfie: () => `<circle class="sk-main" cx="24" cy="18" r="11"/><path class="sk-arrow" d="M19 21 Q24 26 29 21" fill="none" stroke-width="1.8"/><circle class="sk-inv-dot" cx="20" cy="15" r="1.6"/><circle class="sk-inv-dot" cx="28" cy="15" r="1.6"/>`,
    sound: () => `<path class="sk-main" d="M10 14 H16 L24 8 V28 L16 22 H10 Z"/><path class="sk-arrow" d="M29 12 Q34 18 29 24 M33 8 Q41 18 33 28" fill="none"/>`,
  };

  function cams(text) {
    const found = CAM.filter(([, , re]) => re.test(text)).slice(0, 3);
    if (!found.length) return "";
    return `<span class="cams">${found.map(([k, name]) =>
      `<span class="cam"><svg class="camv" viewBox="0 0 48 36"><rect class="sk-bg" x=".75" y=".75" width="46.5" height="34.5" rx="4"/>${ICON[k]()}<rect class="sk-border" x=".75" y=".75" width="46.5" height="34.5" rx="4"/></svg>${name}</span>`
    ).join("")}</span>`;
  }

  window.Sketch = { render, cams };
})();
