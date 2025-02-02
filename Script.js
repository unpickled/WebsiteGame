// Get the elements
const playButton = document.querySelectorAll('.play-btn');
const gameArea = document.getElementById('game-area');
const player = document.getElementById('player');
const heartContainer = document.getElementById('heart-container');
let boxes;
let zombies = [];

// Define constants and variables
const GRAVITY = 0.25; // Gravity force
const JUMP_STRENGTH = 4.5; // How high the player can jump
const ZOMBIE_JUMP_STRENGTH = 3.5; // How high zombies can jump
const FRICTION = 0.7; // Deceleration for horizontal movement
const STEP = 0.275; // How much the player moves horizontally with each key press
const ZOMBIESTEP = 0.1; // How much zombies move horizontallly every frame
const AIRACCELERATION = 0.15; // How much the player accelerates while in the air
const AIRRESISTANCE = 0.95; // Horizontal deceleration in air
const I_FRAMES = 20; // Invicibility length between hits
const ATTACK_COOLDOWN = 50; // Cooldown between attacks
let horizontalPosition = 3.4; // Horizontal position as a percentage
let verticalPosition = 75.9; // Vertical position as a percentage
let velocityX = 0; // Horizontal velocity
let velocityY = 0; // Vertical velocity (gravity / jumping)
let maxHealth = 10; // Player's max health
let health = 9; // Player's current health
let iframes = 0; // Invincibility length between hits
let attackCooldown = 50; // Cooldown between attacks
let attackRange = 25; // How far player can attack
let attackDamage = 5; // Damage on attack

// Flags for key states
let isJumping = false;
let canJump = true;
let isMovingLeft = false;
let isMovingRight = false;
let onBox = false;
let isFacingLeft = false;

// Reload cursors
const reloadCursors = [
	"url('Cursors/Reload1.png'), auto",
	"url('Cursors/Reload2.png'), auto",
	"url('Cursors/Reload3.png'), auto",
	"url('Cursors/Reload4.png'), auto",
	"url('Cursors/Reload5.png'), auto",
	"url('Cursors/Reload6.png'), auto",
	"url('Cursors/Reload7.png'), auto"
];

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
		{ left: "48%", top: "66%" },
		{ left: "66%", top: "66%" },
	],
	[
		{ left: "50%", top: "66%" },
	],
];
let currentLevel = 0;

// Functions
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
	zombies = [];
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

	// Add new zombies
	const zombieLevel = zombieLevels[levelIndex];
	zombieLevel.forEach((zombie) => {
		const newZombie = document.createElement('div');
		newZombie.className = 'zombie';
		newZombie.style.left = zombie.left;
		newZombie.style.top = zombie.top;
		gameArea.appendChild(newZombie);
		zombies.push({
			element: newZombie,
			vx: 0,
			vy: 0,
			canJump: false,
			iframes: 0,
			health: 8
		});

	boxes = document.querySelectorAll('.brick')
	});
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

function attack() {
	let closestEnemy = null;
	let closestDistance = Infinity;

	zombies.forEach(zombie => {
		let dx = parseFloat(zombie.element.style.left) - parseFloat(player.style.left);
		let dy = parseFloat(zombie.element.style.top) - parseFloat(player.style.top);
		let distance = Math.sqrt(dx * dx + dy * dy);
		if ((!isFacingLeft &&  dx > 0) || (isFacingLeft &&  dx < 0)) {
			if (distance <= attackRange && distance < closestDistance && zombie.iframes === 0) {
				closestDistance = distance;
				closestEnemy = zombie;
			}
		}
	})
	
	if (closestEnemy) {
		closestEnemy.health -= attackDamage;
		closestEnemy.iframes = I_FRAMES;
		if (isFacingLeft) {
			closestEnemy.vx -= 3;
		} else {
			closestEnemy.vx += 3;
		}
		if (closestEnemy.health <= 0) {
			closestEnemy.element.remove();
		}
	}
}

// Inputs
// Listen for keydown events to move the player
document.addEventListener('keydown', (event) => {
	switch (event.key.toLowerCase()) {
		case 'a': // Move left
			isMovingLeft = true;
			isFacingLeft = true;
            player.style.backgroundImage = "url('PlayerSkin2.png')";
			break;
		case 'd': // Move right
			isMovingRight = true;
			isFacingLeft = false;
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
				isFacingLeft = false;
            }
			break;
		case 'd': // Stop moving right
			isMovingRight = false;
            if (isMovingLeft) {
                player.style.backgroundImage = "url('PlayerSkin2.png')";
				isFacingLeft = true;
            }
			break;
        case 'w':
            isJumping = false;
            break;
	}
});

// Prevent the default right-click menu from appearing
document.addEventListener('contextmenu', (event) => {
	event.preventDefault();
});

// Listen for clicks for player to attack
document.addEventListener('mousedown', (event) => {
	switch (event.button) {
		case 0:
			if (attackCooldown === ATTACK_COOLDOWN) {
				attack();
				attackCooldown = 0;
			}
			break;
	}
})

// When the play button is clicked, hide the home screen and show the game
playButton.forEach(button => {
	button.addEventListener('click', () => {
	document.getElementById('game-area').style.display = "block";
	document.getElementById('death-screen').style.display = "none";
	document.getElementById('home-screen').style.display = "none";
	health = maxHealth;
	renderHearts();
	horizontalPosition = 3.4; // Move player to the left edge
	verticalPosition = 75.9; // Move player to ground level
	loadLevel(0); // Load the first level
	requestAnimationFrame(gameLoop); // Start the game loop
	});
});

