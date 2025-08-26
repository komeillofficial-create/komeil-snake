const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const box = 20;
let snake;
let food;
let dx;
let dy;
let score;
let highScore = localStorage.getItem("highScore") || 0;
let gameInterval;
let speed;
let isPaused = false;

document.getElementById("highscore").innerText = "High Score: " + highScore;

document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("pauseBtn").addEventListener("click", pauseGame);
document.getElementById("restartBtn").addEventListener("click", startGame);

function startGame() {
  snake = [{ x: 9 * box, y: 10 * box }];
  dx = box;
  dy = 0;
  score = 0;
  speed = 200;
  food = {
    x: Math.floor(Math.random() * 20) * box,
    y: Math.floor(Math.random() * 20) * box
  };
  clearInterval(gameInterval);
  gameInterval = setInterval(draw, speed);
}

function pauseGame() {
  isPaused = !isPaused;
}

function draw() {
  if (isPaused) return;

  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? "lime" : "green";
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
    ctx.strokeStyle = "black";
    ctx.strokeRect(snake[i].x, snake[i].y, box, box);
  }

  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, box, box);

  let snakeX = snake[0].x + dx;
  let snakeY = snake[0].y + dy;

  if (snakeX === food.x && snakeY === food.y) {
    score++;
    document.getElementById("score").innerText = "Score: " + score;
    document.getElementById("eatSound").play();

    food = {
      x: Math.floor(Math.random() * 20) * box,
      y: Math.floor(Math.random() * 20) * box
    };

    if (score % 5 === 0) {
      clearInterval(gameInterval);
      speed = speed > 50 ? speed - 20 : speed;
      gameInterval = setInterval(draw, speed);
    }
  } else {
    snake.pop();
  }

  const newHead = { x: snakeX, y: snakeY };

  if (
    snakeX < 0 ||
    snakeY < 0 ||
    snakeX >= canvas.width ||
    snakeY >= canvas.height ||
    collision(newHead, snake)
  ) {
    clearInterval(gameInterval);
    document.getElementById("gameOverSound").play();
    gameOver();
    return;
  }

  snake.unshift(newHead);
}

function collision(head, array) {
  for (let i = 0; i < array.length; i++) {
    if (head.x === array[i].x && head.y === array[i].y) {
      return true;
    }
  }
  return false;
}

document.addEventListener("keydown", direction);

function direction(event) {
  if (event.keyCode === 37 && dx === 0) {
    dx = -box;
    dy = 0;
  } else if (event.keyCode === 38 && dy === 0) {
    dx = 0;
    dy = -box;
  } else if (event.keyCode === 39 && dx === 0) {
    dx = box;
    dy = 0;
  } else if (event.keyCode === 40 && dy === 0) {
    dx = 0;
    dy = box;
  }
}

function gameOver() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
    document.getElementById("highscore").innerText = "High Score: " + highScore;
  }
  sendScoreToTelegram(score);
  alert("Game Over! Your score: " + score);
}