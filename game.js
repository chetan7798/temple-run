// Temple Run: Python Pixel Escape - Enhanced Version
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;
const GROUND_Y = GAME_HEIGHT - 120;
const GRAVITY = 0.8;
const JUMP_STRENGTH = -15;
const PLAYER_SPEED = 6;

// Game state
let gameState = 'menu'; // 'menu', 'playing', 'gameOver'
let score = 0;
let gameSpeed = 4;
let speedIncreaseTimer = 0;
let difficultyLevel = 1;

// Input handling
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    
    if (gameState === 'menu' && (e.key === ' ' || e.key === 'Enter')) {
        startGame();
    } else if (gameState === 'playing' && e.key === ' ') {
        player.jump();
    } else if (gameState === 'gameOver' && (e.key === ' ' || e.key === 'Enter')) {
        gameState = 'menu';
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Player class
class Player {
    constructor() {
        this.width = 40;
        this.height = 60;
        this.x = 100;
        this.y = GROUND_Y - this.height;
        this.velX = 0;
        this.velY = 0;
        this.onGround = true;
        this.jumpCount = 0;
        this.maxJumps = 2;
        this.health = 5;
        this.maxHealth = 5;
        this.invulnerable = false;
        this.invulnerableTimer = 0;
    }
    
    update() {
        // Handle horizontal movement
        if (keys['arrowleft'] || keys['a']) {
            this.velX = -PLAYER_SPEED;
        } else if (keys['arrowright'] || keys['d']) {
            this.velX = PLAYER_SPEED;
        } else {
            this.velX = 0;
        }
        
        // Apply gravity
        this.velY += GRAVITY;
        
        // Update position
        this.x += this.velX;
        this.y += this.velY;
        
        // Keep player on screen horizontally
        if (this.x < 0) this.x = 0;
        if (this.x > GAME_WIDTH - this.width) this.x = GAME_WIDTH - this.width;
        
        // Ground collision
        if (this.y >= GROUND_Y - this.height) {
            this.y = GROUND_Y - this.height;
            this.velY = 0;
            this.onGround = true;
            this.jumpCount = 0;
        } else {
            this.onGround = false;
        }
        
        // Platform collision
        platforms.forEach(platform => {
            if (this.collidesWith(platform) && this.velY > 0) {
                this.y = platform.y - this.height;
                this.velY = 0;
                this.onGround = true;
                this.jumpCount = 0;
            }
        });
        
        // Update invulnerability
        if (this.invulnerable) {
            this.invulnerableTimer--;
            if (this.invulnerableTimer <= 0) {
                this.invulnerable = false;
            }
        }
    }
    
    jump() {
        if (this.jumpCount < this.maxJumps) {
            this.velY = JUMP_STRENGTH;
            this.jumpCount++;
            this.onGround = false;
        }
    }
    
    takeDamage() {
        if (!this.invulnerable) {
            this.health--;
            this.invulnerable = true;
            this.invulnerableTimer = 120; // 2 seconds at 60 FPS
            return true;
        }
        return false;
    }
    
    collidesWith(obj) {
        return this.x < obj.x + obj.width &&
               this.x + this.width > obj.x &&
               this.y < obj.y + obj.height &&
               this.y + this.height > obj.y;
    }
    
    draw() {
        ctx.save();
        
        // Flash effect when invulnerable
        if (this.invulnerable && Math.floor(this.invulnerableTimer / 5) % 2) {
            ctx.globalAlpha = 0.6;
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 10;
        }
        
        // Enhanced monkey character with Hollow Knight style
        const centerX = this.x + this.width/2;
        const centerY = this.y + this.height/2;
        
        // Body shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(centerX + 2, centerY + 2, this.width/2, this.height/2, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Main body
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, this.width/2);
        gradient.addColorStop(0, '#d2691e');
        gradient.addColorStop(0.7, '#8b4513');
        gradient.addColorStop(1, '#5d2f0a');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, this.width/2 - 2, this.height/2 - 2, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Body outline
        ctx.strokeStyle = '#3d1f05';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Head
        const headGradient = ctx.createRadialGradient(centerX, this.y - 5, 0, centerX, this.y - 5, 20);
        headGradient.addColorStop(0, '#daa520');
        headGradient.addColorStop(0.7, '#b8860b');
        headGradient.addColorStop(1, '#8b6914');
        ctx.fillStyle = headGradient;
        ctx.beginPath();
        ctx.ellipse(centerX, this.y - 5, 18, 13, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#3d1f05';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // Eyes with glow effect
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 3;
        ctx.fillStyle = '#ecf0f1';
        ctx.beginPath();
        ctx.arc(this.x + 13, this.y - 8, 4, 0, 2 * Math.PI);
        ctx.arc(this.x + 27, this.y - 8, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#2c3e50';
        ctx.beginPath();
        ctx.arc(this.x + 13, this.y - 8, 2, 0, 2 * Math.PI);
        ctx.arc(this.x + 27, this.y - 8, 2, 0, 2 * Math.PI);
        ctx.fill();
        
        // Eye highlight
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x + 14, this.y - 9, 1, 0, 2 * Math.PI);
        ctx.arc(this.x + 28, this.y - 9, 1, 0, 2 * Math.PI);
        ctx.fill();
        
        // Enhanced tail with curve
        ctx.fillStyle = '#8b4513';
        ctx.beginPath();
        ctx.moveTo(this.x - 3, this.y + 15);
        ctx.bezierCurveTo(this.x - 15, this.y + 5, this.x - 20, this.y - 5, this.x - 12, this.y - 8);
        ctx.bezierCurveTo(this.x - 8, this.y - 5, this.x - 5, this.y + 8, this.x - 3, this.y + 15);
        ctx.fill();
        ctx.strokeStyle = '#3d1f05';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore();
    }
}

// Platform class
class Platform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    
    update() {
        this.x -= gameSpeed * 0.4;
        if (this.x < -this.width) {
            this.x = GAME_WIDTH + Math.random() * 300 + 100;
            this.y = Math.random() * (GROUND_Y - 250) + (GROUND_Y - 250);
        }
    }
    
    draw() {
        ctx.save();
        
        // Platform shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(this.x + 3, this.y + 3, this.width, this.height);
        
        // Main platform with gradient
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, '#7f8c8d');
        gradient.addColorStop(0.5, '#95a5a6');
        gradient.addColorStop(1, '#34495e');
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Platform details
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Ancient runes/patterns
        ctx.strokeStyle = '#566573';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            const runeX = this.x + (this.width / 4) * (i + 0.5);
            ctx.beginPath();
            ctx.moveTo(runeX - 5, this.y + 5);
            ctx.lineTo(runeX + 5, this.y + 5);
            ctx.moveTo(runeX, this.y + 3);
            ctx.lineTo(runeX, this.y + 7);
            ctx.stroke();
        }
        
        ctx.restore();
    }
}

