# 🏀 Journeyman

A streak-based NBA trivia game about career team histories. Live in your browser — no accounts, no installs.

**Play it:** `https://sheamuscarroll.github.io/journeyman/`

## Game modes

**Who Am I?** — You see a player's full career path (teams + years). Name the player. You get one second chance per player; a hint unlocks after a miss (position — plus debut year in hard mode). If two players share the *exact* same career path, naming either one counts.

**Hard mode** (toggle on the menu) — Years are hidden and repeat stints are collapsed, so all you get is the team sequence. Any career that would be ambiguous without years (e.g. a lone Lakers block that could be Kobe *or* Magic) is removed from the puzzle pool. Hard-mode best streaks are tracked separately.

**Career Path** — You get a player's name. Rebuild the exact sequence of teams they played for, in order. One wrong path ends the run. Only players with 2+ teams appear. The team picker is **era-accurate**: for Shawn Kemp you'll see SEA (not OKC), and franchises that didn't exist yet during a player's career don't appear at all.

Both modes come in two flavors:

- **Active** — current NBA players
- **All-Time** — legends from every era, *including* today's active greats (LeBron, Curry, Giannis…), with era-accurate franchises like the Sonics, Bullets, and New Jersey Nets

Score = your streak. Best streaks are saved locally per mode (hard mode separately).

## Tech

- Plain HTML/CSS/JavaScript — a single page, no frameworks, no build step, no backend
- Hand-curated database of ~270 players with full career stint data in `players.js`
- Franchise relocations/renames handled by an era system: stints store the modern
  franchise code, and the game derives the era-correct name (Kevin Durant's
  2007–16 block renders as "SEA/OKC")
- Best-streak persistence via `localStorage`
- Tested with Node: data-integrity checks (`test.js`) and a jsdom end-to-end suite (`e2e.js`)

## Run locally

Just open `index.html` in any browser. That's it.

To run the tests (requires [Node.js](https://nodejs.org)):

```
npm install
npm test
```

## Updating the data

Everything lives in `players.js`. Each player looks like:

```js
{n:"Ja Morant", p:"PG", act:1, s:[["MEM",2019,2026],["POR",2026,0]]}
```

`act:1` = active, `act:0` = all-time. Each stint is `[team, fromYear, toYear]`, and `0` means "present". Always use the modern franchise code (OKC, not SEA) — era names are derived automatically. If a player gets traded, close their last stint, add a new one, and bump `DATA_UPDATED` at the top of the file (it's shown on the site). Run `npm test` after editing to catch mistakes.

The site is deployed with GitHub Pages: any commit to `main` updates the live site automatically within a minute or two.

## Resume line (feel free to adapt)

> **Journeyman — NBA Career Trivia Web Game** · Designed and built a public web game (vanilla JS/HTML/CSS) with four game modes plus a hard-mode variant, autocomplete search, streak scoring, era-accurate franchise handling, and a hand-curated database of 270+ NBA career histories; wrote automated data-integrity and end-to-end tests (Node.js/jsdom) and deployed via GitHub Pages.

---

Built by Sheamus Carroll · Rosters current as of the date shown on the site (`DATA_UPDATED` in `players.js`)
