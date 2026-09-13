(() => {
  const trip = window.TRIP;
  const tg = window.Telegram && window.Telegram.WebApp;
  const inTelegram = !!(tg && tg.initData);
  const cloud = inTelegram && tg.isVersionAtLeast && tg.isVersionAtLeast("6.9") ? tg.CloudStorage : null;

  if (inTelegram) {
    document.documentElement.classList.add("tg");
    tg.ready();
    tg.expand();
  }

  // ── storage: one key per checkbox, Telegram CloudStorage with localStorage mirror ──
  const LS = "tq:";
  const state = new Set();
  const ui = { filter: "all", hideDone: false, open: new Set() };

  function lsGet(k) { try { return localStorage.getItem(k); } catch { return null; } }
  function lsSet(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch {} }

  function loadLocal() {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k.startsWith(LS + "c_")) state.add(k.slice(LS.length));
      }
      const u = JSON.parse(lsGet(LS + "ui") || "{}");
      if (u.filter) ui.filter = u.filter;
      ui.hideDone = !!u.hideDone;
    } catch {}
  }

  function loadCloud() {
    return new Promise((resolve) => {
      if (!cloud) return resolve(false);
      cloud.getKeys((err, keys) => {
        if (err || !keys) return resolve(false);
        const ours = keys.filter((k) => k.startsWith("c_"));
        state.clear();
        ours.forEach((k) => state.add(k));
        // cloud is the source of truth; refresh the local mirror
        try {
          Object.keys(localStorage).filter((k) => k.startsWith(LS + "c_")).forEach((k) => localStorage.removeItem(k));
        } catch {}
        ours.forEach((k) => lsSet(LS + k, "1"));
        resolve(true);
      });
    });
  }

  function setChecked(key, on) {
    on ? state.add(key) : state.delete(key);
    lsSet(LS + key, on ? "1" : null);
    if (cloud) on ? cloud.setItem(key, "1") : cloud.removeItem(key);
    if (tg && tg.HapticFeedback) on ? tg.HapticFeedback.notificationOccurred("success") : tg.HapticFeedback.selectionChanged();
  }

  function saveUi() { lsSet(LS + "ui", JSON.stringify({ filter: ui.filter, hideDone: ui.hideDone })); }

  // CloudStorage keys: A-Z a-z 0-9 _ - only, ≤128 chars
  const safe = (s) => String(s).replace(/[^A-Za-z0-9_-]/g, "-");
  function hash(s) {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36);
  }
  const itemKey = (item) => `c_${safe(item.id)}`;
  const subKey = (item, list, text) => `c_${safe(item.id)}_${safe(list.id)}_${hash(text)}`;

  // ── helpers ──
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (s) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");

  function openUrl(url) {
    if (inTelegram && tg.openLink) tg.openLink(url);
    else window.open(url, "_blank", "noopener");
  }
  const routeUrl = (p) => `https://www.google.com/maps/dir/?api=1&travelmode=transit&destination=${encodeURIComponent(p.q || p.address || p.name)}`;
  const mapUrl = (p) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.q || p.address || p.name)}`;

  const isMultiDay = (item) => item.days.length > 1;
  const todayIso = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  function rangeLabel(days) {
    const byDate = Object.fromEntries(trip.days.map((d) => [d.date, d]));
    const nums = days.map((d) => Number(d.slice(8)));
    const month = byDate[days[0]] ? byDate[days[0]].label.split(" ").slice(-1)[0] : "";
    return `${Math.min(...nums)}–${Math.max(...nums)} ${month} · будь-який день`;
  }

  // ── render ──
  function renderProgress() {
    for (const type of ["main", "side"]) {
      const items = trip.items.filter((i) => i.type === type);
      const done = items.filter((i) => state.has(itemKey(i))).length;
      document.getElementById(`p-${type}`).textContent = `${done} / ${items.length}`;
      document.getElementById(`b-${type}`).style.width = items.length ? `${(done / items.length) * 100}%` : "0";
    }
  }

  // checklist entries are either "text" or { text, how: ["detail line", ...] }
  const entryText = (t) => (typeof t === "string" ? t : t.text);

  function checklistHtml(item, list) {
    const keys = list.items.map((t) => subKey(item, list, entryText(t)));
    const done = keys.filter((k) => state.has(k)).length;
    return `<div class="clist">
      <div class="clist-head"><span>${fmt(list.title)}</span><span class="cnt">${done}/${keys.length}</span></div>
      ${list.note ? `<div class="clist-note">${fmt(list.note)}</div>` : ""}
      <ul>${list.items.map((t, i) => {
        const on = state.has(keys[i]);
        const how = typeof t === "string" || !t.how ? "" : `<ul class="how">${t.how.map((h) => `<li>${fmt(h)}</li>`).join("")}</ul>`;
        return `<li class="${on ? "on" : ""}" data-key="${keys[i]}"><button class="check ${on ? "on" : ""}" aria-label="відмітити"></button><span><span class="ctext">${fmt(entryText(t))}</span>${how}</span></li>`;
      }).join("")}</ul>
    </div>`;
  }

  function cardHtml(item) {
    const key = itemKey(item);
    const done = state.has(key);
    const open = ui.open.has(item.id);
    const p = item.place;
    const tag = item.type === "main" ? "◆ Сюжет" : "✦ Квест";
    const metaBits = [item.time, p && p.name].filter(Boolean).map(esc).join(" · ");

    const body = [];
    if (p) {
      body.push(`<div class="actions">
        <button class="btn" data-url="${esc(routeUrl(p))}">🚇 Маршрут</button>
        <button class="btn ghost" data-url="${esc(mapUrl(p))}">📍 На карті</button>
      </div>`);
      if (p.address) body.push(`<div class="addr">${fmt(p.address)}</div>`);
    }
    if (item.transit) body.push(`<div class="sec"><h3>Як дістатися</h3><p>${fmt(item.transit)}</p></div>`);
    if (item.hours && item.hours.length) body.push(`<div class="sec"><h3>Години</h3><ul class="hours">${item.hours.map((h) => `<li>${fmt(h)}</li>`).join("")}</ul></div>`);
    if (item.description) body.push(`<div class="sec"><h3>Опис</h3><p>${fmt(item.description)}</p></div>`);
    if (item.story) body.push(`<div class="sec"><h3>📜 Цікава історія</h3><p class="story">${fmt(item.story)}</p></div>`);
    (item.checklists || []).forEach((l) => body.push(checklistHtml(item, l)));
    if (item.tips && item.tips.length) body.push(`<div class="sec"><h3>💡 Поради</h3><ul class="tips">${item.tips.map((t) => `<li>${fmt(t)}</li>`).join("")}</ul></div>`);
    if (item.links && item.links.length) body.push(`<div class="sec links">${item.links.map((l) => `<a href="#" data-url="${esc(l.url)}">${esc(l.label)} ↗</a>`).join("")}</div>`);

    return `<article class="card ${item.type} ${done ? "done" : ""} ${open ? "open" : ""}" data-id="${esc(item.id)}">
      <div class="head">
        <button class="check ${done ? "on" : ""}" data-key="${key}" aria-label="виконано"></button>
        <div class="htext">
          <span class="tag">${tag}</span>
          <div class="title">${item.emoji ? esc(item.emoji) + " " : ""}${fmt(item.title)}</div>
          ${metaBits ? `<div class="meta">${metaBits}</div>` : ""}
        </div>
        <span class="chev">›</span>
      </div>
      <div class="body">${body.join("")}</div>
    </article>`;
  }

  function visible(item) {
    if (ui.filter !== "all" && item.type !== ui.filter) return false;
    if (ui.hideDone && state.has(itemKey(item))) return false;
    return true;
  }

  function sectionHtml(label, title, items, extraClass = "") {
    const shown = items.filter(visible).sort((a, b) => (a.type === b.type ? 0 : a.type === "main" ? -1 : 1));
    if (!items.length) return "";
    return `<section class="day ${extraClass}">
      <h2><b>${esc(title)}</b><span>${esc(label)}</span></h2>
      ${shown.length ? shown.map(cardHtml).join("") : `<div class="empty">Тут усе виконано або приховано фільтром ✓</div>`}
    </section>`;
  }

  function render() {
    renderProgress();
    const today = todayIso();
    let html = "";
    for (const d of trip.days) {
      const items = trip.items.filter((i) => !isMultiDay(i) && i.days[0] === d.date);
      html += sectionHtml(d.label, d.title, items, d.date === today ? "today" : "");
    }
    // multi-day quests grouped by their exact day range
    const groups = new Map();
    trip.items.filter(isMultiDay).forEach((i) => {
      const k = i.days.join(",");
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(i);
    });
    for (const [k, items] of groups) {
      html += sectionHtml(rangeLabel(k.split(",")), "Побічні квести", items);
    }
    document.getElementById("list").innerHTML = html;
    document.querySelectorAll("#filters button").forEach((b) => b.classList.toggle("on", b.dataset.f === ui.filter));
    document.getElementById("hide-done").checked = ui.hideDone;
  }

  // ── events ──
  document.getElementById("list").addEventListener("click", (e) => {
    const urlEl = e.target.closest("[data-url]");
    if (urlEl) { e.preventDefault(); openUrl(urlEl.dataset.url); return; }

    const li = e.target.closest(".clist li[data-key]");
    if (li) { setChecked(li.dataset.key, !state.has(li.dataset.key)); render(); return; }

    const check = e.target.closest(".head .check");
    if (check) { setChecked(check.dataset.key, !state.has(check.dataset.key)); render(); return; }

    const head = e.target.closest(".head");
    if (head) {
      const id = head.parentElement.dataset.id;
      ui.open.has(id) ? ui.open.delete(id) : ui.open.add(id);
      head.parentElement.classList.toggle("open");
    }
  });

  document.getElementById("filters").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    ui.filter = b.dataset.f;
    saveUi();
    render();
  });
  document.getElementById("hide-done").addEventListener("change", (e) => {
    ui.hideDone = e.target.checked;
    saveUi();
    render();
  });

  // ── boot ──
  document.getElementById("title").textContent = trip.title;
  document.getElementById("subtitle").textContent = trip.subtitle || "";
  document.getElementById("info-list").innerHTML = (trip.info || []).map((t) => `<li>${fmt(t)}</li>`).join("");
  document.getElementById("info").hidden = !(trip.info && trip.info.length);
  if (inTelegram && tg.setHeaderColor) tg.setHeaderColor("bg_color");

  loadLocal();
  render();
  loadCloud().then((ok) => {
    document.getElementById("sync").textContent = ok
      ? "☁️ Галочки синхронізуються з твоїм Telegram"
      : inTelegram ? "Галочки зберігаються на цьому пристрої" : "Відкрито поза Telegram — галочки лише в цьому браузері";
    if (ok) render();
  });
})();
