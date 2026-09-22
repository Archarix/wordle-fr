const WORD_LEN = 5;
const MAX_TRIES = 6;

const boardEl = document.getElementById("board");
const keyboardEl = document.getElementById("keyboard");
const messageEl = document.getElementById("message");
const overlayEl = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const overlayBtn = document.getElementById("overlayBtn");
const newGameBtn = document.getElementById("newGameBtn");

const AZERTY = [
  ["A","Z","E","R","T","Y","U","I","O","P"],
  ["Q","S","D","F","G","H","J","K","L","M"],
  ["ENTER","W","X","C","V","B","N","BACK"]
];

let targetWord = "";
let currentRow = 0;
let currentGuess = "";
let gameOver = false;
let rows = [];
let keyStates = {};
const VALID_WORDS = new Set(FIVE_LETTER_WORDS);

function pickWord() {
  const pool = FIVE_LETTER_WORDS;
  return pool[Math.floor(Math.random() * pool.length)];
}

function buildBoard() {
  boardEl.innerHTML = "";
  boardEl.style.setProperty("--word-len", WORD_LEN);
  rows = [];
  for (let r = 0; r < MAX_TRIES; r++) {
    const rowEl = document.createElement("div");
    rowEl.className = "row";
    const tiles = [];
    for (let c = 0; c < WORD_LEN; c++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      rowEl.appendChild(tile);
      tiles.push(tile);
    }
    boardEl.appendChild(rowEl);
    rows.push(tiles);
  }
}

function buildKeyboard() {
  keyboardEl.innerHTML = "";
  AZERTY.forEach(rowKeys => {
    const rowEl = document.createElement("div");
    rowEl.className = "kb-row";
    rowKeys.forEach(k => {
      const btn = document.createElement("button");
      btn.className = "key" + (k === "ENTER" || k === "BACK" ? " wide" : "");
      btn.textContent = k === "ENTER" ? "Entrée" : (k === "BACK" ? "⌫" : k);
      btn.dataset.key = k;
      btn.addEventListener("click", () => handleKey(k));
      rowEl.appendChild(btn);
    });
    keyboardEl.appendChild(rowEl);
  });
}

function setMessage(text, timeout) {
  messageEl.textContent = text;
  if (timeout) {
    setTimeout(() => { if (messageEl.textContent === text) messageEl.textContent = ""; }, timeout);
  }
}

function handleKey(key) {
  if (gameOver) return;
  if (key === "BACK") {
    currentGuess = currentGuess.slice(0, -1);
    renderCurrentRow();
    return;
  }
  if (key === "ENTER") {
    submitGuess();
    return;
  }
  if (/^[A-Z]$/.test(key) && currentGuess.length < WORD_LEN) {
    currentGuess += key;
    renderCurrentRow();
  }
}

function renderCurrentRow() {
  const tiles = rows[currentRow];
  for (let i = 0; i < WORD_LEN; i++) {
    const tile = tiles[i];
    const letter = currentGuess[i] || "";
    tile.textContent = letter;
    tile.classList.toggle("filled", !!letter);
  }
  const lastTile = tiles[currentGuess.length - 1];
  if (lastTile) {
    lastTile.classList.remove("pop");
    void lastTile.offsetWidth;
    lastTile.classList.add("pop");
  }
}

function shakeRow() {
  rows[currentRow].forEach(t => {
    t.classList.remove("shake");
    void t.offsetWidth;
    t.classList.add("shake");
  });
}

function submitGuess() {
  if (currentGuess.length < WORD_LEN) {
    setMessage("Pas assez de lettres", 1200);
    shakeRow();
    return;
  }
  if (!VALID_WORDS.has(currentGuess)) {
    setMessage("Mot inconnu", 1200);
    shakeRow();
    return;
  }
  const result = scoreGuess(currentGuess, targetWord);
  revealRow(currentRow, result, () => {
    updateKeyboardStates(currentGuess, result);
    if (currentGuess === targetWord) {
      endGame(true);
    } else if (currentRow === MAX_TRIES - 1) {
      endGame(false);
    } else {
      currentRow++;
      currentGuess = "";
    }
  });
}

function scoreGuess(guess, target) {
  const result = new Array(WORD_LEN).fill("absent");
  const targetLetters = target.split("");
  const used = new Array(WORD_LEN).fill(false);

  for (let i = 0; i < WORD_LEN; i++) {
    if (guess[i] === target[i]) {
      result[i] = "correct";
      used[i] = true;
    }
  }
  for (let i = 0; i < WORD_LEN; i++) {
    if (result[i] === "correct") continue;
    const idx = targetLetters.findIndex((l, j) => l === guess[i] && !used[j]);
    if (idx !== -1) {
      result[i] = "present";
      used[idx] = true;
    }
  }
  return result;
}

function revealRow(rowIndex, result, done) {
  const tiles = rows[rowIndex];
  tiles.forEach((tile, i) => {
    setTimeout(() => {
      tile.classList.add("flip");
      setTimeout(() => {
        tile.classList.add(result[i]);
      }, 250);
    }, i * 200);
  });
  setTimeout(done, tiles.length * 200 + 300);
}

function updateKeyboardStates(guess, result) {
  const priority = { absent: 0, present: 1, correct: 2 };
  for (let i = 0; i < guess.length; i++) {
    const letter = guess[i];
    const state = result[i];
    if (!keyStates[letter] || priority[state] > priority[keyStates[letter]]) {
      keyStates[letter] = state;
    }
  }
  document.querySelectorAll(".key").forEach(btn => {
    const k = btn.dataset.key;
    btn.classList.remove("correct", "present", "absent");
    if (keyStates[k]) btn.classList.add(keyStates[k]);
  });
}

function endGame(won) {
  gameOver = true;
  setTimeout(() => {
    overlayEl.classList.remove("hidden");
    if (won) {
      overlayTitle.textContent = "🎉 Bravo !";
      overlayText.textContent = `Trouvé en ${currentRow + 1}/${MAX_TRIES} essai(s). Le mot était "${targetWord}".`;
    } else {
      overlayTitle.textContent = "😢 Dommage";
      overlayText.textContent = `Le mot était "${targetWord}".`;
    }
  }, 400);
}

function newGame() {
  targetWord = pickWord();
  currentRow = 0;
  currentGuess = "";
  gameOver = false;
  keyStates = {};
  messageEl.textContent = "";
  overlayEl.classList.add("hidden");
  buildBoard();
  buildKeyboard();
}

document.addEventListener("keydown", (e) => {
  if (overlayEl && !overlayEl.classList.contains("hidden")) return;
  const key = e.key.toUpperCase();
  if (key === "BACKSPACE") handleKey("BACK");
  else if (key === "ENTER") handleKey("ENTER");
  else if (/^[A-Z]$/.test(key)) handleKey(key);
});

newGameBtn.addEventListener("click", newGame);
overlayBtn.addEventListener("click", newGame);

newGame();
