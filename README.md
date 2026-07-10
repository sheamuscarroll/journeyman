# 🏀 Journeyman

**A streak-based NBA trivia game about career team histories.**
Guess the player from their career path, or rebuild the path yourself — how long can your streak go?

**▶ Play it live: [sheamuscarroll.github.io/journeyman](https://sheamuscarroll.github.io/journeyman/)**

No accounts, no installs, works on desktop and mobile.

---

## Gameplay

| Mode | The challenge |
|---|---|
| **Who Am I?** | You see a career's team path (e.g. `SEA/OKC → GSW → BKN → PHX → HOU`). Name the player. Two escalating hints: position, then years. |
| **Career Path** | You get the player — rebuild the exact sequence of teams they played for. Tap to fill slots in order, or drag any team onto any slot. Lose, and you see your picks graded against the correct path. |

Each mode has an **Active** pool (current NBA players) and an **All-Time** pool (legends of every era, including today's stars), plus a global **hard mode**: a deeper pool of journeymen, role players, and old-school legends whose paths few people know — with no hints and separately tracked best streaks.

Details that make it play well:

- **Era-accurate franchises.** Shawn Kemp shows up as SEA, not OKC. Chris Webber's Washington years render as WSB/WAS. A player drafted by a team that later relocated gets a combined label (Kevin Durant: `SEA/OKC`). In Career Path mode, the team picker only offers franchises that existed during that player's career, under their era-correct names.
- **Fair guessing.** If two players share an identical career path, naming either counts. Ambiguous careers are excluded from hard mode entirely, and single-franchise careers never appear as puzzles.
- **Variety rules.** You'll never get the same player twice in a row, or two puzzles in a row with the same number of teams (unless it's a 4+ team journeyman — those are the fun ones).
- **Streaks.** One miss ends the run (with one second chance per player in Who Am I). Best streaks persist locally per mode and difficulty.

## Under the hood

- **Vanilla HTML/CSS/JavaScript** — a single page, no frameworks, no build step, no backend, no dependencies at runtime
- **Hand-curated database** of 285+ players with complete career stint data, current to the date shown in the site footer
- **Franchise era engine**: stints store only the modern franchise code; era-correct names, colors, and pickers are derived from a per-team timeline of relocations and renames
- **Automated testing** with Node.js: data-integrity checks (chronology, team codes, pinned current-team facts verified against news sources) and a 50+ assertion end-to-end suite that plays the game in a simulated browser (jsdom)
- **Continuous deployment** via GitHub Pages — every commit to `main` ships to production

## Run it locally

Open `index.html` in any browser. That's the whole setup.

To run the test suite ([Node.js](https://nodejs.org) required):

```bash
npm install   # installs jsdom (dev-only, used by the e2e suite)
npm test      # data-integrity checks + end-to-end gameplay tests
```

## Data model

Everything lives in `players.js`:

```js
{n:"Ja Morant", p:"PG", act:1, s:[["MEM",2019,2026],["POR",2026,0]]}
```

Each stint is `[team, fromYear, toYear]` (`0` = present), always using the modern franchise code — era names derive automatically. `WELL_KNOWN` controls the default pool (everyone else is hard-mode only), `GREATS` marks active players who also qualify for the All-Time pool, and `DATA_UPDATED` is displayed on the site. The test suite pins verified current-team facts, so a bad edit fails `npm test` before it can ship.

## Project structure

```
index.html   the entire game: markup, styles, and logic
players.js   player database + franchise era definitions
test.js      data-integrity checks
e2e.js       end-to-end gameplay tests (jsdom)
```

---

Built by [Sheamus Carroll](https://github.com/sheamuscarroll)
