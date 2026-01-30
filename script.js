// ============================
// ELEMENTS
// ============================
const startScreen = document.getElementById("start-screen");
const gameInfo = document.getElementById("game-info");
const boardEl = document.getElementById("board");
const cells = document.querySelectorAll(".cell");
const backBtn = document.getElementById("backBtn");
const statusText = document.getElementById("status");

const startBtn = document.getElementById("start-btn");
const nextBtn = document.getElementById("nextBtn");

const modeSelect = document.getElementById("mode");

const roundEl = document.getElementById("round");
const xScoreEl = document.getElementById("xScore");
const oScoreEl = document.getElementById("oScore");
const drawScoreEl = document.getElementById("drawScore");
const historyBox = document.getElementById("history");
const historyList = document.getElementById("historyList");

// ============================
// GAME STATE
// ============================
let board = Array(9).fill("");
let currentPlayer = "X";
let gameActive = false;

let round = 1;
let xWins = 0;
let oWins = 0;
let draws = 0;

let totalMatches = 0;
let totalXWins = 0;
let totalOWins = 0;
let totalDraws = 0;

let gameMode = "easy";

// Winning combinations
const winPatterns = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

// ============================
// LOAD STATS & HISTORY
// ============================
function loadStats() {
    if (localStorage.getItem("totalMatches")) {
        totalMatches = parseInt(localStorage.getItem("totalMatches"));
        totalXWins = parseInt(localStorage.getItem("totalXWins"));
        totalOWins = parseInt(localStorage.getItem("totalOWins"));
        totalDraws = parseInt(localStorage.getItem("totalDraws"));

        document.getElementById("totalMatches").textContent = totalMatches;
        document.getElementById("totalXWins").textContent = totalXWins;
        document.getElementById("totalOWins").textContent = totalOWins;
        document.getElementById("totalDraws").textContent = totalDraws;
    }

    if (localStorage.getItem("matchHistory")) {
        const history = JSON.parse(localStorage.getItem("matchHistory"));
        history.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item;
            historyList.appendChild(li);
        });
        if (history.length > 0) historyBox.classList.remove("hidden");
    }
}

// ============================
// START MATCH
// ============================
startBtn.addEventListener("click", () => {
    gameMode = modeSelect.value;

    startScreen.classList.add("hidden");
    gameInfo.classList.remove("hidden");
    boardEl.classList.remove("hidden");
    statusText.classList.remove("hidden");
    backBtn.classList.remove("hidden");

    startNewRound();
});

// ============================
// START NEW ROUND
// ============================
function startNewRound() {
    board = Array(9).fill("");
    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove("X","O");
    });

    currentPlayer = "X";
    gameActive = true;

    roundEl.textContent = round;
    statusText.textContent = "Player X's turn";
    nextBtn.classList.add("hidden");
    nextBtn.disabled = true;
}

// ============================
// CELL CLICK
// ============================
cells.forEach(cell => {
    cell.addEventListener("click", () => {
        const index = parseInt(cell.dataset.i);

        if (!gameActive || board[index] !== "") return;  

        makeMove(index, currentPlayer);  

        if (gameMode !== "human" && gameActive && currentPlayer === "O") {  
            setTimeout(aiMove, 500);  
        }
    });
});