// Obstacle class
class Obstacle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 30;
        this.height = 30;
    }
    
    update() {
        this.x -= gameSpeed;
        return this.x > -this.width;
    }
    
    draw() {
        if (this.type === 'spike') {
            ctx.fillStyle = '#808080';
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + this.height);
            ctx.lineTo(this.x + this.width/2, this.y);
            ctx.lineTo(this.x + this.width, this.y + this.height);
            ctx.closePath();
            ctx.fill();
        } else if (this.type === 'fire') {
            // Fire animation
            const time = Date.now() * 0.01;
            ctx.fillStyle = '#FF4500';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = '#FF6347';
            ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, this.height - 10);
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(this.x + 10, this.y + 10, this.width - 20, this.height - 20);
        }
    }
}

// Fruit class
class Fruit {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.bobOffset = 0;
        this.collected = false;
    }
    
    update() {
        this.x -= gameSpeed;
        this.bobOffset += 0.1;
        return this.x > -this.width && !this.collected;
    }
    
    draw() {
        if (!this.collected) {
            const bobY = this.y + Math.sin(this.bobOffset) * 5;
            // Draw apple
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.ellipse(this.x + this.width/2, bobY + this.height/2, this.width/2, this.height/2, 0, 0, 2 * Math.PI);
            ctx.fill();
            
            // Draw stem
            ctx.fillStyle = '#00FF00';
            ctx.fillRect(this.x + this.width/2 - 2, bobY - 5, 4, 8);
        }
    }
}

