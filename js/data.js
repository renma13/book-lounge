const BOOK_ORBIT_VERSION = 1;
const STORE = {
  settings: "bookOrbitSettings",
  books: "bookOrbitBooks",
  sync: "bookOrbitSync",
  hardcover: "bookOrbitHardcoverCache",
  version: "bookOrbitDataVersion",
  theme: "bookOrbitTheme"
};

const sampleBooks = [
  ["orb-001","The Glass Archive","Mira Vale",464,5,4.19,"read","2026-01-08","2026-01-20",2019,["Speculative","Mystery"],"The Archivists #1"],
  ["orb-002","Small Fires at Dawn","Theo March",288,4,3.88,"read","2026-01-18","2026-02-02",2021,["Literary","Contemporary"],""],
  ["orb-003","A Map of Borrowed Stars","Nadia Chen",512,5,4.32,"read","2026-02-07","2026-02-22",2024,["Fantasy","Adventure"],"Star Cartographers #2"],
  ["orb-004","Signal to the Sea","Iris Bell",336,3,3.71,"read","2026-02-24","2026-03-04",2017,["Romance","Historical"],""],
  ["orb-005","The Orchard Machine","Cal Reyes",408,4,4.01,"read","2026-03-03","2026-03-16",2020,["Science Fiction","Climate"],""],
  ["orb-006","Winter Library","Elena Frost",224,4,3.94,"read","2026-03-19","2026-03-24",2015,["Fantasy","Cozy"],""],
  ["orb-007","Ink and Salt","Rowan Pike",610,5,4.46,"read","2026-03-26","2026-04-12",2022,["Fantasy","Political"],"Salt Empire #1"],
  ["orb-008","Noon on Violet Street","Samira Holt",304,4,3.82,"read","2026-04-17","2026-04-25",2018,["Mystery","Contemporary"],""],
  ["orb-009","The Practical Ghost","June Arlo",272,5,4.11,"read","2026-05-02","2026-05-07",2023,["Fantasy","Humor"],""],
  ["orb-010","Deep Work for Dreamers","Luca Stone",352,4,4.04,"read","2026-05-11","2026-05-21",2020,["Nonfiction","Productivity"],""],
  ["orb-011","Fathom House","Bex Morgan",448,2,3.49,"read","2026-06-01","2026-06-18",2014,["Horror","Gothic"],""],
  ["orb-012","Paper Moons","Anika Sato",192,5,4.38,"read","2026-06-23","2026-06-25",2025,["Poetry","Literary"],""],
  ["orb-013","The Algorithm of Kindness","Priya Shah",384,4,4.08,"read","2026-07-01","2026-07-13",2021,["Nonfiction","Technology"],""],
  ["orb-014","River of Lanterns","Mira Vale",528,4,4.22,"read","2026-07-15","2026-08-01",2020,["Speculative","Mystery"],"The Archivists #2"],
  ["orb-015","Twelve Quiet Doors","Theo March",256,3,3.66,"read","2026-08-05","2026-08-11",2016,["Literary","Short Stories"],""],
  ["orb-016","Mooncalf & Company","Elena Frost",320,5,4.17,"read","2026-08-13","2026-08-22",2026,["Fantasy","Cozy"],""],
  ["orb-017","The Longest Index","Gavin Noor",704,4,4.27,"read","2026-09-02","2026-09-25",2012,["Science Fiction","Epic"],"Index Wars #3"],
  ["orb-018","Gentle Economics","Rae Kim",240,4,3.91,"read","2026-09-27","2026-10-03",2019,["Nonfiction","Economics"],""],
  ["orb-019","The Stone Orchard","Nadia Chen",432,0,4.09,"currently-reading","2026-10-04","",2026,["Fantasy","Adventure"],"Star Cartographers #3"],
  ["orb-020","Letters from Low Orbit","Cal Reyes",368,0,4.02,"currently-reading","2026-10-06","",2025,["Science Fiction","Epistolary"],""],
  ["orb-021","A Season of Teeth","Rowan Pike",544,0,4.13,"to-read","2025-11-14","",2023,["Fantasy","Political"],"Salt Empire #2"],
  ["orb-022","The Museum of Rain","Iris Bell",292,0,3.97,"to-read","2024-06-02","",2020,["Romance","Historical"],""],
  ["orb-023","Notebook Cities","Maya Jules",312,0,3.84,"to-read","2026-01-27","",2018,["Travel","Essays"],""],
  ["orb-024","The Kind Knife","Bex Morgan",396,0,3.74,"to-read","2023-04-10","",2021,["Horror","Thriller"],""],
  ["orb-025","Stars Under Glass","Nadia Chen",476,0,4.25,"to-read","2026-05-29","",2022,["Fantasy","Adventure"],"Star Cartographers #1"],
  ["orb-026","A Brief History of Tea Magic","June Arlo",208,0,4.06,"to-read","2026-07-09","",2024,["Fantasy","Cozy"],""],
  ["orb-027","Blueprint for Solitude","Rae Kim",288,0,3.89,"to-read","2022-02-18","",2016,["Nonfiction","Memoir"],""],
  ["orb-028","The Red Equation","Priya Shah",416,0,4.00,"to-read","2025-03-21","",2019,["Technology","Thriller"],""],
  ["orb-029","After the Harbor","Samira Holt",344,0,3.76,"did-not-finish","2026-04-01","",2017,["Mystery","Contemporary"],""],
  ["orb-030","The Cartographer Sleeps","Gavin Noor",590,0,3.68,"to-read","2021-09-08","",2011,["Science Fiction","Epic"],"Index Wars #1"]
].map((b, i) => ({
  goodreadsId: b[0], title: b[1], subtitle: "", authors: [b[2]], coverUrl: `https://picsum.photos/seed/book-orbit-${i + 1}/360/540`,
  goodreadsUrl: "#", isbn: "", isbn13: `97800000000${String(i).padStart(2,"0")}`, pages: b[3],
  publicationYear: b[9], averageRating: b[5], myRating: b[4], shelves: [b[6]], dateAdded: b[7],
  dateStarted: b[7], dateFinished: b[6] === "read" ? b[8] : "",
  hardcoverId: "", hardcoverData: { genres: b[10], tags: b[10], series: b[11] ? [b[11]] : [], publisher: "Orbit Demo Press", description: "Demo metadata for Book Orbit. Replace this with Goodreads RSS and optional Hardcover enrichment.", publicationDate: `${b[9]}-01-01`, authors: [b[2]] }
})).map((book, i) => {
  const finished = ["2026-01-20","2026-02-02","2026-02-22","2026-03-04","2026-03-16","2026-03-24","2026-04-12","2026-04-25","2026-05-07","2026-05-21","2026-06-18","2026-06-25","2026-07-13","2026-08-01","2026-08-11","2026-08-22","2026-09-25","2026-10-03"];
  if (book.shelves.includes("read")) book.dateFinished = finished[i];
  return book;
});

function readJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function writeJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function defaultSettings() {
  return { demoMode: true, goodreadsUserId: "", feeds: { read: "", current: "", tbr: "", dnf: "" }, customShelves: [], hardcoverToken: "", rssMethod: "direct", corsProxy: "", yearlyGoal: 100 };
}
function getSettings() { return { ...defaultSettings(), ...readJSON(STORE.settings, {}) }; }
function saveSettings(settings) { localStorage.setItem(STORE.version, String(BOOK_ORBIT_VERSION)); writeJSON(STORE.settings, settings); }
function getBooks() {
  const settings = getSettings();
  const saved = readJSON(STORE.books, []);
  return settings.demoMode || !saved.length ? sampleBooks : saved;
}
function saveBooks(books) { writeJSON(STORE.books, books); writeJSON(STORE.sync, { at: new Date().toISOString(), cached: true }); }
function getSyncInfo() { return readJSON(STORE.sync, null); }
function resetAllData() { Object.values(STORE).forEach(k => localStorage.removeItem(k)); }
