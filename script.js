// Define HTML elements
const board = document.getElementById('game-board');
const instructionText = document.getElementById('instruction-text');
const logo = document.getElementById('logo');
const score = document.getElementById('score');
const highScoreText = document.getElementById('highScore');

// Define game variables
const gridSize = 20;
let snake = [{ x: 10, y: 10 }]; // Initial snake position
let food = generateFood(); // Generate initial food position
let highScore = 0; // Initialize high score
let direction = 'right'; // Initial direction of the snake
let gameInterval; // Variable to hold game interval
let gameSpeedDelay = 200; // Initial game speed delay in milliseconds
let gameStarted = false; // Flag to track if the game is running or not

// Draw game map, snake, food
function draw() {
  board.innerHTML = ''; // Clear previous board state
  drawSnake(); // Draw the snake on the board
  drawFood(); // Draw the food on the board
  updateScore(); // Update the current score display
}

// Draw snake function
function drawSnake() {
  snake.forEach((segment) => {
    const snakeElement = createGameElement('div', 'snake'); // Create snake element
    setPosition(snakeElement, segment); // Set position of snake element
    board.appendChild(snakeElement); // Append snake element to the board
  });
}

// Function to create game elements (snake or food)
function createGameElement(tag, className) {
  const element = document.createElement(tag); // Create HTML element
  element.className = className; // Set element's class name (for styling)
  return element; // Return created element
}

// Function to set position of snake or food element on the board
function setPosition(element, position) {
  element.style.gridColumn = position.x; // Set column position on the grid
  element.style.gridRow = position.y; // Set row position on the grid
}

// Draw food function
function drawFood() {
  if (gameStarted) {
    const foodElement = createGameElement('div', 'food'); // Create food element
    setPosition(foodElement, food); // Set position of food element
    board.appendChild(foodElement); // Append food element to the board
  }
}

// Generate random position for food within the grid
function generateFood() {
  const x = Math.floor(Math.random() * gridSize) + 1; // Random X coordinate
  const y = Math.floor(Math.random() * gridSize) + 1; // Random Y coordinate
  return { x, y }; // Return generated food position
}

// Function to move the snake
function move() {
  const head = { ...snake[0] }; // Copy the current head position of the snake

  // Move the snake's head based on the current direction
  switch (direction) {
    case 'up':
      head.y--;
      break;
    case 'down':
      head.y++;
      break;
    case 'left':
      head.x--;
      break;
    case 'right':
      head.x++;
      break;
  }

  snake.unshift(head); // Add the new head position to the snake

  // Check if the snake has eaten the food
  if (head.x === food.x && head.y === food.y) {
    food = generateFood(); // Generate new food position
    increaseSpeed(); // Increase game speed
    clearInterval(gameInterval); // Clear previous game interval
    // Set new game interval for continuous movement
    gameInterval = setInterval(() => {
      move(); // Move the snake
      checkCollision(); // Check for collisions
      draw(); // Redraw the game board
    }, gameSpeedDelay);
  } else {
    snake.pop(); // Remove the tail segment of the snake
  }
}

// Function to start the game
function startGame() {
  gameStarted = true; // Set game as started
  instructionText.style.display = 'none'; // Hide instruction text
  logo.style.display = 'none'; // Hide game logo
  // Set interval for continuous movement and game updates
  gameInterval = setInterval(() => {
    move(); // Move the snake
    checkCollision(); // Check for collisions
    draw(); // Redraw the game board
  }, gameSpeedDelay);
}

// Event listener for keyboard input (controls)
function handleKeyPress(event) {
  if (
    (!gameStarted && event.code === 'Space') || // Start game with Spacebar
    (!gameStarted && event.key === ' ')
  ) {
    startGame(); // Start the game
  } else {
    // Change direction based on arrow or WASD keys
    switch (event.key) {
      case 'w':
        direction = 'up';
        break;
      case 's':
        direction = 'down';
        break;
      case 'a':
        direction = 'left';
        break;
      case 'd':
        direction = 'right';
        break;
    }
  }
}

// Event listener for keyboard input
document.addEventListener('keydown', handleKeyPress);

// Function to increase game speed as snake grows
function increaseSpeed() {
  // Adjust game speed delay based on current speed
  if (gameSpeedDelay > 150) {
    gameSpeedDelay -= 5;
  } else if (gameSpeedDelay > 100) {
    gameSpeedDelay -= 3;
  } else if (gameSpeedDelay > 50) {
    gameSpeedDelay -= 2;
  } else if (gameSpeedDelay > 25) {
    gameSpeedDelay -= 1;
  }
}

// Function to check for collisions with walls or itself
function checkCollision() {
  const head = snake[0]; // Get current head position of the snake

  // Check if snake hits the walls of the game grid
  if (head.x < 1 || head.x > gridSize || head.y < 1 || head.y > gridSize) {
    resetGame(); // Reset the game
  }

  // Check if snake collides with itself (body segments)
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      resetGame(); // Reset the game
    }
  }
}

// Function to reset the game state
function resetGame() {
  updateHighScore(); // Update the high score if necessary
  stopGame(); // Stop the game
  snake = [{ x: 10, y: 10 }]; // Reset snake to initial position
  food = generateFood(); // Generate new food position
  direction = 'right'; // Reset direction to right
  gameSpeedDelay = 200; // Reset game speed delay
  updateScore(); // Update the current score display
}

// Function to update the current score display
function updateScore() {
  const currentScore = snake.length - 1; // Calculate current score
  score.textContent = currentScore.toString().padStart(3, '0'); // Update score display
}

// Function to stop the game
function stopGame() {
  clearInterval(gameInterval); // Clear game interval
  gameStarted = false; // Set game as not started
  instructionText.style.display = 'block'; // Show instruction text
  logo.style.display = 'block'; // Show game logo
}

// Function to update the high score display
function updateHighScore() {
  const currentScore = snake.length - 1; // Calculate current score

  // Update high score if current score is higher
  if (currentScore > highScore) {
    highScore = currentScore; // Update high score
    highScoreText.textContent = highScore.toString().padStart(3, '0'); // Update high score display
  }
  highScoreText.style.display = 'block'; // Show high score text
}
