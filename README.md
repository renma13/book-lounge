# Book Orbit

Book Orbit is a static personal reading analytics dashboard for GitHub Pages. It combines Goodreads RSS shelf data, optional Hardcover metadata, client-side calculations, charts, history, TBR tools, author analytics, and a year-in-books recap.

It has no backend, no database, no authentication, and no build step. Upload the files to a GitHub repository and enable GitHub Pages.

## Features

- Dashboard with books read, pages read, average rating, TBR size, reading goal progress, current reads, recent finishes, insights, and a completion activity heatmap
- Library with search, filtering, sorting, and book detail modals
- Analytics for pace, ratings, genres, authors, book length, publication years, and reading history
- TBR page with age buckets and a random next-read picker
- Author explorer
- Chronological history page
- Wrapped-style yearly recap
- Light and dark mode
- Demo Mode with fictional sample books
- Local-only settings and cache through `localStorage`

## 1. Goodreads Setup

Book Orbit uses Goodreads RSS as the source of truth for shelves, reading activity, ratings, dates, and reading history.

Find your Goodreads user ID, then your shelf RSS URLs usually follow this shape:

```text
https://www.goodreads.com/review/list_rss/YOUR_USER_ID?shelf=read
https://www.goodreads.com/review/list_rss/YOUR_USER_ID?shelf=currently-reading
https://www.goodreads.com/review/list_rss/YOUR_USER_ID?shelf=to-read
https://www.goodreads.com/review/list_rss/YOUR_USER_ID?shelf=did-not-finish
```

Replace `YOUR_USER_ID`, but paste your actual generated or working RSS URLs into the Settings page.

Custom shelves use the same pattern:

```text
https://www.goodreads.com/review/list_rss/YOUR_USER_ID?shelf=SHELF_NAME
```

Goodreads RSS feeds are limited, so Book Orbit can only visualize the books returned by each configured feed.

## 2. Hardcover Setup

Hardcover is optional. Book Orbit remains usable without it.

1. Sign into Hardcover.
2. Open the API settings.
3. Create or copy an API token.
4. Paste it into Book Orbit Settings.
5. Click **Test Hardcover Connection**.
6. Never commit the token to GitHub.

Hardcover uses Bearer authentication against:

```text
https://api.hardcover.app/v1/graphql
```

The token is stored only in your browser's `localStorage`. That is convenient for a personal app, but it is not a secure secret vault.

## CORS

Browsers may block direct Goodreads RSS requests. In Settings, choose either:

- `Direct`
- `CORS proxy`

If you use a proxy, provide a URL template with `{URL}` where the encoded Goodreads RSS URL should go, for example:

```text
https://api.allorigins.win/raw?url={URL}
```

Book Orbit does not hard-code a proxy or assume any proxy is guaranteed to work.

## GitHub Pages Deployment

1. Create a GitHub repository.
2. Upload this folder's files.
3. Commit them to your chosen branch.
4. In GitHub, open **Settings → Pages**.
5. Choose the branch and folder that contain `index.html`.
6. Open the generated GitHub Pages URL.

The app uses relative paths, so it works at:

```text
https://USERNAME.github.io/REPOSITORY/
```

## Local Development

Because this is a static site, you can open `index.html` directly. For a closer GitHub Pages-like test, serve the folder with any simple local web server.

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

## Data And Privacy

Book Orbit stores settings, cached RSS books, cached Hardcover data, selected theme, dashboard preferences, and the yearly reading goal in your browser's `localStorage`.

No real tokens or credentials are stored in source files.

## Final Setup Checklist

GOODREADS USER ID  
[PASTE HERE]

READ RSS  
[PASTE HERE]

CURRENTLY READING RSS  
[PASTE HERE]

TO-READ RSS  
[PASTE HERE]

DID-NOT-FINISH RSS  
[PASTE HERE]

CUSTOM SHELF RSS  
[OPTIONAL]

HARDCOVER API TOKEN  
[PASTE HERE IN THE APP'S SETTINGS PAGE — NEVER INTO THE CODE]

RSS CORS PROXY  
[OPTIONAL]
