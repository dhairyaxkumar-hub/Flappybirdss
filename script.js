const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const gameUI = document.getElementById('gameUI');
const scoreDisplay = document.getElementById('score');
const finalScoreDisplay = document.getElementById('finalScore');
const bestScoreDisplay = document.getElementById('bestScore');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

// Game variables
let gameRunning = false;
let score = 0;
let bestScore = localStorage.getItem('flappyBestScore') || 0;
bestScoreDisplay.textContent = bestScore;

// Bird properties
const bird = {
    x: 50,
    y: canvas.height / 2,
    radius: 20,
    velocity: 0,
    gravity: 0.5,
    jump: -10,
    color: '#FFD700',
    
    draw: function() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw eye
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.x + 8, this.y - 5, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw beak
        ctx.fillStyle = '#FF8C00';
        ctx.beginPath();
        ctx.moveTo(this.x + 15, this.y);
        ctx.lineTo(this.x + 30, this.y);
        ctx.lineTo(this.x + 15, this.y + 8);
        ctx.fill();
    },
    
    update: function() {
        this.velocity += this.gravity;
        this.y += this.velocity;
        
        // Floor collision
        if (this.y + this.radius > canvas.height) {
            this.y = canvas.height - this.radius;
            gameOver();
        }
        
        // Ceiling collision
        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.velocity = 0;
        }
    },
    
    flap: function() {
        this.velocity = this.jump;
    }
};

// Pipes properties
const pipes = {
    position: [],
    gap: 180,
    maxYPos: -150,
    dx: 3,
    
    draw: function() {
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];
            
            // Top pipe
            ctx.fillStyle = '#2E8B57';
            ctx.fillRect(p.x, p.y, p.width, p.height);
            
            // Pipe cap
            ctx.fillStyle = '#228B22';
            ctx.fillRect(p.x - 5, p.y + p.height - 20, p.width + 10, 20);
            
            // Bottom pipe
            ctx.fillStyle = '#2E8B57';
            ctx.fillRect(p.x, p.y + p.height + this.gap, p.width, canvas.height);
            
            // Pipe cap
            ctx.fillStyle = '#228B22';
            ctx.fillRect(p.x - 5, p.y + p.height + this.gap, p.width + 10, 20);
        }
    },
    
    update: function() {
        if (gameRunning) {
            if (frames % 100 === 0) {
                this.position.push({
                    x: canvas.width,
                    y: this.maxYPos * (Math.random() + 1),
                    width: 60,
                    height: 300
                });
            }
            
            for (let i = 0; i < this.position.length; i++) {
                let p = this.position[i];
                
                // Move pipe to the left
                p.x -= this.dx;
                
                // If pipe moves off screen, remove it
                if (p.x + p.width <= 0) {
                    this.position.shift();
                }
                
                // Collision detection
                // Top pipe
                if (
                    bird.x + bird.radius > p.x && 
                    bird.x - bird.radius < p.x + p.width && 
                    bird.y - bird.radius < p.y + p.height
                ) {
                    gameOver();
                }
                
                // Bottom pipe
                if (
                    bird.x + bird.radius > p.x && 
                    bird.x - bird.radius < p.x + p.width && 
                    bird.y + bird.radius > p.y + p.height + this.gap
                ) {
                    gameOver();
                }
                
                // Score point when pipe passes bird
                if (p.x + p.width < bird.x && !p.passed) {
                    score++;
                    scoreDisplay.textContent = score;
                    p.passed = true;
                }
            }
        }
    }
};

// Background elements
const background = {
    draw: function() {
        // Sky
        ctx.fillStyle = '#70C5CE';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Clouds
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(100, 80, 30, 0, Math.PI * 2);
        ctx.arc(130, 70, 35, 0, Math.PI * 2);
        ctx.arc(160, 80, 30, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(300, 120, 30, 0, Math.PI * 2);
        ctx.arc(330, 110, 35, 0, Math.PI * 2);
        ctx.arc(360, 120, 30, 0, Math.PI * 2);
        ctx.fill();
        
        // Ground
        ctx.fillStyle = '#DEB887';
        ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
        
        // Grass
        ctx.fillStyle = '#7CFC00';
        ctx.fillRect(0, canvas.height - 20, canvas.width, 5);
    }
};

// Game functions
let frames = 0;

function gameOver() {
    gameRunning = false;
    gameOverScreen.classList.remove('hidden');
    finalScoreDisplay.textContent = score;
    
    if (score > bestScore) {
        bestScore = score;
        bestScoreDisplay.textContent = bestScore;
        localStorage.setItem('flappyBestScore', bestScore);
    }
}

function resetGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes.position = [];
    score = 0;
    scoreDisplay.textContent = score;
    frames = 0;
}

function draw() {
    background.draw();
    pipes.draw();
    bird.draw();
}

function update() {
    bird.update();
    pipes.update();
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    draw();
    if (gameRunning) {
        update();
    }
    
    frames++;
    requestAnimationFrame(gameLoop);
}

// Event listeners
startBtn.addEventListener('click', function() {
    startScreen.classList.add('hidden');
    gameUI.classList.remove('hidden');
    gameRunning = true;
    resetGame();
});

restartBtn.addEventListener('click', function() {
    gameOverScreen.classList.add('hidden');
    gameUI.classList.remove('hidden');
    gameRunning = true;
    resetGame();
});

document.addEventListener('keydown', function(e) {
    if (e.code === 'Space') {
        if (gameRunning) {
            bird.flap();
        }
    }
});

canvas.addEventListener('click', function() {
    if (gameRunning) {
        bird.flap();
    }
});

// Start the game loop
gameLoop();