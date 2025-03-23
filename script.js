// Select HTML elements
const board = document.getElementById("game-board");
const instructionText = document.getElementById("instruction-text");
const score = document.getElementById("score");
const highScoreText = document.getElementById("highScore");

// Game Variables
const gridSize = 20;
let snake = [{ x: 10, y: 10 }]; // Initial snake position
let food = generateFood();
let highScore = 0;
let direction = "right";
let nextDirection = "right"; // Prevents instant 180-degree turns
let gameSpeed = 200;
let gameStarted = false;
let gamePaused = false;
let wrapMode = false; // Toggles between classic and wrap mode
let lastRenderTime = 0;
let isGameOver = false;

// Initialize Game Loop
function startGameLoop(currentTime) {
  if (!gameStarted || isGameOver) return;

  const timeSinceLastRender = currentTime - lastRenderTime;
  if (timeSinceLastRender < gameSpeed) {
    requestAnimationFrame(startGameLoop);
    return;
  }

  lastRenderTime = currentTime;
  if (!gamePaused) {
    move();
    checkCollision();
    draw();
  }

  requestAnimationFrame(startGameLoop);
}

// Start Game
function startGame() {
  if (gameStarted) return;
  gameStarted = true;
  isGameOver = false;
  instructionText.style.display = "none";
  resetGame();
  requestAnimationFrame(startGameLoop);
}

// Draw the game board
function draw() {
  board.innerHTML = "";
  drawSnake();
  drawFood();
  updateScore();
}

// Draw Snake
function drawSnake() {
  snake.forEach((segment, index) => {
    const snakeElement = createGameElement("div", "snake");
    setPosition(snakeElement, segment);
    if (index === 0) snakeElement.classList.add("snake-head"); // Different style for head
    board.appendChild(snakeElement);
  });
}

// Create game elements (snake & food)
function createGameElement(tag, className) {
  const element = document.createElement(tag);
  element.className = className;
  return element;
}

// Set element position
function setPosition(element, position) {
  element.style.gridColumnStart = position.x;
  element.style.gridRowStart = position.y;
}

// Draw Food
function drawFood() {
  if (gameStarted) {
    const foodElement = createGameElement("div", "food");
    setPosition(foodElement, food);
    board.appendChild(foodElement);
  }
}

// Generate Random Food Position
function generateFood() {
  let newFoodPosition;
  do {
    newFoodPosition = {
      x: Math.floor(Math.random() * gridSize) + 1,
      y: Math.floor(Math.random() * gridSize) + 1,
    };
  } while (isSnakeOnPosition(newFoodPosition));
  return newFoodPosition;
}

// Check if food spawns on the snake
function isSnakeOnPosition(position) {
  return snake.some(
    (segment) => segment.x === position.x && segment.y === position.y
  );
}

// Move Snake
function move() {
  const head = { ...snake[0] };

  // Change direction
  direction = nextDirection;
  switch (direction) {
    case "up":
      head.y--;
      break;
    case "down":
      head.y++;
      break;
    case "left":
      head.x--;
      break;
    case "right":
      head.x++;
      break;
  }

  // Wrap Mode (Snake appears on opposite side instead of hitting walls)
  if (wrapMode) {
    if (head.x < 1) head.x = gridSize;
    if (head.x > gridSize) head.x = 1;
    if (head.y < 1) head.y = gridSize;
    if (head.y > gridSize) head.y = 1;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    food = generateFood();
    increaseSpeed();
    playSound("eat"); // Play sound effect
  } else {
    snake.pop();
  }
}

// Handle Keyboard Input
document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (!gameStarted && key === " ") {
    startGame();
  } else if (key === "p") {
    togglePause();
  } else if (key === "m") {
    toggleWrapMode();
  } else {
    const newDirection = getDirectionFromKey(key);
    if (newDirection) nextDirection = newDirection;
  }
});