// Enemy class
class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 35;
        this.height = 35;
        this.speed = 2;
    }
    
    update() {
        this.x -= gameSpeed + this.speed;
        return this.x > -this.width;
    }
    
    draw() {
        // Draw bat-like enemy
        ctx.fillStyle = '#800080'; // Purple
        ctx.beginPath();
        ctx.ellipse(this.x + this.width/2, this.y + this.height/2, this.width/2, this.height/2, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Wings
        ctx.fillStyle = '#404040';
        ctx.beginPath();
        ctx.ellipse(this.x - 5, this.y + 10, 8, 4, 0, 0, 2 * Math.PI);
        ctx.ellipse(this.x + this.width + 5, this.y + 10, 8, 4, 0, 0, 2 * Math.PI);
        ctx.fill();
    }
}

// Game objects
let player;
let platforms = [];
let obstacles = [];
let fruits = [];
let enemies = [];

// Timers
let obstacleTimer = 0;
let fruitTimer = 0;
let enemyTimer = 0;
let backgroundOffset = 0;

function initGame() {
    player = new Player();
    platforms = [
        new Platform(300, GROUND_Y - 150, 200, 20),
        new Platform(600, GROUND_Y - 200, 150, 20),
        new Platform(900, GROUND_Y - 100, 180, 20)
    ];
    obstacles = [];
    fruits = [];
    enemies = [];
}

function startGame() {
    gameState = 'playing';
    score = 0;
    gameSpeed = 5;
    initGame();
    obstacleTimer = 0;
    fruitTimer = 0;
    enemyTimer = 0;
}

function spawnObstacle() {
    const type = Math.random() < 0.5 ? 'spike' : 'fire';
    const y = type === 'spike' ? GROUND_Y - 40 : GROUND_Y - 30;
    obstacles.push(new Obstacle(GAME_WIDTH, y, type));
}

function spawnFruit() {
    const y = Math.random() * (GROUND_Y - 200) + (GROUND_Y - 200);
    fruits.push(new Fruit(GAME_WIDTH, y));
}

function spawnEnemy() {
    const y = Math.random() * (GROUND_Y - 100) + 100;
    enemies.push(new Enemy(GAME_WIDTH, y));
}

