// Get the elements
const playButton = document.getElementById('play-btn');
const homeScreen = document.getElementById('home-screen');
const gameArea = document.getElementById('game-area');
const player = document.getElementById('player');
const heartContainer = document.getElementById("heart-container");
let boxes;
let zombies;

// Define constants and variables
const GRAVITY = 0.25; // Gravity force
const JUMP_STRENGTH = 4.5; // How high the player can jump
const FRICTION = 0.7; // Deceleration for horizontal movement
const STEP = 0.275; // How much the player moves horizontally with each key press
const ZOMBIESTEP = 0.1; // How much zombies move horizontallly every frame
const AIRACCELERATION = 0.15; // How much the player accelerates while in the air
const AIRRESISTANCE = 0.95; // Horizontal deceleration in air
const I_FRAMES = 20; // Invicibility length between hits
let horizontalPosition = 3.4; // Horizontal position as a percentage
let verticalPosition = 75.9; // Vertical position as a percentage
let velocityX = 0; // Horizontal velocity
let velocityY = 0; // Vertical velocity (gravity / jumping)
let maxHealth = 10; // Player's max health
let health = 10; // Player's current health
let iframes = 0; // Invincibility length between hits

// Flags for key states
let isJumping = false;
let canJump = true;
let isMovingLeft = false;
let isMovingRight = false;
let onBox = false;

// Levels
const blockLevels = [
	[
		{ left: "0%", top: "86.2%" },
		{ left: "6.25%", top: "86.2%" },
		{ left: "12.5%", top: "86.2%" },
		{ left: "18.75%", top: "86.2%" },
		{ left: "25%", top: "86.2%" },
		{ left: "31.25%", top: "86.2%" },
		{ left: "37.5%", top: "86.2%" },
		{ left: "43.75%", top: "86.2%" },
		{ left: "50%", top: "86.2%" },
		{ left: "56.25%", top: "86.2%" },
		{ left: "62.5%", top: "86.2%" },
		{ left: "68.75%", top: "86.2%" },
		{ left: "75%", top: "86.2%" },
		{ left: "81.25%", top: "86.2%" },
		{ left: "87.5%", top: "86.2%" },
		{ left: "93.75%", top: "86.2%" },
		{ left: "75%", top: "73%" },
		{ left: "75%", top: "59.8%" },
		{ left: "37.5%", top: "73%" },
		{ left: "56.25%", top: "73%" },
		{ left: "93.75%", top: "73%" },
		{ left: "93.75%", top: "59.8%" },
		{ left: "93.75%", top: "46.6%" },
		{ left: "12.5%", top: "33.4%" },
		{ left: "6.25%", top: "33.4%" },
	],
	[
		{ left: "0%", top: "86.2%" },
		{ left: "6.25%", top: "86.2%" },
		{ left: "12.5%", top: "86.2%" },
		{ left: "18.75%", top: "86.2%" },
		{ left: "25%", top: "86.2%" },
		{ left: "31.25%", top: "86.2%" },
		{ left: "37.5%", top: "86.2%" },
		{ left: "43.75%", top: "86.2%" },
		{ left: "50%", top: "86.2%" },
		{ left: "56.25%", top: "86.2%" },
		{ left: "62.5%", top: "86.2%" },
		{ left: "68.75%", top: "86.2%" },
		{ left: "75%", top: "86.2%" },
		{ left: "81.25%", top: "86.2%" },
		{ left: "87.5%", top: "86.2%" },
		{ left: "93.75%", top: "86.2%" },
		{ left: "43.75%", top: "46.6%" },
		{ left: "37.5%", top: "46.6%" },
		{ left: "37.5%", top: "33.4%" },
		{ left: "62.5%", top: "73%" },
		{ left: "87.5%", top: "73%" },
		{ left: "87.5%", top: "59.8%" },
		{ left: "18.75%", top: "73%" },
		{ left: "18.75%", top: "59.8%" }
	],
];
const zombieLevels = [
	[
		{ left: "65%", top: "66%" },
	],
	[
		{ left: "50%", top: "66%" },
	],
];
let currentLevel = 0;

