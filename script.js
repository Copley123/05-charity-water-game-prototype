// Log a message to the console to ensure the script is linked correctly
console.log('JavaScript file is linked correctly.');

// Simple bucket movement for beginners
// Wait until the page is loaded
window.onload = function() {
  // Get the bucket and arrow buttons
  const bucket = document.getElementById('bucket');
  const leftArrow = document.getElementById('left-arrow');
  const rightArrow = document.getElementById('right-arrow');
  const gameArea = document.getElementById('game-area');
  // Get the score display
  const scoreDisplay = document.getElementById('score');
  const pauseBtn = document.getElementById('pause-btn');
  const timerDisplay = document.getElementById('timer');
  const restartBtn = document.getElementById('restart-btn');
  let isPaused = false;
  let dropletIntervals = [];
  let timer = 0;
  let timerInterval;
  let gameEnded = false;

  // Set the starting position (in percent from the left)
  let bucketPosition = 50; // percent, center
  let score = 0;

  // Function to update the bucket's position
  function updateBucket() {
    bucket.style.left = `${bucketPosition}%`;
    bucket.style.transform = 'translateX(-50%)';
  }

  // Function to update the score display
  function updateScore() {
    scoreDisplay.textContent = `Score: ${score}`;
  }

  // Function to update the timer display
  function updateTimer() {
    timerDisplay.textContent = `Time: ${timer}`;
  }

  // Move left when left arrow is clicked
  leftArrow.addEventListener('click', function() {
    // Only move if not paused
    if (isPaused) return;
    // Move left by 10%, but don't go off screen
    if (bucketPosition > 10) {
      bucketPosition -= 10;
    }
    updateBucket();
  });

  // Move right when right arrow is clicked
  rightArrow.addEventListener('click', function() {
    // Only move if not paused
    if (isPaused) return;
    // Move right by 10%, but don't go off screen
    if (bucketPosition < 90) {
      bucketPosition += 10;
    }
    updateBucket();
  });

  // Function to pause or resume the game
  function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
      pauseBtn.textContent = '▶️'; // Show play icon
    } else {
      pauseBtn.textContent = '⏸️'; // Show pause icon
    }
  }

  // Pause button event
  pauseBtn.addEventListener('click', togglePause);

  // Function to end the game :O
  function endGame() {
    gameEnded = true;
    clearInterval(timerInterval);
    isPaused = true;
    pauseBtn.textContent = '▶️';
    // Show a message overlay
    const messageOverlay = document.getElementById('message-overlay');
    messageOverlay.style.display = 'block';
    // Show 'Good Job!' if score > 0, else show 'Time's up! Try again!'
    if (score > 0) {
      messageOverlay.textContent = 'Good Job!';
    } else {
      messageOverlay.textContent = "Time's up! Try again!";
    }
  }

  // Start the timer
  function startTimer() {
    timerInterval = setInterval(function() {
      if (!isPaused && !gameEnded) {
        timer += 1;
        updateTimer();
        // At 55 seconds, change sky and ground colors
        if (timer === 55) {
          document.body.classList.add('pink-sky');
          document.getElementById('game-area').classList.add('pink-sky');
          document.getElementById('ground').classList.add('purple-ground');
        }
        // End game at 60 seconds
        if (timer === 60) {
          endGame();
        }
      }
    }, 1000);
  }

  // Set initial position
  updateBucket();
  updateScore();
  updateTimer();
  startTimer();

  // --- DROPLETS ---
  // Function to create a droplet at a random cloud
  function createDroplet() {
    if (isPaused) return; // Don't create new droplets if paused
    // Pick a random cloud position (left percent)
    const cloudPositions = [10, 40, 70];
    const leftPercent = cloudPositions[Math.floor(Math.random() * cloudPositions.length)] + Math.random() * 10 - 5;
    // Decide droplet type: blue (clean) or green (polluted)
    const isPolluted = Math.random() < 0.3; // 30% chance to be polluted
    // Create droplet element
    const droplet = document.createElement('div');
    droplet.className = 'droplet';
    droplet.style.position = 'absolute';
    droplet.style.left = `${leftPercent}%`;
    droplet.style.top = '40px'; // just below clouds
    droplet.style.width = '20px';
    droplet.style.height = '30px';
    droplet.style.background = isPolluted ? '#4FCB53' : '#2E9DF7'; // green or blue
    droplet.style.borderRadius = '50% 50% 60% 60% / 60% 60% 100% 100%';
    droplet.style.zIndex = 10;
    droplet.style.border = '2px solid #000'; // black outline
    // Add to game area
    gameArea.appendChild(droplet);
    // Animate falling
    let topPos = 40;
    const fallInterval = setInterval(function() {
      if (isPaused) return; // Stop moving if paused
      topPos += 3; // move down by 3px
      droplet.style.top = `${topPos}px`;
      // Check for collision with bucket
      const dropletRect = droplet.getBoundingClientRect();
      const bucketRect = bucket.getBoundingClientRect();
      // Simple collision check
      if (
        dropletRect.bottom > bucketRect.top &&
        dropletRect.left < bucketRect.right &&
        dropletRect.right > bucketRect.left &&
        dropletRect.top < bucketRect.bottom
      ) {
        // Droplet is caught!
        if (isPolluted) {
          // Polluted drop: decrease score by 1, but not below 0
          score = score > 0 ? score - 1 : 0;
        } else {
          // Clean drop: increase score by 1
          score += 1;
        }
        updateScore();
        gameArea.removeChild(droplet);
        clearInterval(fallInterval);
        return;
      }
      // Remove droplet if it goes off screen
      if (topPos > gameArea.offsetHeight - 60) {
        gameArea.removeChild(droplet);
        clearInterval(fallInterval);
      }
    }, 30);
    dropletIntervals.push(fallInterval);
  }

  // Create a new droplet every 1 second
  setInterval(function() {
    if (!isPaused) {
      createDroplet();
    }
  }, 1000);

  // Function to restart the game
  function restartGame() {
    // Reset timer, score, and state
    timer = 0;
    score = 0;
    gameEnded = false;
    isPaused = false;
    pauseBtn.textContent = '⏸️';
    // Remove overlays and color changes
    document.getElementById('message-overlay').style.display = 'none';
    document.body.classList.remove('pink-sky');
    document.getElementById('game-area').classList.remove('pink-sky');
    document.getElementById('ground').classList.remove('purple-ground');
    // Remove all droplets
    const droplets = document.querySelectorAll('.droplet');
    droplets.forEach(function(drop) {
      if (drop.parentNode) drop.parentNode.removeChild(drop);
    });
    // Reset displays
    updateScore();
    updateTimer();
    // Restart timer
    clearInterval(timerInterval);
    startTimer();
  }

  // Restart button event
  restartBtn.addEventListener('click', restartGame);
};
