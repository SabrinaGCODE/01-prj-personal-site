let goalCans = 20;
let currentCans = 0;
let gameActive = false;
let spawnInterval;
let timeLeft = 30;
let timerInterval;
let achievementTimeout;
let selectedDifficulty = 'normal';

function resolveAssetPath(relativePath) {
  return new URL(relativePath, window.location.href).href;
}

const collectSound = new Audio(resolveAssetPath('sounds/collect.mp3'));
collectSound.preload = 'auto';

const difficultySettings = {
  easy: { time: 40, goal: 15, speed: 1700 },
  normal: { time: 30, goal: 20, speed: 1500 },
  hard: { time: 20, goal: 25, speed: 1000 }
};

function createGrid() {
  const grid = document.querySelector('.game-grid');
  grid.innerHTML = '';

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    grid.appendChild(cell);
  }
}

function updateScore() {
  const scoreDisplay = document.getElementById('current-cans');
  if (scoreDisplay) {
    scoreDisplay.textContent = currentCans;
  }
}

function updateTimer() {
  const timerDisplay = document.getElementById('timer');
  if (timerDisplay) {
    timerDisplay.textContent = timeLeft;
  }
}

function showAchievement(message) {
  const achievementBox = document.getElementById('achievements');
  if (!achievementBox) return;

  achievementBox.textContent = message;

  clearTimeout(achievementTimeout);
  achievementTimeout = setTimeout(() => {
    achievementBox.textContent = '';
  }, 3500);
}

function setDifficulty(level) {
  selectedDifficulty = level;

  const settings = difficultySettings[level];
  goalCans = settings.goal;
  timeLeft = settings.time;

  updateTimer();
  showAchievement(`Difficulty set to ${level}.`);
}

function spawnWaterCan() {
  if (!gameActive) return;

  const cells = document.querySelectorAll('.grid-cell');
  cells.forEach(cell => {
    cell.innerHTML = '';
  });

  const randomCell = cells[Math.floor(Math.random() * cells.length)];

  const wrapper = document.createElement('div');
  wrapper.className = 'water-can-wrapper';

  const can = document.createElement('div');
  can.className = 'water-can';
  can.style.backgroundImage = `url("${resolveAssetPath('img/water-can.png')}")`;

  wrapper.appendChild(can);
  randomCell.appendChild(wrapper);

  wrapper.addEventListener('click', function () {
    if (!gameActive) return;

    currentCans++;
    updateScore();

    collectSound.currentTime = 0;
    collectSound.play().catch(error => {
      console.log('Sound could not play:', error);
    });

    wrapper.remove();

    if (currentCans === 5) {
      showAchievement('Nice start! 5 cans collected.');
    } else if (currentCans === 10) {
      showAchievement('Great job! 10 cans collected.');
    } else if (currentCans === 15) {
      showAchievement('Almost there! 15 cans collected.');
    }

    if (currentCans >= goalCans) {
      endGame();
      showAchievement('You win! You collected enough water cans!');
    }
  }, { once: true });
}

function startGame() {
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  clearTimeout(achievementTimeout);

  const settings = difficultySettings[selectedDifficulty];

  currentCans = 0;
  goalCans = settings.goal;
  timeLeft = settings.time;
  gameActive = true;

  updateScore();
  updateTimer();

  const achievementBox = document.getElementById('achievements');
  if (achievementBox) {
    achievementBox.textContent = '';
  }

  const startButton = document.getElementById('start-game');
  if (startButton) {
    startButton.style.display = 'none';
  }

  const difficultyButtons = document.getElementById('difficulty-buttons');
  if (difficultyButtons) {
    difficultyButtons.style.display = 'none';
  }

  createGrid();
  spawnWaterCan();

  spawnInterval = setInterval(spawnWaterCan, settings.speed);

  timerInterval = setInterval(() => {
    if (!gameActive) return;

    timeLeft--;
    updateTimer();

    if (timeLeft <= 0) {
      endGame();
      showAchievement('Time is up! Try again.');
    }
  }, 1000);
}

function endGame() {
  gameActive = false;
  clearInterval(spawnInterval);
  clearInterval(timerInterval);

  const startButton = document.getElementById('start-game');
  if (startButton) {
    startButton.style.display = 'inline-block';
    startButton.textContent = 'Play Again';
  }

  const difficultyButtons = document.getElementById('difficulty-buttons');
  if (difficultyButtons) {
    difficultyButtons.style.display = 'flex';
  }

  const cells = document.querySelectorAll('.grid-cell');
  cells.forEach(cell => {
    cell.innerHTML = '';
  });
}

createGrid();
updateScore();
updateTimer();

if (window.location.protocol === 'file:') {
  showAchievement('Tip: use a local server for best results (http://localhost).');
}

document.getElementById('start-game').addEventListener('click', startGame);
