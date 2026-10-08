const HARDCOVER_ENDPOINT = "https://api.hardcover.app/v1/graphql";
async function hardcoverRequest(query, variables = {}, token = getSettings().hardcoverToken) {
  if (!token) throw new Error("No Hardcover API token saved.");
  const res = await fetch(HARDCOVER_ENDPOINT, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${token}` }, body: JSON.stringify({ query, variables }) });
  if (res.status === 401 || res.status === 403) throw new Error("Hardcover rejected the API token.");
  if (!res.ok) throw new Error(`Hardcover could not be reached (${res.status}).`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data;
}
async function testHardcover(token) {
  await hardcoverRequest("query { me { id username } }", {}, token);
  return true;
}
async function enrichBook(book, force = false) {
  const key = book.isbn13 || book.isbn || book.goodreadsId;
  if (!key) return book;
  const cache = readJSON(STORE.hardcover, {});
  const cached = cache[key];
  if (!force && cached && Date.now() - cached.timestamp < 1000 * 60 * 60 * 24 * 30) return { ...book, hardcoverData: { ...book.hardcoverData, ...cached.data } };
  const query = `query FindBook($query: String!) { search(query: $query, query_type: "Book", per_page: 1, page: 1) { results } }`;
  const data = await hardcoverRequest(query, { query: book.isbn13 || `${book.title} ${book.authors?.[0] || ""}` });
  const result = data?.search?.results?.[0]?.document || data?.search?.results?.[0] || {};
  const enriched = { genres: result.genres?.map(g=>g.name) || [], tags: result.tags?.map(t=>t.name) || [], series: result.series_names || [], publisher: result.publisher || "", description: result.description || "", publicationDate: result.release_date || "", authors: result.author_names || book.authors };
  cache[key] = { timestamp: Date.now(), data: enriched };
  writeJSON(STORE.hardcover, cache);
  return { ...book, hardcoverId: result.id || book.hardcoverId, hardcoverData: { ...book.hardcoverData, ...enriched } };
}
async function refreshHardcoverData(force = false) {
  const books = getBooks(), out = [];
  for (const book of books) { try { out.push(await enrichBook(book, force)); } catch { out.push(book); } }
  saveBooks(out); return out;
}
