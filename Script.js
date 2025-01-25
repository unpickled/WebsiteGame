// Get the elements
const playButton = document.getElementById('play-btn');
const homeScreen = document.getElementById('home-screen');
const gameArea = document.getElementById('game-area');
const player = document.getElementById('player');
const boxes = document.querySelectorAll('.brick');

// Define constants and variables
const GRAVITY = 0.25; // Gravity force
const JUMP_STRENGTH = 4.5; // How high the player can jump
const FRICTION = 0.7; // Deceleration for horizontal movement
const STEP = 0.275; // How much the player moves horizontally with each key press
const AIRACCELERATION = 0.15; // How much the player accelerates while in the air
const AIRRESISTANCE = 0.95; // Horizontal deceleration in air
let horizontalPosition = 50; // Horizontal position as a percentage
let verticalPosition = 100; // Vertical position as a percentage
let velocityX = 0; // Horizontal velocity
let velocityY = 0; // Vertical velocity (gravity / jumping)

// Flags for key states
let isJumping = false;
let canJump = true;
let isMovingLeft = false;
let isMovingRight = false;
let onBox = false;

// Check for collisions with boxes
function checkCollision(playerRect, boxRect) {
	return (
		playerRect.left < boxRect.right &&
		playerRect.right > boxRect.left &&
		playerRect.top < boxRect.bottom &&
		playerRect.bottom > boxRect.top
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
	requestAnimationFrame(gameLoop); // Start the game loop
});

// Game loop (updates position every frame)
function gameLoop() {
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

	// Predict next position
	const nextHorizontalPosition = horizontalPosition + velocityX;
	const nextVerticalPosition = verticalPosition + velocityY;

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
	if (verticalPosition >= 75.9) {
		verticalPosition = 75.9; // Set to the ground level
		velocityY = 0; // Stop downward velocity
        if (isJumping) {
            velocityY = -JUMP_STRENGTH; // Apply jump force
        } else {
            canJump = true;
			velocityY = 0;
        }
	}

	// Restrict horizontal movement (ensure player stays within the game area)
	horizontalPosition = Math.max(3.4, Math.min(96.6, horizontalPosition));

	// Update the player's position on the screen
	player.style.left = `${horizontalPosition}%`;
	player.style.top = `${verticalPosition}%`;

	// Repeat the game loop
	requestAnimationFrame(gameLoop);
}