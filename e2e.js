/* End-to-end tests — simulated browser via jsdom. Run: npm install && node e2e.js */
const fs = require("fs");
const { JSDOM } = require("jsdom");

let html = fs.readFileSync(__dirname + "/index.html", "utf8");
const playersSrc = fs.readFileSync(__dirname + "/players.js", "utf8");
html = html.replace('<script src="players.js"></script>', "<script>" + playersSrc + "</script>");

const dom = new JSDOM(html, { url: "https://journeyman.test/", runScripts: "dangerously", pretendToBeVisual: true });
const w = dom.window;

let fail = 0;
const expect = (label, cond) => { if (!cond) fail++; console.log((cond ? "PASS" : "FAIL"), label); };

/* ---- footer shows exact update date ---- */
expect("footer shows updated-as-of date",
  w.document.getElementById("footerNote").textContent.includes(w.eval("DATA_UPDATED")));

/* ---- Who Am I (easy): correct guess ---- */
w.eval(`startGame('guess','active')`);
expect("game visible after start", !w.document.getElementById("game").classList.contains("hidden"));
expect("years hidden by default", w.document.querySelectorAll("#stints .yrs").length === 0);
expect("easy pool = well-known players only", w.eval(`answerPool().every(p => isKnown(p))`));
expect("guess pool has no one-team careers", w.eval(`answerPool().every(p => mergedPath(p).length >= 2)`));
w.eval(`submitGuess(current.n)`);
expect("correct guess -> streak 1", w.document.getElementById("streak").textContent === "1");

/* ---- easy-mode two-hint system ---- */
w.eval(`nextRound(); showHint();`);
expect("hint 1 = position (no debut year)",
  !w.document.getElementById("hintText").textContent.includes("debut") &&
  w.document.getElementById("hintText").textContent.length > 2);
expect("hint button now offers years", w.document.getElementById("hintBtn").textContent.includes("years"));
w.eval(`showHint();`);
expect("hint 2 reveals years", w.document.querySelectorAll("#stints .yrs").length > 0);
expect("no third hint", w.eval(`hintsUsed`) === 2 && w.document.getElementById("hintBtn").classList.contains("hidden"));

/* ---- Who Am I: two wrong guesses -> game over ---- */
w.eval(`startGame('guess','alltime')`);
w.eval(`submitGuess("Definitely Wrong")`);
expect("1st miss doesn't end round", w.document.getElementById("gameOver").classList.contains("hidden"));
w.eval(`submitGuess("Also Wrong")`);
expect("2nd miss -> game over shown", !w.document.getElementById("gameOver").classList.contains("hidden"));

/* ---- all-time pool includes active greats ---- */
expect("all-time pool includes LeBron", w.eval(`basePool().some(p => p.n === "LeBron James")`));
expect("all-time pool includes retired legends", w.eval(`basePool().some(p => p.n === "Michael Jordan")`));
expect("all-time pool excludes non-great actives", w.eval(`!basePool().some(p => p.n === "Scoot Henderson")`));

/* ---- hard mode ---- */
w.eval(`goHome()`);
const toggle = w.document.getElementById("hardToggle");
toggle.checked = true;
toggle.dispatchEvent(new w.Event("change", { bubbles: true }));
w.eval(`startGame('guess','alltime')`);
expect("hard mode flagged in title", w.document.getElementById("modeTitle").textContent.includes("HARD"));
expect("hard mode hides years", w.document.querySelectorAll("#stints .yrs").length === 0);
expect("hard mode hides hint button", w.document.getElementById("hintBtn").classList.contains("hidden"));
expect("hard pool includes deep cuts", w.eval(`answerPool().some(p => !isKnown(p))`));
expect("hard active pool includes D'Angelo Russell", w.eval(`
  (() => { const keep = pool; pool = 'active';
    const r = answerPool().some(p => p.n === "D'Angelo Russell"); pool = keep; return r; })()
`));
expect("hard guess pool has no one-team careers", w.eval(`answerPool().every(p => mergedPath(p).length >= 2)`));
expect("hard pool has no ambiguous careers", w.eval(`
  (() => { const ps = answerPool(); const c = {};
    ps.forEach(p => { const k = sigHard(p); c[k] = (c[k]||0)+1; });
    return Object.values(c).every(v => v === 1); })()
`));
expect("hard pool drops single-block Lakers legends", w.eval(`!answerPool().some(p => p.n === "Kobe Bryant")`));
w.eval(`showHint()`);
expect("showHint is a no-op in hard mode", w.eval(`hintsUsed`) === 0);

/* ---- duplicate career paths both count (easy mode) ---- */
toggle.checked = false;
toggle.dispatchEvent(new w.Event("change", { bubbles: true }));
w.eval(`
  PLAYERS.push({n:"Test Twin A",p:"PG",act:1,s:[["BOS",1111,1112],["LAL",1112,1113]]});
  PLAYERS.push({n:"Test Twin B",p:"PG",act:1,s:[["BOS",1111,1112],["LAL",1112,1113]]});
  startGame('guess','active');
  current = PLAYERS.find(p => p.n === "Test Twin A");
  renderStints();
  submitGuess("Test Twin B");
`);
expect("identical career path counts as correct", w.document.getElementById("streak").textContent === "1");
expect("identical path shows plain correct message",
  w.document.getElementById("feedback").textContent.includes("Test Twin B") &&
  !w.document.getElementById("feedback").textContent.includes("counts"));
