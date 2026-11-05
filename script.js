const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const hud = document.getElementById('hud');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const livesEl = document.getElementById('lives');
const finalScoreEl = document.getElementById('final-score');
const finalHighScoreEl = document.getElementById('final-high-score');

// Variáveis do Jogo
let gameState = 'START';
let score = 0;
let highScore = localStorage.getItem('rapunzel_highscore') || 0;
let lives = 3;
let animationFrameId;
let spawnTimer = 0;
let items = [];
let particles = [];

highScoreEl.textContent = highScore;

// Teclado
const keys = { left: false, right: false };

// Jogador (Rapunzel)
const player = {
    x: 180,
    y: 510,
    width: 40,
    height: 60,
    speed: 6,
    dx: 0
};

// Event Listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
});

canvas.addEventListener('mousemove', (e) => {
    if (gameState !== 'PLAYING') return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    player.x = mouseX - player.width / 2;
});

canvas.addEventListener('touchmove', (e) => {
    if (gameState !== 'PLAYING') return;
    const rect = canvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    player.x = touchX - player.width / 2;
}, { passive: true });

function startGame() {
    score = 0;
    lives = 3;
    items = [];
    particles = [];
    player.x = canvas.width / 2 - player.width / 2;
    
    scoreEl.textContent = score;
    updateLivesDisplay();
    
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    hud.classList.remove('hidden');
    
    gameState = 'PLAYING';
    cancelAnimationFrame(animationFrameId);
    gameLoop();
}

function updateLivesDisplay() {
    livesEl.textContent = '❤️'.repeat(lives);
}

function spawnItem() {
    spawnTimer++;
    if (spawnTimer % 45 === 0) {
        const rand = Math.random();
        let type = 'lantern';
        let speed = 2 + Math.random() * 2 + (score * 0.05);

        if (rand < 0.55) {
            type = 'lantern'; // 55% Lanterna
        } else if (rand < 0.85) {
            type = 'fryingPan'; // 30% Frigideira
        } else {
            type = 'box'; // 15% Caixa
        }

        items.push({
            x: Math.random() * (canvas.width - 30),
            y: -30,
            width: 30,
            height: 30,
            type: type,
            speed: speed,
            rotation: 0
        });
    }
}

function createParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            radius: Math.random() * 3 + 2,
            color: color,
            alpha: 1
        });
    }
}

function update() {
    // Movimento do Jogador
    if (keys.left) player.x -= player.speed;
    if (keys.right) player.x += player.speed;

    // Limites da tela
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // Gerar Itens
    spawnItem();

    // Atualizar Itens
    for (let i = items.length - 1; i >= 0; i--) {
        let item = items[i];
        item.y += item.speed;
        item.rotation += 0.02;

        // Colisão com o Jogador
        if (
            player.x < item.x + item.width &&
            player.x + player.width > item.x &&
            player.y < item.y + item.height &&
            player.y + player.height > item.y
        ) {
            if (item.type === 'lantern') {
                score += 10;
                scoreEl.textContent = score;
                createParticles(item.x + 15, item.y + 15, '#ffd700');
            } else {
                lives--;
                updateLivesDisplay();
                createParticles(item.x + 15, item.y + 15, '#ff4444');
                if (lives <= 0) {
                    gameOver();
                }
            }
            items.splice(i, 1);
            continue;
        }

        // Remover itens fora da tela
        if (item.y > canvas.height) {
            items.splice(i, 1);
        }
    }

    // Atualizar Partículas
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.03;
        if (p.alpha <= 0) particles.splice(i, 1);
    }
}

function drawBackground() {
    // Céu Noturno
    let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a0933');
    gradient.addColorStop(1, '#4a2574');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Lua
    ctx.fillStyle = '#fffde7';
    ctx.beginPath();
    ctx.arc(330, 70, 30, 0, Math.PI * 2);
    ctx.fill();
}

function drawPlayer() {
    // Cabelo Longo
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(player.x - 10, player.y + 10);
    ctx.quadraticCurveTo(player.x - 25, player.y + 30, player.x - 10, player.y + 60);
    ctx.lineTo(player.x + player.width + 10, player.y + 60);
    ctx.quadraticCurveTo(player.x + player.width + 25, player.y + 30, player.x + player.width + 10, player.y + 10);
    ctx.fill();

    // Vestido
    ctx.fillStyle = '#ba68c8';
    ctx.beginPath();
    ctx.moveTo(player.x + 10, player.y + 20);
    ctx.lineTo(player.x + player.width - 10, player.y + 20);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.closePath();
    ctx.fill();

    // Cabeça
    ctx.fillStyle = '#ffdbac';
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y + 15, 12, 0, Math.PI * 2);
    ctx.fill();
}

function drawItems() {
    items.forEach(item => {
        ctx.save();
        ctx.translate(item.x + item.width / 2, item.y + item.height / 2);

        if (item.type === 'lantern') {
            // Lanterna Flutuante
            ctx.fillStyle = '#ff9800';
            ctx.fillRect(-10, -12, 20, 24);
            ctx.fillStyle = '#ffeb3b';
            ctx.fillRect(-7, -9, 14, 18);
        } else if (item.type === 'fryingPan') {
            // Frigideira
            ctx.rotate(item.rotation);
            ctx.fillStyle = '#424242';
            ctx.beginPath();
            ctx.arc(0, -4, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(-2, 4, 4, 12);
        } else {
            // Caixa
            ctx.fillStyle = '#795548';
            ctx.fillRect(-12, -12, 24, 24);
        }

        ctx.restore();
    });
}

function drawParticles() {
    particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawPlayer();
    drawItems();
    drawParticles();
}

function gameOver() {
    gameState = 'GAMEOVER';
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('rapunzel_highscore', highScore);
        highScoreEl.textContent = highScore;
    }
    
    finalScoreEl.textContent = score;
    finalHighScoreEl.textContent = highScore;
    
    hud.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
}

function gameLoop() {
    if (gameState === 'PLAYING') {
        update();
        draw();
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}