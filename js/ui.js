function $(sel, root = document) { return root.querySelector(sel); }
function $all(sel, root = document) { return [...root.querySelectorAll(sel)]; }
function fmt(n) { return n === null || n === undefined || Number.isNaN(n) ? "Not available" : Number(n).toLocaleString(); }
function one(n) { return n === null || n === undefined || Number.isNaN(n) ? "Not available" : Number(n).toFixed(1); }
function dateNice(d) { return d ? new Date(`${d}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "Not available"; }
function escapeHTML(s) { return String(s ?? "").replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m])); }
function cleanBookText(value) {
  const html = String(value || "").replace(/<br\s*\/?>/gi, "\n");
  const doc = new DOMParser().parseFromString(html, "text/html");
  return (doc.body.textContent || "").replace(/\n{3,}/g, "\n\n").trim();
}
function pageName() { return location.pathname.split("/").pop() || "index.html"; }
function applyTheme() { document.documentElement.dataset.theme = localStorage.getItem(STORE.theme) || "light"; }
function setTheme(theme) { localStorage.setItem(STORE.theme, theme); applyTheme(); }
function navHTML() {
  const items = [["index.html","bar-chart-3","Dashboard"],["library.html","library","Library"],["analytics.html","line-chart","Analytics"],["tbr.html","book-open","TBR"],["authors.html","pen-tool","Authors"],["history.html","clock","History"],["wrapped.html","sparkles","Wrapped"],["settings.html","settings","Settings"]];
  return `<aside class="sidebar"><a class="brand" href="index.html"><strong>BOOK ORBIT</strong><span>Your reading life, visualized.</span></a><nav>${items.map(([href,icon,label])=>`<a class="${pageName()===href?"active":""}" href="${href}"><i data-lucide="${icon}"></i>${label}</a>`).join("")}</nav></aside><nav class="mobile-nav">${items.map(([href,icon,label])=>`<a class="${pageName()===href?"active":""}" href="${href}" aria-label="${label}"><i data-lucide="${icon}"></i><span>${label}</span></a>`).join("")}</nav>`;
}
function shell(title, subtitle) {
  document.body.insertAdjacentHTML("afterbegin", navHTML());
  $(".page")?.insertAdjacentHTML("afterbegin", `<header class="page-header"><div><p class="eyebrow">Book Orbit</p><h1>${title}</h1><p>${subtitle}</p></div><button class="icon-btn" id="themeToggle" aria-label="Toggle theme"><i data-lucide="sun-moon"></i></button></header>`);
  $("#themeToggle")?.addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
  lucide.createIcons();
}
function cover(book) { return `<img class="cover" src="${book.coverUrl || `https://picsum.photos/seed/${encodeURIComponent(book.title)}/360/540`}" alt="Cover of ${escapeHTML(book.title)}" loading="lazy">`; }
function bookCard(book) {
  return `<button class="book-card" data-book="${escapeHTML(book.goodreadsId)}">${cover(book)}<span class="title">${escapeHTML(book.title)}</span><span>${escapeHTML(book.authors?.join(", ") || "Unknown author")}</span><small>${book.myRating ? `Rating: ${"★".repeat(book.myRating)}` : escapeHTML(book.shelves?.[0] || "")}</small></button>`;
}
function attachBookModals(books) {
  $all("[data-book]").forEach(el => el.addEventListener("click", () => openBookModal(books.find(b => b.goodreadsId === el.dataset.book))));
}
function openBookModal(book) {
  if (!book) return;
  const genres = bookGenres(book);
  const description = cleanBookText(book.hardcoverData?.description);
  document.body.insertAdjacentHTML("beforeend", `<div class="modal-backdrop" role="dialog" aria-modal="true"><div class="modal"><button class="icon-btn close" aria-label="Close"><i data-lucide="x"></i></button>${cover(book)}<div><p class="eyebrow">${escapeHTML(book.shelves?.join(", ") || "Book")}</p><h2>${escapeHTML(book.title)}</h2><p class="muted">${escapeHTML(book.authors?.join(", ") || "Unknown author")}</p><div class="meta-grid"><span>My rating <b>${book.myRating || "Not available"}</b></span><span>Goodreads avg <b>${book.averageRating || "Not available"}</b></span><span>Pages <b>${book.pages || "Not available"}</b></span><span>Published <b>${book.publicationYear || "Not available"}</b></span><span>Added <b>${dateNice(book.dateAdded)}</b></span><span>Finished <b>${dateNice(book.dateFinished)}</b></span></div>${genres.length ? `<p class="chips">${genres.map(g=>`<span>${escapeHTML(g)}</span>`).join("")}</p>` : ""}<p class="description">${escapeHTML(description || "No description available.")}</p>${book.goodreadsUrl && book.goodreadsUrl !== "#" ? `<a class="button" href="${book.goodreadsUrl}" target="_blank" rel="noreferrer">Open Goodreads</a>` : ""}</div></div></div>`);
  lucide.createIcons();
  $(".modal-backdrop").addEventListener("click", e => { if (e.target.classList.contains("modal-backdrop") || e.target.closest(".close")) e.currentTarget.remove(); });
}
function drawChart(id, type, data, options = {}) {
  const ctx = document.getElementById(id);
  if (!ctx || !window.Chart) return;
  return new Chart(ctx, { type, data, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: type !== "bar" && type !== "line" } }, ...options } });
}
function renderHeatmap(el, books, year) {
  const map = activityMap(books, year), start = new Date(year,0,1), days = daysInYear(year);
  const blanks = Array.from({ length: start.getDay() }, () => `<span class="heat blank" aria-hidden="true"></span>`);
  const cells = Array.from({length: days}, (_, i) => {
    const d = new Date(start); d.setDate(start.getDate() + i);
    const key = localDateKey(d), count = map[key] || 0;
    return `<span class="heat h${Math.min(4,count)}" title="${d.toLocaleDateString(undefined,{month:"long",day:"numeric"})}: ${count ? `${count} book${count>1?"s":""} finished` : "No completed books"}"></span>`;
  });
  el.innerHTML = [...blanks, ...cells].join("");
}
function syncBanner() {
  const s = getSyncInfo(), settings = getSettings();
  return `<div class="notice">${settings.demoMode ? "Demo Mode" : s?.at ? `Last synced ${dateNice(s.at.slice(0,10))}. Cached data stays available if refresh fails.` : "Connect Goodreads RSS in Settings to get started."}</div>`;
}
