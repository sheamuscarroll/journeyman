const fs = require("fs");
const { JSDOM } = require("jsdom");

let html = fs.readFileSync(__dirname + "/index.html", "utf8");
const playersSrc = fs.readFileSync(__dirname + "/players.js", "utf8");
html = html.replace('<script src="players.js"></script>', "<script>" + playersSrc + "</script>");

const dom = new JSDOM(html, { url: "https://journeyman.test/", runScripts: "dangerously", pretendToBeVisual: true });
const w = dom.window;

let fail = 0;
const expect = (label, cond) => { if (!cond) fail++; console.log((cond ? "PASS" : "FAIL"), label); };

// ---- Who Am I: correct guess ----
w.eval(`startGame('guess','active')`);
expect("game visible after start", !w.document.getElementById("game").classList.contains("hidden"));
expect("guess view shown", !w.document.getElementById("guessView").classList.contains("hidden"));
expect("stints rendered", w.document.getElementById("stints").children.length > 0);
w.eval(`submitGuess(current.n)`);
expect("correct guess -> streak 1", w.document.getElementById("streak").textContent === "1");
expect("feedback good", w.document.getElementById("feedback").className.includes("good"));

// ---- Who Am I: two wrong guesses -> game over ----
w.eval(`startGame('guess','alltime')`);
w.eval(`submitGuess("Definitely Wrong")`);
expect("1st miss doesn't end round", w.document.getElementById("gameOver").classList.contains("hidden"));
expect("hint auto-shown after miss", !w.document.getElementById("hintText").classList.contains("hidden"));
w.eval(`submitGuess("Also Wrong")`);
expect("2nd miss -> game over shown", !w.document.getElementById("gameOver").classList.contains("hidden"));
expect("answer revealed", w.document.getElementById("revealName").textContent.length > 2);

// ---- Career Path: correct submission ----
w.eval(`startGame('path','alltime')`);
expect("path view shown", !w.document.getElementById("pathView").classList.contains("hidden"));
const gridButtons = w.document.getElementById("teamGrid").children.length;
expect("all-time grid has 39 teams", gridButtons === 39);
w.eval(`answerPath.forEach(c => pickTeam(c)); submitPath();`);
expect("correct path -> streak 1", w.document.getElementById("streak").textContent === "1");

// ---- Career Path: wrong submission ----
w.eval(`
  // wait for auto-advance timer manually: force next round
  nextRound();
  const wrong = answerPath.slice().reverse();
  if (wrong.length === 1) wrong[0] = wrong[0] === "BOS" ? "LAL" : "BOS";
  picks = []; wrong.forEach(c => pickTeam(c)); submitPath();
`);
expect("wrong path -> game over", !w.document.getElementById("gameOver").classList.contains("hidden"));

// ---- active picker has exactly 30 teams ----
w.eval(`startGame('path','active')`);
expect("active grid has 30 teams", w.document.getElementById("teamGrid").children.length === 30);

// ---- best-streak persistence ----
w.eval(`localStorage.setItem("jm_best_guess_active","7"); goHome();`);
const bestEl = w.document.querySelector('[data-best="guess_active"]');
expect("home shows stored best", bestEl.textContent === "7");

// ---- autocomplete ----
w.eval(`startGame('guess','active')`);
const inp = w.document.getElementById("guessInput");
inp.value = "lebr";
inp.dispatchEvent(new w.Event("input", { bubbles: true }));
const sugs = w.document.querySelectorAll("#sugBox .sug");
expect("autocomplete finds LeBron", [...sugs].some(s => s.dataset.name === "LeBron James"));

console.log(fail ? `\n${fail} FAILURES` : "\nE2E: all tests passed.");
process.exit(fail ? 1 : 0);
