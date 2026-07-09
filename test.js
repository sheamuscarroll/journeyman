/* Data-integrity checks for players.js — run with: node test.js */
const fs = require("fs");
const html = fs.readFileSync(__dirname + "/index.html", "utf8");
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
if (scripts.length !== 1) { console.log("unexpected script count", scripts.length); process.exit(1); }
new Function(scripts[0]); // parse only — throws on syntax error
console.log("inline script parses OK");

const { TEAMS, PLAYERS, GREATS, DATA_UPDATED } = require("./players.js");

let errs = [];
const names = new Set();

if (!/\w+ \d{1,2}, \d{4}/.test(DATA_UPDATED)) errs.push("DATA_UPDATED not a date: " + DATA_UPDATED);
if (Object.keys(TEAMS).length !== 30) errs.push("expected 30 franchises, got " + Object.keys(TEAMS).length);
for (const [c, t] of Object.entries(TEAMS)) {
  if (!t.f) errs.push(c + ": missing founded year");
  (t.e || []).forEach((e, i, arr) => {
    if (i > 0 && arr[i - 1][1] >= e[1]) errs.push(c + ": era years out of order");
  });
}

for (const p of PLAYERS) {
  if (names.has(p.n)) errs.push("DUPLICATE NAME: " + p.n);
  names.add(p.n);
  if (![0, 1].includes(p.act)) errs.push(p.n + ": bad act");
  if (!p.s || !p.s.length) errs.push(p.n + ": no stints");
  let prevEnd = -1;
  p.s.forEach((s, i) => {
    const [t, a, b] = s;
    if (!TEAMS[t]) errs.push(p.n + ": unknown team " + t);
    if (b !== 0 && b < a) errs.push(p.n + ": stint end before start " + t);
    if (a < prevEnd) errs.push(p.n + ": stint " + t + " starts (" + a + ") before previous ended (" + prevEnd + ")");
    prevEnd = (b === 0 ? 9999 : b);
    if (b === 0 && i !== p.s.length - 1) errs.push(p.n + ": open stint not last");
    if (p.act === 0 && b === 0) errs.push(p.n + ": retired player has open stint");
  });
  if (p.act === 1 && p.s[p.s.length - 1][2] !== 0 && p.n !== "LeBron James")
    errs.push(p.n + ": active player has no open stint"); // LeBron: unsigned FA as of July 2026
}

for (const g of GREATS) {
  const p = PLAYERS.find(x => x.n === g);
  if (!p) errs.push("GREATS entry not in PLAYERS: " + g);
  else if (p.act !== 1) errs.push("GREATS entry not active: " + g);
}

// specific regression checks
const cur = n => { const p = PLAYERS.find(x => x.n === n); return p && p.s[p.s.length - 1][0]; };
if (cur("Bobby Portis") !== "MIA") errs.push("Bobby Portis should end on MIA (Giannis trade)");
if (cur("Giannis Antetokounmpo") !== "MIA") errs.push("Giannis should end on MIA");
if (PLAYERS.find(p => p.n === "David West")) errs.push("David West should be removed");
if (PLAYERS.find(p => p.n === "Joe Dumars")) errs.push("Joe Dumars should be removed");

const act = PLAYERS.filter(p => p.act === 1).length, all = PLAYERS.filter(p => p.act === 0).length;
console.log(`Players: ${PLAYERS.length} | active: ${act} | all-time pool: ${all + GREATS.size} (${all} retired + ${GREATS.size} active greats)`);
if (errs.length) { console.log("ERRORS:"); errs.forEach(e => console.log(" -", e)); process.exit(1); }
console.log("All data checks passed.");