function drawBackground() {
    // Enhanced atmospheric background
    const skyGradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    skyGradient.addColorStop(0, '#0f0f23');
    skyGradient.addColorStop(0.3, '#1a1a2e');
    skyGradient.addColorStop(0.7, '#16213e');
    skyGradient.addColorStop(1, '#0f3460');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Atmospheric particles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 20; i++) {
        const x = (i * 60 + backgroundOffset * 0.2) % GAME_WIDTH;
        const y = (i * 37) % (GAME_HEIGHT - 200);
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    // Parallax background layers
    backgroundOffset += gameSpeed * 0.3;
    if (backgroundOffset > 600) backgroundOffset = 0;
    
    // Enhanced temple structures with Hollow Knight atmosphere
    for (let layer = 0; layer < 4; layer++) {
        const speed = (layer + 1) * 0.3;
        const alpha = 0.3 - layer * 0.05;
        const scale = 1 - layer * 0.1;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        
        for (let i = 0; i < 6; i++) {
            const x = (i * 400 - backgroundOffset * speed) % (GAME_WIDTH + 400) - 200;
            const y = 100 + layer * 80;
            const width = 180 * scale;
            const height = 120 * scale;
            
            // Temple structure gradient
            const templeGradient = ctx.createLinearGradient(x, y, x, y + height);
            templeGradient.addColorStop(0, '#2c3e50');
            templeGradient.addColorStop(0.5, '#34495e');
            templeGradient.addColorStop(1, '#1a252f');
            ctx.fillStyle = templeGradient;
            ctx.fillRect(x, y, width, height);
            
            // Temple details
            ctx.strokeStyle = '#1a252f';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, width, height);
            
            // Temple pillars
            for (let p = 0; p < 3; p++) {
                const pillarX = x + (width / 4) * (p + 0.5);
                ctx.fillStyle = '#566573';
                ctx.fillRect(pillarX - 3, y, 6, height);
            }
        }
        
        ctx.restore();
    }
    
    // Enhanced ground with texture
    const groundGradient = ctx.createLinearGradient(0, GROUND_Y, 0, GAME_HEIGHT);
    groundGradient.addColorStop(0, '#2c3e50');
    groundGradient.addColorStop(0.3, '#34495e');
    groundGradient.addColorStop(1, '#1a252f');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, GROUND_Y, GAME_WIDTH, GAME_HEIGHT - GROUND_Y);
    
    // Ground texture lines
    ctx.strokeStyle = '#566573';
    ctx.lineWidth = 1;
    for (let i = 0; i < GAME_WIDTH / 50; i++) {
        const x = (i * 50 - backgroundOffset * 2) % GAME_WIDTH;
        ctx.beginPath();
        ctx.moveTo(x, GROUND_Y);
        ctx.lineTo(x, GAME_HEIGHT);
        ctx.stroke();
    }
}

