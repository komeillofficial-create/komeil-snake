const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let box = 20;
let snake = [{ x: 9 * box, y: 10 * box }];
let direction = "RIGHT";
let food = {
  x: Math.floor(Math.random() * 19) * box,
  y: Math.floor(Math.random() * 19) * box
};
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let game;
let speed = 150;
let isPaused = false;

// 🎵 صداها
const eatSound = new Audio("eat.mp3");
const gameOverSound = new Audio("gameover.mp3");

// 🎮 کنترل با کیبورد
document.addEventListener("keydown", event => {
  if (event.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  else if (event.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
  else if (event.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  else if (event.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
});

// 📱 کنترل با دکمه‌های موبایل
document.getElementById("up").addEventListener("click", () => {
  if (direction !== "DOWN") direction = "UP";
});
document.getElementById("down").addEventListener("click", () => {
  if (direction !== "UP") direction = "DOWN";
});
document.getElementById("left").addEventListener("click", () => {
  if (direction !== "RIGHT") direction = "LEFT";
});
document.getElementById("right").addEventListener("click", () => {
  if (direction !== "LEFT") direction = "RIGHT";
});

// 🎮 دکمه‌ها
document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("pauseBtn").addEventListener("click", pauseGame);
document.getElementById("restartBtn").addEventListener("click", restartGame);

function draw() {
  if (isPaused) return;

  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 🐍 کشیدن مار
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? "lime" : "green";
    ctx.fillRect(snake[i].x, snake[i].y, box, box);

    ctx.strokeStyle = "#111";
    ctx.strokeRect(snake[i].x, snake[i].y, box, box);
  }

  // 🍎 کشیدن غذا
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(food.x + box / 2, food.y + box / 2, box / 2 - 2, 0, 2 * Math.PI);
  ctx.fill();

  // حرکت مار
  let snakeX = snake[0].x;
  let snakeY = snake[0].y;

  if (direction === "LEFT") snakeX -= box;
  if (direction === "UP") snakeY -= box;
  if (direction === "RIGHT") snakeX += box;
  if (direction === "DOWN") snakeY += box;

  // اگر غذا خورد
  if (snakeX === food.x && snakeY === food.y) {
    score++;
    eatSound.play();
    food = {
      x: Math.floor(Math.random() * 19) * box,
      y: Math.floor(Math.random() * 19) * box
    };

    // سخت‌تر شدن
    if (score % 5 === 0 && speed > 50) {
      clearInterval(game);
      speed -= 10;
      game = setInterval(draw, speed);
    }
  } else {
    snake.pop();
  }

  let newHead = { x: snakeX, y: snakeY };

  // باختن (خوردن به دیوار یا خودش)
  if (
    snakeX < 0 ||
    snakeY < 0 ||
    snakeX >= canvas.width ||
    snakeY >= canvas.height ||
    collision(newHead, snake)
  ) {
    clearInterval(game);
    gameOverSound.play();
    ctx.fillStyle = "red";
    ctx.font = "30px Arial";
    ctx.fillText("💀 باختی! 💀", canvas.width / 4, canvas.height / 2);

    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
    }
    return;
  }

  snake.unshift(newHead);

  // امتیاز
  document.getElementById("score").textContent = score;
  document.getElementById("highScore").textContent = highScore;
}

function collision(head, array) {
  for (let i = 0; i < array.length; i++) {
    if (head.x === array[i].x && head.y === array[i].y) {
      return true;
    }
  }
  return false;
}

function startGame() {
  if (!game) {
    game = setInterval(draw, speed);
  }
}

function pauseGame() {
  isPaused = !isPaused;
  document.getElementById("pauseBtn").textContent = isPaused ? "▶️ Resume" : "⏸ Pause";
}

function restartGame() {
  clearInterval(game);
  snake = [{ x: 9 * box, y: 10 * box }];
  direction = "RIGHT";
  score = 0;
  speed = 150;
  isPaused = false;
  game = setInterval(draw, speed);
}
