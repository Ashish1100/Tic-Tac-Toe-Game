"use strict";

let board = Array(9).fill(null);
let playerSymbol = "X";
let computerSymbol = "O";
let currentTurn = "player";
let gameOver = false;
let difficulty = "easy"; // Options: "easy" or "hard"
let score = { player: 0, computer: 0, draws: 0 };
let leaderboard = JSON.parse(localStorage.getItem("ticTacToeLeaderboard") || "[]");

// Sound effect elements
const moveSound = document.getElementById("moveSound");
const winSound = document.getElementById("winSound");

// Show options modal on window load
window.onload = function () {
  showOptions();
  updateScoreboard();
};

// Display the options modal
function showOptions() {
  document.getElementById("optionsDlg").style.display = "flex";
}

// Retrieve user options and start the game
function getOptions() {
  const diffOptions = document.getElementsByName("difficulty");
  for (let opt of diffOptions) {
    if (opt.checked) {
      difficulty = opt.value;
      break;
    }
  }
  if (document.getElementById("symX").checked) {
    playerSymbol = "X";
    computerSymbol = "O";
    currentTurn = "player";
  } else {
    playerSymbol = "O";
    computerSymbol = "X";
    currentTurn = "computer";
  }
  document.getElementById("optionsDlg").style.display = "none";
  initialize();
  if (currentTurn === "computer") {
    setTimeout(makeComputerMove, 500);
  }
}

// Initialize or reset the game state and board
function initialize() {
  board = Array(9).fill(null);
  gameOver = false;
  for (let i = 0; i < 9; i++) {
    const cell = document.getElementById("cell" + i);
    cell.innerText = "";
    cell.classList.remove("win-color");
    cell.style.cursor = "pointer";
    cell.style.transform = "rotate(0deg)";
  }
}

// Update the scoreboard display
function updateScoreboard() {
  document.getElementById("player_score").innerText = "Player: " + score.player;
  document.getElementById("tie_score").innerText = "Draws: " + score.draws;
  document.getElementById("computer_score").innerText = "Computer: " + score.computer;
}

// Handle cell click events for the player
function cellClicked(index) {
  if (gameOver || board[index] !== null || currentTurn !== "player")
    return;
  board[index] = playerSymbol;
  updateCellUI(index, playerSymbol);
  playSound(moveSound);
  if (checkWinner(board, playerSymbol)) {
    score.player++;
    endGame("player");
    return;
  } else if (isBoardFull(board)) {
    score.draws++;
    endGame("draw");
    return;
  }
  currentTurn = "computer";
  setTimeout(makeComputerMove, 500);
}

// Update a single cell's UI with the selected symbol and a random rotation
function updateCellUI(index, symbol) {
  const cell = document.getElementById("cell" + index);
  cell.innerText = symbol;
  const angle = Math.random() * 20 - 10;
  cell.style.transform = "rotate(" + angle + "deg)";
  cell.style.cursor = "default";
}

// Check if the board has any remaining empty cells
function isBoardFull(arr) {
  return arr.every(cell => cell !== null);
}

// Verify if the given symbol has met a winning condition on the board
function checkWinner(bd, sym) {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  for (let pattern of winPatterns) {
    if (
      bd[pattern[0]] === sym &&
      bd[pattern[1]] === sym &&
      bd[pattern[2]] === sym
    ) {
      pattern.forEach(idx => {
        document.getElementById("cell" + idx).classList.add("win-color");
      });
      return true;
    }
  }
  return false;
}

// End the game, announce the result, update scores, and play win sound effects
function endGame(result) {
  gameOver = true;
  if (result === "player") {
    announceWinner("Congratulations, you won!");
    playSound(winSound);
    let playerName = prompt("You won! Enter your name for the leaderboard:", "Player");
    if (playerName) {
      updateLeaderboard(playerName, score.player);
    }
  } else if (result === "computer") {
    announceWinner("Computer wins!");
    playSound(winSound);
  } else {
    announceWinner("It's a draw!");
    playSound(winSound);
  }
  updateScoreboard();
}

