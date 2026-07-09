# 🏀 Journeyman

A streak-based NBA trivia game about career team histories. Live in your browser — no accounts, no installs.

**Play it:** `https://sheamuscarroll.github.io/journeyman/` (after you deploy — see below)

## Game modes

**Who Am I?** — You see a player's full career path (teams + years). Name the player. You get one second chance per player; a hint (position + debut year) unlocks after a miss.

**Career Path** — You get a player's name. Rebuild the exact sequence of teams they played for, in order. One wrong path ends the run.

Both modes come in two flavors:

- **Active** — current NBA players (rosters current as of July 2026)
- **All-Time** — legends from every era, including historical franchises like the Seattle SuperSonics, Washington Bullets, and New Jersey Nets

Score = your streak. Best streaks are saved locally per mode.

## Tech

- Plain HTML/CSS/JavaScript — a single page, no frameworks, no build step, no backend
- Hand-curated database of ~275 players (~110 all-time, ~165 active) with full career stint data in `players.js`
- Best-streak persistence via `localStorage`
- Tested with Node: data-integrity checks (`test.js`) and a jsdom end-to-end suite (`e2e.js`)

## Run locally

Just open `index.html` in any browser. That's it.

To run the tests (requires [Node.js](https://nodejs.org)):

```
npm install
npm test
```

## Deploy to GitHub Pages (free, ~5 minutes)

1. Go to [github.com/new](https://github.com/new) (log in as `sheamuscarroll`).
2. Repository name: `journeyman`. Keep it **Public**. Click **Create repository**.
3. On the new repo page, click **uploading an existing file**.
4. Drag in these files: `index.html`, `players.js`, `README.md`, `test.js`, `e2e.js`, `package.json`, `.gitignore` (do **not** upload `node_modules` if it exists). Click **Commit changes**.
5. In the repo, go to **Settings → Pages** (left sidebar).
6. Under *Build and deployment*, set **Source** to "Deploy from a branch", **Branch** to `main` / `(root)`, and click **Save**.
7. Wait a minute, refresh the page — your site is live at
   `https://sheamuscarroll.github.io/journeyman/`

Any time you edit a file (e.g. update `players.js` after a trade), upload the new version to the repo and the site updates automatically.

## Updating the data

Everything lives in `players.js`. Each player looks like:

```js
{n:"Ja Morant", p:"PG", act:1, s:[["MEM",2019,2026],["POR",2026,0]]}
```

`act:1` = active, `act:0` = all-time. Each stint is `[team, fromYear, toYear]`, and `0` means "present". If a player gets traded, close their last stint and add a new one. Run `npm test` after editing to catch typos.

## Resume line (feel free to adapt)

> **Journeyman — NBA Career Trivia Web Game** · Designed and built a public web game (vanilla JS/HTML/CSS) with four game modes, autocomplete search, streak scoring, and a hand-curated database of 275+ NBA player career histories; wrote automated data-integrity and end-to-end tests (Node.js/jsdom) and deployed via GitHub Pages.

---

Built by Sheamus Carroll · Data compiled July 2026