// ============================
// MAKE MOVE
// ============================
function makeMove(index, player) {
    board[index] = player;
    cells[index].textContent = player;
    cells[index].classList.add(player);

    if (checkWin(player)) {
        endRound(player);
        return;
    }

    if (board.every(cell => cell !== "")) {
        endRound("draw");
        return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusText.textContent = `Player ${currentPlayer}'s turn`;
}

// ============================
// CHECK WIN
// ============================
function checkWin(player) {
    return winPatterns.some(pattern => pattern.every(i => board[i] === player));
}

// ============================
// END ROUND
// ============================
function endRound(result) {
    gameActive = false;

    if (result === "X") xWins++;
    else if (result === "O") oWins++;
    else draws++;

    updateScore();

    statusText.textContent = result === "draw" ? "Round draw!" : `Player ${result} wins the round!`;

    nextBtn.textContent = round === 3 ? "Start New Game" : "Next Round";
    nextBtn.classList.remove("hidden");
    nextBtn.disabled = false;
}

// ============================
// NEXT ROUND BUTTON
// ============================
nextBtn.addEventListener("click", () => {
    if (round < 3) {
        round++;
        startNewRound();
    } else {
        endMatch();
    }
});

// ============================
// END MATCH
// ============================
function endMatch() {
    let resultText = "";

    totalMatches++;
    if (xWins > oWins) {
        resultText = "Player X won the match!";
        totalXWins++;
    } else if (oWins > xWins) {
        resultText = "Player O won the match!";
        totalOWins++;
    } else {
        resultText = "Match ended in a draw!";
        totalDraws++;
    }

    // Save history
    const li = document.createElement("li");
    li.textContent = `Match ${totalMatches}: ${resultText}`;
    historyList.appendChild(li);
    historyBox.classList.remove("hidden");

    // Save stats to localStorage
    localStorage.setItem("totalMatches", totalMatches);
    localStorage.setItem("totalXWins", totalXWins);
    localStorage.setItem("totalOWins", totalOWins);
    localStorage.setItem("totalDraws", totalDraws);

    // Save match history to localStorage
    localStorage.setItem("matchHistory", JSON.stringify(Array.from(historyList.children).map(li => li.textContent)));

    // Update home stats
    document.getElementById("totalMatches").textContent = totalMatches;
    document.getElementById("totalXWins").textContent = totalXWins;
    document.getElementById("totalOWins").textContent = totalOWins;
    document.getElementById("totalDraws").textContent = totalDraws;

    // Reset round stats
    resetBoard();
    resetMatch();

    // Show main menu
    nextBtn.classList.add("hidden");
    gameInfo.classList.add("hidden");
    boardEl.classList.add("hidden");
    statusText.classList.add("hidden");
    backBtn.classList.add("hidden");

    startScreen.classList.remove("hidden");
}

// ============================
// UPDATE SCORE DISPLAY
// ============================
function updateScore() {
    xScoreEl.textContent = xWins;
    oScoreEl.textContent = oWins;
    drawScoreEl.textContent = draws;
}

// ============================
// AI MOVE
// ============================
function aiMove() {
    if (!gameActive || gameMode === "human") return;

    let move;
    if (gameMode === "easy") {
        move = randomMove();
    } else if (gameMode === "normal") {
        move = Math.random() < 0.5 ? bestMove() : randomMove();
    } else if (gameMode === "hard") {
        move = bestMove();
    }

    makeMove(move, "O");
}

// ============================
// RANDOM MOVE
// ============================
function randomMove() {
    const empty = board.map((v,i) => v === "" ? i : null).filter(v => v !== null);
    return empty[Math.floor(Math.random() * empty.length)];
}

// ============================
// BEST MOVE (MINIMAX LIGHT)
// ============================
function bestMove() {
    // Win if possible
    for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
            board[i] = "O";
            if (checkWin("O")) { board[i] = ""; return i; }
            board[i] = "";
        }
    }

    // Block X
    for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
            board[i] = "X";
            if (checkWin("X")) { board[i] = ""; return i; }
            board[i] = "";
        }
    }

    // Take center
    if (board[4] === "") return 4;

    return randomMove();
}

// ============================
// RESET FUNCTIONS
// ============================
function resetBoard() {
    board = Array(9).fill("");
    cells.forEach(cell => cell.textContent = "");
    cells.forEach(cell => cell.classList.remove("X","O"));
    currentPlayer = "X";
    gameActive = false;
}

function resetMatch() {
    round = 1;
    xWins = 0;
    oWins = 0;
    draws = 0;
    updateScore();
}

// ============================
// BACK BUTTON
// ============================
backBtn.addEventListener("click", () => {
    resetBoard();
    resetMatch();

    gameInfo.classList.add("hidden");
    boardEl.classList.add("hidden");
    statusText.classList.add("hidden");
    nextBtn.classList.add("hidden");
    backBtn.classList.add("hidden");

    startScreen.classList.remove("hidden");
});

// ============================
// INITIAL LOAD
// ============================
loadStats();
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js")
    .then(() => console.log("Service Worker Registered"))
    .catch(err => console.error("SW error", err));
}