// Display the winner announcement modal with a custom message
function announceWinner(message) {
  document.getElementById("winText").innerText = message;
  document.getElementById("winAnnounce").style.display = "flex";
}

// Hide a modal dialog given its ID
function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

// Restart the game by hiding modals and showing the options dialog again
function restartGame() {
  document.getElementById("winAnnounce").style.display = "none";
  initialize();
  updateScoreboard();
  document.getElementById("optionsDlg").style.display = "flex";
}

// Display the leaderboard modal, listing recorded scores from localStorage
function showLeaderboard() {
  let listDiv = document.getElementById("leaderboardList");
  listDiv.innerHTML = "";
  if (leaderboard.length === 0) {
    listDiv.innerHTML = "<p>No entries yet.</p>";
  } else {
    leaderboard.forEach(entry => {
      let p = document.createElement("p");
      p.innerText = entry.name + ": " + entry.score;
      listDiv.appendChild(p);
    });
  }
  document.getElementById("leaderboardDlg").style.display = "flex";
}

// Update the leaderboard with a new entry and store it persistently
function updateLeaderboard(name, playerScore) {
  leaderboard.push({ name: name, score: playerScore });
  leaderboard.sort((a, b) => b.score - a.score);
  localStorage.setItem("ticTacToeLeaderboard", JSON.stringify(leaderboard));
}

// Play a given audio sound effect from the start
function playSound(audioElement) {
  if (audioElement) {
    audioElement.currentTime = 0;
    audioElement.play();
  }
}

// Get a random valid move from the board
function getRandomMove() {
  let avail = [];
  board.forEach((cell, idx) => {
    if (cell === null) avail.push(idx);
  });
  if (avail.length === 0) return null;
  return avail[Math.floor(Math.random() * avail.length)];
}

// Make a move on behalf of the computer based on the selected difficulty
function makeComputerMove() {
  if (gameOver) return;
  let move;
  if (difficulty === "easy") {
    move = getRandomMove();
  } else if (difficulty === "hard") {
    let decision = minimaxDecision(board.slice(), computerSymbol);
    move = decision.index;
  }
  // Check if a valid move was obtained; if not, end the game as a draw
  if (move === undefined || move === null) {
    score.draws++;
    endGame("draw");
    return;
  }
  board[move] = computerSymbol;
  updateCellUI(move, computerSymbol);
  playSound(moveSound);
  if (checkWinner(board, computerSymbol)) {
    score.computer++;
    endGame("computer");
    return;
  } else if (isBoardFull(board)) {
    score.draws++;
    endGame("draw");
    return;
  }
  currentTurn = "player";
}

// Use the minimax algorithm to choose the best move (hard mode)
function minimaxDecision(newBoard, currentPlayer) {
  let availSpots = [];
  newBoard.forEach((cell, idx) => {
    if (cell === null) availSpots.push(idx);
  });
  if (checkWinner(newBoard, playerSymbol)) {
    return { score: -10 };
  } else if (checkWinner(newBoard, computerSymbol)) {
    return { score: 10 };
  } else if (availSpots.length === 0) {
    return { score: 0 };
  }
  let moves = [];
  for (let i = 0; i < availSpots.length; i++) {
    let move = {};
    move.index = availSpots[i];
    newBoard[availSpots[i]] = currentPlayer;
    if (currentPlayer === computerSymbol) {
      let result = minimaxDecision(newBoard, playerSymbol);
      move.score = result.score;
    } else {
      let result = minimaxDecision(newBoard, computerSymbol);
      move.score = result.score;
    }
    newBoard[availSpots[i]] = null;
    moves.push(move);
  }
  let bestMove;
  if (currentPlayer === computerSymbol) {
    let bestScore = -Infinity;
    moves.forEach(m => {
      if (m.score > bestScore) {
        bestScore = m.score;
        bestMove = m;
      }
    });
  } else {
    let bestScore = Infinity;
    moves.forEach(m => {
      if (m.score < bestScore) {
        bestScore = m.score;
        bestMove = m;
      }
    });
  }
  return bestMove;
}
