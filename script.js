
const board = document.querySelector(".board");
const startbutton = document.querySelector(".btn-start");
const modal = document.querySelector(".modal");
const startGameModal = document.querySelector(".start-game");
const gameOverModal = document.querySelector(".game-over");
const restartButton = document.querySelector(".btn-restart");

const highScoreElement = document.querySelector("#high-score");
const scoreElement = document.querySelector("#Score");
const timeElement = document.querySelector("#time");

// Block dimensions (must match CSS)

const blockWidth = window.innerWidth <= 600 ? 35 : 50;
const blockHeight = blockWidth;

// Board dimensions

const cols = Math.floor(board.clientWidth / blockWidth);
const rows = Math.floor(board.clientHeight / blockHeight);

let intervalId = null;
let timerId = null;

let score = 0;
let time = 0;

let highScore = Number(localStorage.getItem("snakeHighScore")) || 0;

highScoreElement.innerText = highScore;

// Game variables

let direction = "right";
let nextDirection = "right";

let snake = [];

let food = null;

const blocks = {};

// Create grid

board.style.gridTemplateColumns =
    `repeat(${cols}, ${blockWidth}px)`;

board.style.gridTemplateRows =
    `repeat(${rows}, ${blockHeight}px)`;

for (let row = 0; row < rows; row++) {

    for (let col = 0; col < cols; col++) {

        const block = document.createElement("div");

        block.classList.add("block");

        // Store block using coordinates

        blocks[`${row}-${col}`] = block;

        board.appendChild(block);

    }

}

// Generate food at a random empty position
function generateFood() {

    const emptyCells = [];

    for (let row = 0; row < rows; row++) {

        for (let col = 0; col < cols; col++) {

            const occupied = snake.some(segment =>
                segment.x === row && segment.y === col
            );

            if (!occupied) {
                emptyCells.push({ x: row, y: col });
            }

        }

    }

    if (emptyCells.length === 0) {
        food = null;
        return;
    }

    const randomIndex = Math.floor(
        Math.random() * emptyCells.length
    );

    food = emptyCells[randomIndex];

}

// Draw snake and food

function drawBoard() {

    // Clear previous styling

    Object.values(blocks).forEach(block => {

        block.classList.remove("fill", "food");

    });

    // Draw snake

    snake.forEach(segment => {

        blocks[`${segment.x}-${segment.y}`]
            .classList.add("fill");

    });

    // Draw food

    if (food) {

        blocks[`${food.x}-${food.y}`]
            .classList.add("food");

    }

}

// Update timer

function updateTimer() {

    time++;

    const minutes = Math.floor(time / 60);

    const seconds = time % 60;

    timeElement.innerText =
        `${String(minutes).padStart(2, "0")}-${String(seconds).padStart(2, "0")}`;

}

// Main game function

function render() {

    // Calculate new head position

    let head = { ...snake[0] };

    if (direction === "right") {
        head.y++;
    }

    else if (direction === "left") {
        head.y--;
    }

    else if (direction === "up") {
        head.x--;
    }

    else if (direction === "down") {
        head.x++;
    }

    // Wall collision

    if (
        head.x < 0 ||
        head.x >= rows ||
        head.y < 0 ||
        head.y >= cols
    ) {

        gameOver();
        return;

    }

    // Check whether snake eats food

    const eatingFood =
        food &&
        head.x === food.x &&
        head.y === food.y;

    // Self collision

    // If not eating, the tail moves away.
    // Therefore, exclude the last segment from collision checking.

    const bodyToCheck = eatingFood
        ? snake
        : snake.slice(0, -1);

    const collision = bodyToCheck.some(segment =>
        segment.x === head.x &&
        segment.y === head.y
    );

    if (collision) {

        gameOver();
        return;

    }

    // Move snake

    snake.unshift(head);

    if (eatingFood) {

        // Increase score

        score += 10;

        scoreElement.innerText = score;

        // Update high score

        if (score > highScore) {

            highScore = score;

            highScoreElement.innerText = highScore;

            localStorage.setItem("snakeHighScore", highScore);

        }

        // Generate new food

        generateFood();

    }

    else {

        // Remove tail

        snake.pop();

    }

    drawBoard();

    // Win condition

    if (food === null) {
        gameOver();
    }

}

// Game over function

function gameOver() {

    clearInterval(intervalId);
    clearInterval(timerId);

    intervalId = null;
    timerId = null;

    modal.style.display = "flex";

    startGameModal.style.display = "none";

    gameOverModal.style.display = "flex";

}

// Start game

function startGame() {

    if (intervalId !== null) return;

    modal.style.display = "none";

    intervalId = setInterval(() => {

        direction = nextDirection;

        render();

    }, 150);

    timerId = setInterval(updateTimer, 1000);

}

// Start button

startbutton.addEventListener("click", startGame);

// Restart game

function restartgame() {

    clearInterval(intervalId);
    clearInterval(timerId);

    intervalId = null;
    timerId = null;

    // Reset score and timer

    score = 0;
    time = 0;

    scoreElement.innerText = "0";
    timeElement.innerText = "00-00";

    // Reset snake

    direction = "right";
    nextDirection = "right";

    snake = [
        {
            x: Math.floor(rows / 2),
            y: Math.floor(cols / 2)
        }
    ];

    // Generate fresh food

    generateFood();

    // Reset modal

    gameOverModal.style.display = "none";
    startGameModal.style.display = "flex";

    // Redraw board

    drawBoard();

    // Start again

    startGame();

}

restartButton.addEventListener("click", restartgame);

// Keyboard controls

document.addEventListener("keydown", (event) => {

    // Start with Enter or Space

    if (
        intervalId === null &&
        modal.style.display !== "none" &&
        startGameModal.style.display !== "none"
    ) {

        if (event.key === "Enter" || event.code === "Space") {

            event.preventDefault();

            startGame();

            return;

        }

    }

    // Ignore movement when game is not running

    if (intervalId === null) return;

    // Prevent page scrolling with arrow keys

    if (event.key.startsWith("Arrow")) {
        event.preventDefault();
    }

    // Prevent opposite direction

    if (
        event.key === "ArrowRight" &&
        direction !== "left"
    ) {
        nextDirection = "right";
    }

    else if (
        event.key === "ArrowLeft" &&
        direction !== "right"
    ) {
        nextDirection = "left";
    }

    else if (
        event.key === "ArrowUp" &&
        direction !== "down"
    ) {
        nextDirection = "up";
    }

    else if (
        event.key === "ArrowDown" &&
        direction !== "up"
    ) {
        nextDirection = "down";
    }

});

// Initial game setup

if (rows < 1 || cols < 1) {

    console.error("Game board is too small!");

} else {

    snake = [
        {
            x: Math.floor(rows / 2),
            y: Math.floor(cols / 2)
        }
    ];

    generateFood();

    drawBoard();

}

// Initial modal state

modal.style.display = "flex";
startGameModal.style.display = "flex";
gameOverModal.style.display = "none";