function drawUI() {
    ctx.save();
    
    // UI Background panel
    const panelGradient = ctx.createLinearGradient(0, 0, 0, 80);
    panelGradient.addColorStop(0, 'rgba(44, 62, 80, 0.9)');
    panelGradient.addColorStop(1, 'rgba(44, 62, 80, 0.6)');
    ctx.fillStyle = panelGradient;
    ctx.fillRect(0, 0, GAME_WIDTH, 80);
    
    // UI border
    ctx.strokeStyle = '#34495e';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, GAME_WIDTH, 80);
    
    // Enhanced health hearts with glow
    for (let i = 0; i < player.maxHealth; i++) {
        const x = 60 + i * 50;
        const y = 40;
        const isActive = i < player.health;
        
        ctx.save();
        
        if (isActive) {
            // Glow effect for active hearts
            ctx.shadowColor = '#e74c3c';
            ctx.shadowBlur = 8;
            ctx.fillStyle = '#e74c3c';
        } else {
            ctx.fillStyle = '#566573';
        }
        
        // Heart shape with better proportions
        ctx.beginPath();
        ctx.arc(x - 10, y - 5, 9, 0, 2 * Math.PI);
        ctx.arc(x + 10, y - 5, 9, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.moveTo(x - 18, y + 2);
        ctx.lineTo(x + 18, y + 2);
        ctx.lineTo(x, y + 20);
        ctx.closePath();
        ctx.fill();
        
        // Heart outline
        ctx.strokeStyle = isActive ? '#c0392b' : '#34495e';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Heart highlight
        if (isActive) {
            ctx.fillStyle = '#ff6b6b';
            ctx.beginPath();
            ctx.arc(x - 6, y - 8, 3, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    // Enhanced score display
    ctx.save();
    ctx.font = 'bold 28px Cinzel, serif';
    ctx.fillStyle = '#ecf0f1';
    ctx.shadowColor = '#2c3e50';
    ctx.shadowBlur = 4;
    ctx.textAlign = 'right';
    ctx.fillText(`Score: ${score}`, GAME_WIDTH - 60, 45);
    
    // Speed indicator
    ctx.font = 'bold 18px Cinzel, serif';
    ctx.fillText(`Speed: ${difficultyLevel}`, GAME_WIDTH - 60, 70);
    ctx.textAlign = 'left';
    
    ctx.restore();
}

function drawMenu() {
    // Draw atmospheric background
    drawBackground();
    
    // Dark overlay with gradient
    const overlayGradient = ctx.createRadialGradient(GAME_WIDTH/2, GAME_HEIGHT/2, 0, GAME_WIDTH/2, GAME_HEIGHT/2, GAME_WIDTH/2);
    overlayGradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
    overlayGradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
    ctx.fillStyle = overlayGradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    ctx.save();
    ctx.textAlign = 'center';
    
    // Main title with glow effect
    ctx.font = 'bold 56px Cinzel, serif';
    ctx.fillStyle = '#ecf0f1';
    ctx.shadowColor = '#3498db';
    ctx.shadowBlur = 15;
    ctx.fillText('Temple Run', GAME_WIDTH/2, GAME_HEIGHT/2 - 120);
    
    ctx.font = 'bold 32px Cinzel, serif';
    ctx.fillStyle = '#95a5a6';
    ctx.shadowColor = '#2980b9';
    ctx.shadowBlur = 10;
    ctx.fillText('Python Pixel Escape', GAME_WIDTH/2, GAME_HEIGHT/2 - 80);
    
    // Subtitle with mystical feel
    ctx.font = 'italic 18px Cinzel, serif';
    ctx.fillStyle = '#bdc3c7';
    ctx.shadowBlur = 5;
    ctx.fillText('Ancient Temple • Endless Journey • Cursed Escape', GAME_WIDTH/2, GAME_HEIGHT/2 - 40);
    
    // Instructions panel
    ctx.shadowBlur = 0;
    ctx.font = 'bold 20px Cinzel, serif';
    ctx.fillStyle = '#ecf0f1';
    
    const instructions = [
        '↑↓←→ or WASD - Move the Warrior',
        'SPACEBAR - Jump & Double Jump',
        'Collect Sacred Fruits • Avoid Dark Obstacles',
        'Survive the Endless Temple Run',
        '',
        '✦ Press SPACE or ENTER to Begin ✦',
        'ESC to Abandon the Quest'
    ];
    
    instructions.forEach((instruction, i) => {
        const y = GAME_HEIGHT/2 + 20 + i * 35;
        if (i === 5) {
            // Highlight start instruction
            ctx.fillStyle = '#f39c12';
            ctx.shadowColor = '#e67e22';
            ctx.shadowBlur = 8;
        } else if (i === 6) {
            ctx.fillStyle = '#95a5a6';
            ctx.shadowBlur = 0;
        } else {
            ctx.fillStyle = '#ecf0f1';
            ctx.shadowBlur = 0;
        }
        ctx.fillText(instruction, GAME_WIDTH/2, y);
    });
    
    ctx.restore();
}

function drawGameOver() {
    // Draw background with darker overlay
    drawBackground();
    
    const overlayGradient = ctx.createRadialGradient(GAME_WIDTH/2, GAME_HEIGHT/2, 0, GAME_WIDTH/2, GAME_HEIGHT/2, GAME_WIDTH/2);
    overlayGradient.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
    overlayGradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
    ctx.fillStyle = overlayGradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    ctx.save();
    ctx.textAlign = 'center';
    
    // Death message with dramatic effect
    ctx.font = 'bold 64px Cinzel, serif';
    ctx.fillStyle = '#e74c3c';
    ctx.shadowColor = '#c0392b';
    ctx.shadowBlur = 20;
    ctx.fillText('THE CURSE CLAIMS YOU', GAME_WIDTH/2, GAME_HEIGHT/2 - 80);
    
    ctx.font = 'italic 24px Cinzel, serif';
    ctx.fillStyle = '#95a5a6';
    ctx.shadowBlur = 5;
    ctx.fillText('Your journey through the temple ends...', GAME_WIDTH/2, GAME_HEIGHT/2 - 30);
    
    // Score display with golden accent
    ctx.font = 'bold 36px Cinzel, serif';
    ctx.fillStyle = '#f39c12';
    ctx.shadowColor = '#e67e22';
    ctx.shadowBlur = 10;
    ctx.fillText(`Final Score: ${score}`, GAME_WIDTH/2, GAME_HEIGHT/2 + 20);
    
    ctx.font = 'bold 18px Cinzel, serif';
    ctx.fillStyle = '#3498db';
    ctx.shadowColor = '#2980b9';
    ctx.shadowBlur = 8;
    ctx.fillText(`Maximum Speed Reached: Level ${difficultyLevel}`, GAME_WIDTH/2, GAME_HEIGHT/2 + 60);
    
    // Continue instruction
    ctx.font = 'bold 24px Cinzel, serif';
    ctx.fillStyle = '#ecf0f1';
    ctx.shadowBlur = 5;
    ctx.fillText('✦ Press SPACE or ENTER to Return ✦', GAME_WIDTH/2, GAME_HEIGHT/2 + 120);
    
    ctx.restore();
}

function updateGame() {
    if (gameState !== 'playing') return;
    
    // Progressive speed increase system
    speedIncreaseTimer++;
    if (speedIncreaseTimer >= 600) { // Every 10 seconds at 60 FPS
        gameSpeed += 0.5;
        difficultyLevel = Math.floor(gameSpeed / 2);
        speedIncreaseTimer = 0;
        
        // Cap maximum speed to keep game playable
        if (gameSpeed > 12) {
            gameSpeed = 12;
            difficultyLevel = 6;
        }
    }
    
    // Update player
    player.update();
    
    // Update platforms
    platforms.forEach(platform => platform.update());
    
    // Dynamic spawn rates based on difficulty
    const baseObstacleRate = Math.max(60, 120 - difficultyLevel * 10);
    const baseFruitRate = Math.max(90, 150 - difficultyLevel * 8);
    const baseEnemyRate = Math.max(120, 200 - difficultyLevel * 15);
    
    // Spawn objects with increasing frequency
    obstacleTimer++;
    if (obstacleTimer > baseObstacleRate + Math.random() * 60) {
        spawnObstacle();
        obstacleTimer = 0;
    }
    
    fruitTimer++;
    if (fruitTimer > baseFruitRate + Math.random() * 90) {
        spawnFruit();
        fruitTimer = 0;
    }
    
    enemyTimer++;
    if (enemyTimer > baseEnemyRate + Math.random() * 120) {
        spawnEnemy();
        enemyTimer = 0;
    }
    
    // Update and check obstacles
    obstacles = obstacles.filter(obstacle => {
        const alive = obstacle.update();
        if (player.collidesWith(obstacle)) {
            if (player.takeDamage()) {
                if (player.health <= 0) {
                    gameState = 'gameOver';
                }
            }
        }
        return alive;
    });
    
    // Update and check fruits
    fruits = fruits.filter(fruit => {
        const alive = fruit.update();
        if (!fruit.collected && player.collidesWith(fruit)) {
            fruit.collected = true;
            score += 10;
        }
        return alive && !fruit.collected;
    });
    
    // Update and check enemies
    enemies = enemies.filter(enemy => {
        const alive = enemy.update();
        if (player.collidesWith(enemy)) {
            if (player.takeDamage()) {
                if (player.health <= 0) {
                    gameState = 'gameOver';
                }
            }
        }
        return alive;
    });
    
    // Increase game speed gradually
    gameSpeed += 0.001;
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Draw background
    drawBackground();
    
    if (gameState === 'playing') {
        // Draw platforms
        platforms.forEach(platform => platform.draw());
        
        // Draw game objects
        obstacles.forEach(obstacle => obstacle.draw());
        fruits.forEach(fruit => fruit.draw());
        enemies.forEach(enemy => enemy.draw());
        
        // Draw player
        player.draw();
        
        // Draw UI
        drawUI();
    } else if (gameState === 'menu') {
        drawMenu();
    } else if (gameState === 'gameOver') {
        drawGameOver();
    }
}

function gameLoop() {
    updateGame();
    draw();
    requestAnimationFrame(gameLoop);
}

// Initialize and start the game
initGame();
gameLoop();