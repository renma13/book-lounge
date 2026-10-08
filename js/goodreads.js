function rssUrl(url, settings) {
  if (settings.rssMethod === "proxy" && settings.corsProxy) return settings.corsProxy.replace("{URL}", encodeURIComponent(url));
  return url;
}
async function fetchRSS(url, settings) {
  try {
    const res = await fetch(rssUrl(url, settings));
    if (!res.ok) throw new Error(`RSS request failed (${res.status})`);
    const text = await res.text();
    const xml = new DOMParser().parseFromString(text, "text/xml");
    if (xml.querySelector("parsererror")) throw new Error("Your RSS feed returned invalid XML.");
    return xml;
  } catch (error) {
    if (settings.rssMethod === "direct" && settings.corsProxy) {
      try {
        const res = await fetch(settings.corsProxy.replace("{URL}", encodeURIComponent(url)));
        if (!res.ok) throw new Error(`Proxy request failed (${res.status})`);
        return new DOMParser().parseFromString(await res.text(), "text/xml");
      } catch {}
    }
    throw new Error(error.message.includes("Failed to fetch") ? "The browser blocked or could not reach this Goodreads RSS feed. Try a configured CORS proxy." : error.message);
  }
}
function textOf(node, selectors) {
  for (const sel of selectors) {
    const el = node.querySelector(sel);
    if (el?.textContent?.trim()) return el.textContent.trim();
  }
  return "";
}
function parseGoodreadsXML(xml, shelf) {
  return [...xml.querySelectorAll("item")].map(item => {
    const title = textOf(item, ["title"]);
    const author = textOf(item, ["author_name","book_author","dc\\:creator","creator"]);
    const id = textOf(item, ["book_id","guid"]) || normalizeKey(title + author);
    const shelves = textOf(item, ["user_shelves","shelves"]).split(",").map(s=>s.trim()).filter(Boolean);
    if (shelf && !shelves.includes(shelf)) shelves.push(shelf);
    return {
      goodreadsId: id, title, subtitle: "", authors: author ? [author] : [], coverUrl: textOf(item, ["book_large_image_url","book_medium_image_url","book_small_image_url"]),
      goodreadsUrl: textOf(item, ["link"]), isbn: textOf(item, ["isbn"]), isbn13: textOf(item, ["isbn13"]),
      pages: Number(textOf(item, ["num_pages"])) || null, publicationYear: Number(textOf(item, ["book_published"])) || null,
      averageRating: Number(textOf(item, ["average_rating"])) || null, myRating: Number(textOf(item, ["user_rating"])) || 0,
      shelves, dateAdded: parseDate(textOf(item, ["user_date_added","pubDate"])), dateStarted: parseDate(textOf(item, ["user_date_started"])),
      dateFinished: parseDate(textOf(item, ["user_read_at","user_date_read"])), hardcoverId: "",
      hardcoverData: { genres: [], tags: [], series: [], publisher: "", description: textOf(item, ["book_description","description"]), publicationDate: "", authors: author ? [author] : [] }
    };
  });
}
function parseDate(value) { const d = value ? new Date(value) : null; return d && !isNaN(d) ? d.toISOString().slice(0,10) : ""; }
function normalizeKey(value) { return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
function mergeBooks(books) {
  const map = new Map();
  books.forEach(book => {
    const key = book.goodreadsId || book.isbn13 || book.isbn || normalizeKey(`${book.title}-${book.authors?.[0] || ""}`);
    const existing = map.get(key) || {};
    map.set(key, {
      ...existing, ...book,
      shelves: [...new Set([...(existing.shelves || []), ...(book.shelves || [])])],
      hardcoverData: { ...(existing.hardcoverData || {}), ...(book.hardcoverData || {}) }
    });
  });
  return [...map.values()];
}
async function refreshGoodreadsData(settings) {
  const feeds = [
    ["read", settings.feeds.read], ["currently-reading", settings.feeds.current], ["to-read", settings.feeds.tbr], ["did-not-finish", settings.feeds.dnf],
    ...(settings.customShelves || []).map(s => [s.name, s.url])
  ].filter(([,url]) => url);
  const results = [], books = [];
  for (const [shelf, url] of feeds) {
    try { const xml = await fetchRSS(url, settings); books.push(...parseGoodreadsXML(xml, shelf)); results.push({ shelf, ok: true }); }
    catch (error) { results.push({ shelf, ok: false, error: error.message }); }
  }
  if (books.length) saveBooks(mergeBooks([...getBooks().filter(b => !b.goodreadsId?.startsWith("orb-")), ...books]));
  return results;
}
