// Get the elements
const playButton = document.getElementById('play-btn');
const homeScreen = document.getElementById('home-screen');
const gameArea = document.getElementById('game-area');
const player = document.getElementById('player');

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
let canJump = true
let isMovingLeft = false;
let isMovingRight = false;

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

	// Reduce horizontal acceleration and cap velocity if the player is jumping
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

	// Update horizontal and vertical position
	horizontalPosition += velocityX;
    verticalPosition += velocityY;

    // Restrict horizontal movement (ensure player stays within the game area)
	if (horizontalPosition < 3.4) {
		horizontalPosition = 3.4; // Left border
		velocityX = 0; // Stop horizontal velocity at the left border
	} else if (horizontalPosition > 96.6) {
		horizontalPosition = 96.6; // Right border
		velocityX = 0; // Stop horizontal velocity at the right border
	}

	// Collision with the ground (stop falling)
	if (verticalPosition >= 89.5) {
		verticalPosition = 89.5; // Set to the ground level
		velocityY = 0; // Stop downward velocity
        if (isJumping) {
            velocityY = -JUMP_STRENGTH; // Apply jump force
            canJump = false;
        } else {
            canJump = true;
        }
	}

	// Update the player's position on the screen
	player.style.left = `${horizontalPosition}%`;
	player.style.top = `${verticalPosition}%`;

	// Repeat the game loop
	requestAnimationFrame(gameLoop);
}