// Convert key press to movement direction
function getDirectionFromKey(key) {
  const oppositeDirections = {
    up: "down",
    down: "up",
    left: "right",
    right: "left",
  };
  const directions = {
    w: "up",
    arrowup: "up",
    s: "down",
    arrowdown: "down",
    a: "left",
    arrowleft: "left",
    d: "right",
    arrowright: "right",
  };

  if (directions[key] && directions[key] !== oppositeDirections[direction]) {
    return directions[key];
  }
  return null;
}

// Increase Game Speed
function increaseSpeed() {
  if (gameSpeed > 80) gameSpeed -= 5;
}

// Check Collision
function checkCollision() {
  const head = snake[0];

  if (
    !wrapMode &&
    (head.x < 1 || head.x > gridSize || head.y < 1 || head.y > gridSize)
  ) {
    triggerGameOver();
  }

  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      triggerGameOver();
    }
  }
}

// Game Over Effect
function triggerGameOver() {
  isGameOver = true;
  gameStarted = false;
  gamePaused = false;
  instructionText.innerHTML = "GAME OVER <br> Press Space to Restart";
  instructionText.style.display = "block";
  playSound("game-over"); // Play game over sound
  updateHighScore();
}

// Reset Game
function resetGame() {
  snake = [{ x: 10, y: 10 }];
  food = generateFood();
  direction = "right";
  nextDirection = "right";
  gameSpeed = 200;
}

// Update Score
function updateScore() {
  const currentScore = snake.length - 1;
  score.textContent = currentScore.toString().padStart(3, "0");
}

// Update High Score
function updateHighScore() {
  const currentScore = snake.length - 1;
  if (currentScore > highScore) {
    highScore = currentScore;
    highScoreText.textContent = highScore.toString().padStart(3, "0");
  }
  highScoreText.style.display = "block";
}

// Toggle Pause
function togglePause() {
  gamePaused = !gamePaused;
  instructionText.style.display = gamePaused ? "block" : "none";
  instructionText.innerHTML = gamePaused ? "PAUSED <br> Press P to Resume" : "";
}

// Toggle Wrap Mode
function toggleWrapMode() {
  wrapMode = !wrapMode;
  instructionText.innerHTML = wrapMode
    ? "WRAP MODE: ON <br> Press M to Toggle"
    : "WRAP MODE: OFF <br> Press M to Toggle";
  instructionText.style.display = "block";
  setTimeout(() => {
    if (gameStarted) instructionText.style.display = "none";
  }, 2000);
}

// Play Sound Effects
function playSound(sound) {
  const audio = new Audio(`sounds/${sound}.mp3`);
  audio.play();
}

// Preload Sounds
function preloadSounds() {
  const sounds = ["eat", "game-over"];
  sounds.forEach((sound) => {
    new Audio(`sounds/${sound}.mp3`);
  });
}

// Initialize
preloadSounds();

// Mobile Controls
const upButton = document.getElementById("up");
const leftButton = document.getElementById("left");
const downButton = document.getElementById("down");
const rightButton = document.getElementById("right");

// Add touch events for mobile controls
upButton.addEventListener("touchstart", () => handleDirectionChange("up"));
leftButton.addEventListener("touchstart", () => handleDirectionChange("left"));
downButton.addEventListener("touchstart", () => handleDirectionChange("down"));
rightButton.addEventListener("touchstart", () => handleDirectionChange("right"));

// Prevent default touch behavior
document.addEventListener("touchstart", (e) => {
  if (e.target.classList.contains("mobile-controls")) {
    e.preventDefault();
  }
});

// Start game on touch for mobile users
board.addEventListener("touchstart", () => {
  if (!gameStarted) {
    startGame();
  }
});


function handleDirectionChange(newDirection) {
  if (gameStarted) {
    const oppositeDirections = {
      up: "down",
      down: "up",
      left: "right",
      right: "left",
    };
    if (newDirection !== oppositeDirections[direction]) {
      nextDirection = newDirection;
    }
  }
}