// Game loop (updates position every frame)
function gameLoop() {

	if (iframes > 0) {
		iframes--;
	}

	if (attackCooldown < ATTACK_COOLDOWN) {
		document.body.style.cursor = reloadCursors[Math.floor(attackCooldown / (ATTACK_COOLDOWN / 7))];
		attackCooldown++;
	} else {
		document.body.style.cursor = "url('Cursors/FullyLoaded.png'), auto";
	}

	// Apply gravity
	velocityY += GRAVITY;

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
		zombie.vx *= FRICTION;
		zombie.vy += GRAVITY;
		const nextZombieX = parseFloat(zombie.element.style.left) + zombie.vx;
		const nextZombieY = parseFloat(zombie.element.style.top) + zombie.vy;
		const futureZombieRect = {
			left: (nextZombieX / 100) * gameArea.clientWidth,
			right: ((nextZombieX + 4.75) / 100) * gameArea.clientWidth,
			top: ((nextZombieY) / 100) * gameArea.clientHeight,
			bottom: ((nextZombieY + 20) / 100) * gameArea.clientHeight,	
		};
		for (const box of boxes) {
			const boxRect = box.getBoundingClientRect();
			if (checkCollision(futureZombieRect, boxRect)) {
				const overlapX = Math.min(futureZombieRect.right - boxRect.left, boxRect.right - futureZombieRect.left);
				const overlapY = Math.min(futureZombieRect.bottom - boxRect.top, boxRect.bottom - futureZombieRect.top);
				if (overlapX < overlapY) {
					if (futureZombieRect.right > boxRect.left && futureZombieRect.left < boxRect.left) {
						zombie.element.style.left = `${(boxRect.right / gameArea.clientWidth) * 100 - 11.2}%`;
						zombie.vx = 0; // Stop horizontal movement
						if (zombie.canJump) {
							zombie.vy = -ZOMBIE_JUMP_STRENGTH; // Apply jump force
							zombie.canJump = false;
						}
					} else if (futureZombieRect.left < boxRect.right && futureZombieRect.right > boxRect.right) {
						zombie.element.style.left = `${(boxRect.left / gameArea.clientWidth) * 100 + 6.5}%`
						zombie.vx = 0; // Stop horizontal movement
						if (zombie.canJump) {
							zombie.vy = -ZOMBIE_JUMP_STRENGTH; // Apply jump force
							zombie.canJump = false;
						}
					}
				} else {
					if (futureZombieRect.bottom > boxRect.top && zombie.vy > 0 && futureZombieRect.top < boxRect.bottom) {
						zombie.element.style.top = `${(boxRect.top / gameArea.clientWidth) * 100}%` + 1;
						zombie.canJump = true;
						zombie.vy = 0;
					} else if (futureZombieRect.top < boxRect.bottom && zombie.vy < 0 && futureZombieRect.bottom > boxRect.top) {
						zombie.vy = 0;
					}
				}
			}
		}
		zombie.element.style.left = `${parseFloat(zombie.element.style.left) + zombie.vx}%`;
		zombie.element.style.top = `${parseFloat(zombie.element.style.top) + zombie.vy}%`
		const zombieRect = zombie.element.getBoundingClientRect();
		if (currentPlayerRect.left < zombieRect.left) {
			if (zombie.iframes === 0) {
				zombie.element.style.backgroundImage = "url('ZombieSkin.png')";
			} else {
				zombie.element.style.backgroundImage = "url('HurtZombieSkin.png')";
				zombie.iframes--;
			}
			zombie.vx = Math.max(zombie.vx - ZOMBIESTEP, -0.4);
			if (checkCollision(currentPlayerRect, zombieRect) && iframes === 0) {
				health--;
				renderHearts();
				velocityX -= 1;
				velocityY -= 1;
				iframes = I_FRAMES;
				if (health <= 0) {
					document.getElementById('death-screen').style.display = "flex";
					document.getElementById('game-area').style.display = "none";
					return 0;
				}
			}
		} else {
			if (zombie.iframes === 0) {
				zombie.element.style.backgroundImage = "url('ZombieSkin2.png')";
			} else {
				zombie.element.style.backgroundImage = "url('HurtZombieSkin2.png')";
				zombie.iframes--;
			}
			zombie.vx = Math.min(zombie.vx + ZOMBIESTEP, 0.4);
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
				if (playerRect.right > boxRect.left && playerRect.left < boxRect.left) {
					horizontalPosition = (boxRect.right / gameArea.clientWidth) * 100 - 9.9;
					velocityX = 0; // Stop horizontal movement
				} else if (playerRect.left < boxRect.right && playerRect.right > boxRect.right) {
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
		if (document.querySelectorAll('.zombie').length === 0) {
			currentLevel = (currentLevel + 1) % blockLevels.length; // Loop back to the first level if needed
			loadLevel(currentLevel);
			horizontalPosition = 3.4; // Move player to the left edge
			verticalPosition = 75.9; // Move player to ground level
		} else {
			horizontalPosition = 96.6;
		}
	}

	// Update the player's position on the screen
	player.style.left = `${horizontalPosition}%`;
	player.style.top = `${verticalPosition}%`;

	// Repeat the game loop
	requestAnimationFrame(gameLoop);
}