const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const shortMonths = monthNames.map(m => m.slice(0,3));
const num = v => Number.isFinite(Number(v)) ? Number(v) : null;
const byDate = (field) => (a,b) => new Date(b[field] || 0) - new Date(a[field] || 0);
const isRead = b => b.shelves?.includes("read") || Boolean(b.dateFinished);
const inYear = (book, year) => !year || year === "all" || (book.dateFinished || "").startsWith(String(year));
const validRating = b => num(b.myRating) !== null && Number(b.myRating) > 0;
const validPages = b => num(b.pages) !== null && Number(b.pages) >= 0;
function finishedBooks(books, year = new Date().getFullYear()) { return books.filter(b => isRead(b) && b.dateFinished && inYear(b, year)); }
function median(values) { const v = values.filter(x => x !== null && !Number.isNaN(x)).sort((a,b)=>a-b); return v.length ? (v[Math.floor((v.length-1)/2)] + v[Math.ceil((v.length-1)/2)]) / 2 : null; }
function average(values) { const v = values.filter(x => x !== null && !Number.isNaN(x)); return v.length ? v.reduce((a,b)=>a+b,0) / v.length : null; }
function countBy(items, fn) { return items.reduce((m, item) => { const k = fn(item); if (k) m[k] = (m[k] || 0) + 1; return m; }, {}); }
function statsFor(books, year = new Date().getFullYear()) {
  const finished = finishedBooks(books, year);
  const allFinished = books.filter(b => isRead(b) && b.dateFinished);
  const ratings = finished.filter(validRating).map(b => Number(b.myRating));
  const pages = finished.filter(validPages).map(b => Number(b.pages));
  const tbr = books.filter(b => b.shelves?.includes("to-read"));
  const months = Array.from({ length: 12 }, (_, i) => {
    const ms = finished.filter(b => new Date(b.dateFinished).getMonth() === i);
    return { month: shortMonths[i], books: ms.length, pages: ms.reduce((s,b)=>s+(Number(b.pages)||0),0) };
  });
  const authors = Object.entries(countBy(finished.flatMap(b => b.authors || []), x => x)).sort((a,b)=>b[1]-a[1]);
  const genreEntries = finished.flatMap(b => b.hardcoverData?.genres || []);
  const genres = Object.entries(countBy(genreEntries, x => x)).sort((a,b)=>b[1]-a[1]);
  const pace = finished.length ? Math.round(finished.length / Math.max(1, dayOfYear(new Date())) * daysInYear(new Date().getFullYear())) : 0;
  return {
    finished, allFinished, tbr, ratings, pages, months, authors, genres,
    booksRead: finished.length,
    pagesRead: pages.reduce((a,b)=>a+b,0),
    avgRating: average(ratings), medianRating: median(ratings),
    avgPages: average(pages), medianPages: median(pages),
    longest: finished.filter(validPages).sort((a,b)=>b.pages-a.pages)[0],
    shortest: finished.filter(validPages).sort((a,b)=>a.pages-b.pages)[0],
    topMonth: months.slice().sort((a,b)=>b.books-a.books)[0],
    projected: pace
  };
}
function daysInYear(y) { return new Date(y,1,29).getMonth() === 1 ? 366 : 365; }
function dayOfYear(d) { return Math.floor((d - new Date(d.getFullYear(),0,0)) / 86400000); }
function yearsAvailable(books) { return [...new Set(books.map(b => (b.dateFinished || "").slice(0,4)).filter(Boolean))].sort((a,b)=>b-a); }
function activityMap(books, year) { return countBy(finishedBooks(books, year), b => b.dateFinished); }
function authorStats(books, year = "all") {
  const finished = finishedBooks(books, year);
  const map = {};
  finished.forEach(book => (book.authors || ["Unknown"]).forEach(author => {
    map[author] ||= { author, books: [], pages: 0, ratings: [] };
    map[author].books.push(book); map[author].pages += Number(book.pages) || 0;
    if (validRating(book)) map[author].ratings.push(Number(book.myRating));
  }));
  return Object.values(map).map(a => ({ ...a, count: a.books.length, avgRating: average(a.ratings) })).sort((a,b)=>b.count-a.count || b.pages-a.pages);
}
function completionStreak(books, year) {
  const days = Object.keys(activityMap(books, year)).sort();
  if (days.length < 2) return null;
  let best = 1, run = 1;
  for (let i=1;i<days.length;i++) {
    const diff = (new Date(days[i]) - new Date(days[i-1])) / 86400000;
    run = diff === 1 ? run + 1 : 1; best = Math.max(best, run);
  }
  return best > 1 ? best : null;
}