// Renders health
function renderHearts() {
	heartContainer.innerHTML = ""; // Clear existing hearts

	// Loop through maxHealth to render each heart
	for (let i = 0; i < maxHealth; i += 2) {
		const heart = document.createElement("div");
		heart.classList.add("heart");

		if (health >= i + 2) {
			// Full heart
			heart.classList.add("full-heart");
		} else if (health === i + 1) {
			// Half heart
			heart.classList.add("half-heart");
		} else {
			// Empty heart
			heart.classList.add("empty-heart");
		}

		heartContainer.appendChild(heart);
	}
}
renderHearts()

function loadLevel(levelIndex) {
	// Clear existing blocks and zombies
	const existingBlocks = document.querySelectorAll('.brick');
	const existingZombies = document.querySelectorAll('.zombie');
	existingBlocks.forEach((block) => block.remove());
	existingZombies.forEach((zombie) => zombie.remove());

	// Add new blocks
	const blockLevel = blockLevels[levelIndex];
	blockLevel.forEach((block) => {
		const brick = document.createElement('div');
		brick.className = 'brick';
		brick.style.left = block.left;
		brick.style.top = block.top;
		gameArea.appendChild(brick);
	});

	// Add new blocks
	const zombieLevel = zombieLevels[levelIndex];
	zombieLevel.forEach((zombie) => {
		const newzombie = document.createElement('div');
		newzombie.className = 'zombie';
		newzombie.style.left = zombie.left;
		newzombie.style.top = zombie.top;
		gameArea.appendChild(newzombie);
	});

	// Update variables to include new objects
	boxes = document.querySelectorAll('.brick');
	zombies = document.querySelectorAll('.zombie');
}


// Check for collisions
function checkCollision(rect1, rect2) {
	return (
		rect1.left < rect2.right &&
		rect1.right > rect2.left &&
		rect1.top < rect2.bottom &&
		rect1.bottom > rect2.top
	);
}

// Listen for keydown events to move the player
document.addEventListener('keydown', (event) => {
	switch (event.key.toLowerCase()) {
		case 'a': // Move left
			isMovingLeft = true;
            player.style.backgroundImage = "url('PlayerSkin2.png')";
			break;
		case 'd': // Move right
			isMovingRight = true;
            player.style.backgroundImage = "url('PlayerSkin.png')";
			break;
		case 'w': // Jump
			if (canJump) {
				velocityY = -JUMP_STRENGTH; // Apply jump force
				canJump = false;
			}
            isJumping = true;
			break;
	}
});

// Listen for keyup events to stop movement
document.addEventListener('keyup', (event) => {
	switch (event.key.toLowerCase()) {
		case 'a': // Stop moving left
			isMovingLeft = false;
            if (isMovingRight) {
                player.style.backgroundImage = "url('PlayerSkin.png')";
            }
			break;
		case 'd': // Stop moving right
			isMovingRight = false;
            if (isMovingLeft) {
                player.style.backgroundImage = "url('PlayerSkin2.png')";
            }
			break;
        case 'w':
            isJumping = false;
            break;
	}
});

// When the play button is clicked, hide the home screen and show the game
playButton.addEventListener('click', () => {
	homeScreen.classList.add('hidden'); // Hide the home screen
	gameArea.classList.add('show'); // Show the game area
	loadLevel(0); // Load the first level
	requestAnimationFrame(gameLoop); // Start the game loop
});

