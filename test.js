const fs = require("fs");
const html = fs.readFileSync(__dirname + "/index.html", "utf8");
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
if (scripts.length !== 1) { console.log("unexpected script count", scripts.length); process.exit(1); }
new Function(scripts[0]); // parse only — throws on syntax error
console.log("inline script parses OK");

const { TEAMS, PLAYERS } = require("./players.js");
function mergedPath(p) { const out = []; for (const s of p.s) if (!out.length || out[out.length - 1] !== s[0]) out.push(s[0]); return out; }
function norm(s) { return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim(); }

let fail = 0;
function expect(label, got, want) {
  const ok = got === want;
  if (!ok) fail++;
  console.log((ok ? "PASS" : "FAIL"), label, "->", got, ok ? "" : ("(expected " + want + ")"));
}

expect("MJ merged", mergedPath(PLAYERS.find(p => p.n === "Michael Jordan")).join(">"), "CHI>WAS");
expect("LeBron merged", mergedPath(PLAYERS.find(p => p.n === "LeBron James")).join(">"), "CLE>MIA>CLE>LAL");
expect("Poeltl merged", mergedPath(PLAYERS.find(p => p.n === "Jakob Poeltl")).join(">"), "TOR>SAS>TOR");
expect("norm apostrophe", norm("De'Aaron Fox"), "deaaron fox");
expect("norm case/space", norm("  LEBRON   james "), "lebron james");

const badActive = PLAYERS.filter(p => p.act === 1 && mergedPath(p).some(c => TEAMS[c].h));
expect("no active player uses historical team codes", badActive.length, 0);

for (const [lbl, fl] of [["active", 1], ["all-time", 0]]) {
  const ps = PLAYERS.filter(p => p.act === fl);
  const multi = ps.filter(p => mergedPath(p).length > 1).length;
  console.log(`${lbl}: total ${ps.length}, multi-team ${multi}, single-team ${ps.length - multi}`);
}

// spot-check a few current teams
const cur = n => { const p = PLAYERS.find(x => x.n === n); const s = p.s[p.s.length - 1]; return s[0]; };
expect("Giannis now", cur("Giannis Antetokounmpo"), "MIA");
expect("Harden now", cur("James Harden"), "CLE");
expect("AD now", cur("Anthony Davis"), "WAS");
expect("Morant now", cur("Ja Morant"), "POR");
expect("Kessler now", cur("Walker Kessler"), "LAL");
expect("JJJ now", cur("Jaren Jackson Jr."), "UTA");
expect("CP3 is all-time", PLAYERS.find(p => p.n === "Chris Paul").act, 0);

console.log(fail ? `\n${fail} FAILURES` : "\nAll tests passed.");
process.exit(fail ? 1 : 0);