w.eval(`PLAYERS.pop(); PLAYERS.pop();`);

/* ---- give up ---- */
w.eval(`startGame('guess','active'); giveUp();`);
expect("give up ends the round instantly", !w.document.getElementById("gameOver").classList.contains("hidden"));

/* ---- era-accurate labels ---- */
expect("KD's OKC block labels SEA/OKC", w.eval(`eraInfo("OKC",2007,2016).label`) === "SEA/OKC");
expect("Payton's block labels SEA", w.eval(`eraInfo("OKC",1990,2003).label`) === "SEA");
expect("AD's NOP block labels NOH/NOP", w.eval(`eraInfo("NOP",2012,2020).label`) === "NOH/NOP");
expect("Webber's WAS block labels WSB/WAS", w.eval(`eraInfo("WAS",1994,1998).label`) === "WSB/WAS");
expect("Westbrook's OKC block labels OKC", w.eval(`eraInfo("OKC",2008,2019).label`) === "OKC");

/* ---- Career Path: era-accurate grid ---- */
w.eval(`
  startGame('path','alltime');
  current = PLAYERS.find(p => p.n === "Shawn Kemp");
  answerPath = mergedPath(current); picks = Array(answerPath.length).fill(null);
  renderTeamGrid(); renderSlots();
`);
let labels = [...w.document.querySelectorAll("#teamGrid .team-btn")].map(b => b.textContent);
expect("Kemp grid shows SEA not OKC", labels.includes("SEA") && !labels.includes("OKC"));
w.eval(`
  current = PLAYERS.find(p => p.n === "Wilt Chamberlain");
  answerPath = mergedPath(current); picks = Array(answerPath.length).fill(null);
  renderTeamGrid(); renderSlots();
`);
labels = [...w.document.querySelectorAll("#teamGrid .team-btn")].map(b => b.textContent);
expect("Wilt grid excludes post-1973 franchises (got " + labels.length + ")",
  labels.length === 17 && !labels.includes("DAL") && !labels.includes("MIA"));
expect("Wilt grid shows era Warriors label", labels.some(l => l.includes("PHW")));

/* ---- Career Path: correct + wrong submissions ---- */
w.eval(`
  picks = Array(answerPath.length).fill(null);
  answerPath.forEach(c => pickTeam(c)); submitPath();
`);
expect("correct path -> streak 1", w.document.getElementById("streak").textContent === "1");

/* ---- drag-to-slot: fill an arbitrary slot directly ---- */
w.eval(`
  nextRound();
  fillSlot(answerPath.length - 1, answerPath[answerPath.length - 1]);
`);
expect("fillSlot fills a non-sequential slot", w.eval(`picks[answerPath.length - 1] === answerPath[answerPath.length - 1] && picks[0] === null`));
expect("submit stays disabled until all slots filled", w.document.getElementById("submitPath").disabled);
w.eval(`
  answerPath.forEach((c, i) => fillSlot(i, c)); submitPath();
`);
expect("drag-filled correct path -> streak up", w.document.getElementById("streak").textContent === "2");

/* ---- wrong path -> game over + comparison ---- */
w.eval(`
  nextRound();
  const wrong = answerPath.slice().reverse();
  if (wrong.length === 1) wrong[0] = wrong[0] === "BOS" ? "LAL" : "BOS";
  wrong.forEach((c, i) => fillSlot(i, c)); submitPath();
`);
expect("wrong path -> game over", !w.document.getElementById("gameOver").classList.contains("hidden"));
expect("loss shows your-path vs correct-path comparison",
  !w.document.getElementById("pathCompare").classList.contains("hidden") &&
  w.document.querySelectorAll("#pathCompare .cmp-row").length === 2);

/* ---- Career Path pool: multi-team careers only, fame split ---- */
expect("path pool has no single-team players", w.eval(`
  (() => { mode='path'; pool='alltime';
    return answerPool().every(p => mergedPath(p).length >= 2); })()
`));
expect("path pool (active) has no single-team players", w.eval(`
  (() => { mode='path'; pool='active';
    return answerPool().every(p => mergedPath(p).length >= 2); })()
`));
expect("easy path pool excludes deep cuts like Trevor Ariza", w.eval(`
  (() => { hardMode=false; mode='path'; pool='alltime';
    return !answerPool().some(p => p.n === "Trevor Ariza"); })()
`));
expect("hard path pool includes Trevor Ariza", w.eval(`
  (() => { hardMode=true; mode='path'; pool='alltime';
    const r = answerPool().some(p => p.n === "Trevor Ariza"); hardMode=false; return r; })()
`));

/* ---- autocomplete ---- */
w.eval(`startGame('guess','active')`);
const inp = w.document.getElementById("guessInput");
inp.value = "lebr";
inp.dispatchEvent(new w.Event("input", { bubbles: true }));
const sugs = w.document.querySelectorAll("#sugBox .sug");
expect("autocomplete finds LeBron", [...sugs].some(s => s.dataset.name === "LeBron James"));

console.log(fail ? `\n${fail} FAILURES` : "\nE2E: all tests passed.");
process.exit(fail ? 1 : 0);