// Game loop (updates position every frame)
function gameLoop() {

	if (iframes > 0) {
		iframes--;
	}

	// Apply gravity
	velocityY += GRAVITY; // Make the player fall due to gravity

	// Reduce horizontal acceleration if the player is jumping
	if (!canJump) {
        velocityX *= AIRRESISTANCE; // apply air resistance when in air
		if (isMovingLeft) {
			velocityX = Math.max(velocityX - (STEP * AIRACCELERATION), -0.8); // Move left, with velocity limit
		}
		if (isMovingRight) {
			velocityX = Math.min(velocityX + (STEP * AIRACCELERATION), 0.8); // Move right, with velocity limit
		}
	} else {
        velocityX *= FRICTION; // Apply friction to horizontal velocity

		if (isMovingLeft) {
			velocityX = Math.max(velocityX - STEP, -0.8); // Move left, with velocity limit
		}
		if (isMovingRight) {
			velocityX = Math.min(velocityX + STEP, 0.8); // Move right, with velocity limit
		}
    }

	// Check for collisions with zombies and make zombie face player
	const currentPlayerRect = player.getBoundingClientRect();
	for (const zombie of zombies) {
		const zombieRect = zombie.getBoundingClientRect();
		if (currentPlayerRect.left < zombieRect.left) {
			zombie.style.backgroundImage = "url('ZombieSkin.png')";
			if (checkCollision(currentPlayerRect, zombieRect) && iframes === 0) {
				health--;
				renderHearts();
				velocityX -= 1;
				velocityY -= 1;
				iframes = I_FRAMES;
			}
		} else {
			zombie.style.backgroundImage = "url('ZombieSkin2.png')";
			if (checkCollision(currentPlayerRect, zombieRect) && iframes === 0) {
				health--;
				renderHearts();
				velocityX += 1;
				velocityY += 1;
				iframes = I_FRAMES;
			}
		}
	}

	// Predict next position
	const nextHorizontalPosition = horizontalPosition + velocityX;
	const nextVerticalPosition = verticalPosition + velocityY;

	// Check for collisions with boxes
	const playerRect = {
		left: ((nextHorizontalPosition - 3.14) / 100) * gameArea.clientWidth,
		right: ((nextHorizontalPosition + 3.14) / 100) * gameArea.clientWidth,
		top: ((nextVerticalPosition - 10.42) / 100) * gameArea.clientHeight,
		bottom: ((nextVerticalPosition + 10.42) / 100) * gameArea.clientHeight,
	};

	// Check for collisions with boxes
	let currentlyOnBox = false;
	for (const box of boxes) {
		const boxRect = box.getBoundingClientRect();
		if (checkCollision(playerRect, boxRect)) {
			const overlapX = Math.min(playerRect.right - boxRect.left, boxRect.right - playerRect.left);
			const overlapY = Math.min(playerRect.bottom - boxRect.top, boxRect.bottom - playerRect.top);
			if (overlapX < overlapY) {
				if (playerRect.right > boxRect.left && velocityX > 0 && playerRect.left < boxRect.left) {
					horizontalPosition = (boxRect.right / gameArea.clientWidth) * 100 - 9.9;
					velocityX = 0; // Stop horizontal movement
				} else if (playerRect.left < boxRect.right && velocityX < 0 && playerRect.right > boxRect.right) {
					horizontalPosition = (boxRect.left / gameArea.clientWidth) * 100 + 9.9;
					velocityX = 0; // Stop horizontal movement
				}
			} else {
				if (playerRect.bottom > boxRect.top && velocityY > 0 && playerRect.top < boxRect.bottom) {
					verticalPosition = (boxRect.top / gameArea.clientHeight) * 100 - 10.42;
					if (isJumping) {
						velocityY = -JUMP_STRENGTH; // Apply jump force
					} else {
						canJump = true;
						velocityY = 0;
					}
					onBox = true;
					currentlyOnBox = true;
				} else if (playerRect.top < boxRect.bottom && velocityY < 0 && playerRect.bottom > boxRect.top) {
					verticalPosition = (boxRect.bottom / gameArea.clientHeight) * 100 + 10.42;
					velocityY = 0;
				}
			}
		}
	}
	if (onBox && currentlyOnBox === false) {
		onBox = false;
		canJump = false;
	}

	// Update horizontal and vertical position
	horizontalPosition += velocityX;
	verticalPosition += velocityY;

	// Collision with the ground (stop falling)
	if (verticalPosition > 75.9) {
		verticalPosition = 75.9;
		velocityY = 0; // Stop downward velocity
        if (isJumping) {
            velocityY = -JUMP_STRENGTH; // Apply jump force
        } else {
            canJump = true;
			velocityY = 0;
        }
	}

	// Restrict horizontal movement (ensure player stays within the game area)
	horizontalPosition = Math.max(3.4, horizontalPosition);

	if (horizontalPosition >= 96.6) {
		// Increment the level
		currentLevel = (currentLevel + 1) % blockLevels.length; // Loop back to the first level if needed
		loadLevel(currentLevel);
	
		// Reset player position
		horizontalPosition = 3.4; // Move player to the left edge
		verticalPosition = 75.9; // Move player to ground level
	}

	// Update the player's position on the screen
	player.style.left = `${horizontalPosition}%`;
	player.style.top = `${verticalPosition}%`;

	// Repeat the game loop
	requestAnimationFrame(gameLoop);
}