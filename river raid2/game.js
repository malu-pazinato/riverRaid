const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Variáveis do jogo
let airplaneImage = new Image();
airplaneImage.src = 'images/nave-espacial.png';

let enemyImage = new Image();
enemyImage.src = 'images/bomba.png';

let tankImage = new Image();
tankImage.src = 'images/bomba-de-gasolina.png';

let airplane = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 100,
    width: 50,
    height: 50,
    speed: 5,
    moveLeft: false,
    moveRight: false,
    moveUp: false,
    moveDown: false
};

let bullets = [];
let enemies = [];
let tanks = [];
let fuel = 100;
let score = 0;
let lives = 3;
let gameOver = false;
let level = 1;
let enemiesDefeated = 0;
let showLevelText = false;
let levelDisplayTime = 0;

// Controle do avião
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') airplane.moveLeft = true;
    if (e.key === 'ArrowRight') airplane.moveRight = true;
    if (e.key === 'ArrowUp') airplane.moveUp = true;
    if (e.key === 'ArrowDown') airplane.moveDown = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') airplane.moveLeft = false;
    if (e.key === 'ArrowRight') airplane.moveRight = false;
    if (e.key === 'ArrowUp') airplane.moveUp = false;
    if (e.key === 'ArrowDown') airplane.moveDown = false;
});

// Função para mover o avião
function moveAirplane() {
    if (airplane.moveLeft && airplane.x > 0) airplane.x -= airplane.speed;
    if (airplane.moveRight && airplane.x + airplane.width < canvas.width) airplane.x += airplane.speed;
    if (airplane.moveUp && airplane.y > 0) airplane.y -= airplane.speed;
    if (airplane.moveDown && airplane.y + airplane.height < canvas.height) airplane.y += airplane.speed;
}

// Função para disparar tiros
function shoot() {
    bullets.push({
        x: airplane.x + airplane.width / 2 - 2,
        y: airplane.y,
        width: 4,
        height: 10,
        speed: 7
    });
}

setInterval(shoot, 500);

// Função para mover e desenhar os tiros
function moveBullets() {
    bullets.forEach((bullet, index) => {
        bullet.y -= bullet.speed;
        if (bullet.y + bullet.height < 0) bullets.splice(index, 1);
    });
}

function drawBullets() {
    bullets.forEach(bullet => {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

// Função para gerar inimigos
function spawnEnemies() {
    if (Math.random() < 0.05 + level * 0.01) { // Aumenta a frequência conforme o nível
        enemies.push({
            x: Math.random() * (canvas.width - 40),
            y: -50,
            width: 40,
            height: 40,
            speed: 3 + level * 0.5 // Aumenta a velocidade conforme o nível
        });
    }
}

// Função para gerar tanques de combustível
function spawnTanks() {
    if (Math.random() < 0.02) {
        tanks.push({
            x: Math.random() * (canvas.width - 30),
            y: -50,
            width: 30,
            height: 30,
            speed: 2
        });
    }
}

// Função para mover inimigos e tanques
function moveEnemies() {
    enemies.forEach((enemy, index) => {
        enemy.y += enemy.speed;
        if (enemy.y > canvas.height) enemies.splice(index, 1);
    });
    tanks.forEach((tank, index) => {
        tank.y += tank.speed;
        if (tank.y > canvas.height) tanks.splice(index, 1);
    });
}

// Função para desenhar o avião
function drawAirplane() {
    ctx.drawImage(airplaneImage, airplane.x, airplane.y, airplane.width, airplane.height);
}

// Função para desenhar inimigos e tanques
function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.width, enemy.height);
    });
    tanks.forEach(tank => {
        ctx.drawImage(tankImage, tank.x, tank.y, tank.width, tank.height);
    });
}

// Verifica colisões entre inimigos, tanques e tiros
function checkCollisions() {
    enemies.forEach((enemy, enemyIndex) => {
        bullets.forEach((bullet, bulletIndex) => {
            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {
                bullets.splice(bulletIndex, 1);
                enemies.splice(enemyIndex, 1);
                score += 100;
                enemiesDefeated++;
                if (enemiesDefeated % 10 === 0) {
                    nextLevel(); // Aumenta de fase a cada 10 inimigos derrotados
                }
            }
        });

        // Verifica colisão entre o avião e inimigos
        if (airplane.x < enemy.x + enemy.width &&
            airplane.x + airplane.width > enemy.x &&
            airplane.y < enemy.y + enemy.height &&
            airplane.y + airplane.height > enemy.y) {
            enemies.splice(enemyIndex, 1);
            lives -= 1;
            if (lives === 0) {
                gameOver = true;
            }
        }
    });

    // Verifica colisão entre o avião e tanques de combustível
    tanks.forEach((tank, tankIndex) => {
        if (airplane.x < tank.x + tank.width &&
            airplane.x + airplane.width > tank.x &&
            airplane.y < tank.y + tank.height &&
            airplane.y + airplane.height > tank.y) {
            tanks.splice(tankIndex, 1);
            fuel = Math.min(100, fuel + 20);  // Reabastece 20%
        }
    });
}

// Função para consumir combustível
function consumeFuel() {
    fuel -= 0.1;
    if (fuel <= 0) {
        gameOver = true;
    }
}

// Função para atualizar o HUD
function updateHUD() {
    document.getElementById('fuel').innerText = Math.max(fuel.toFixed(0), 0);
    document.getElementById('score').innerText = score;
    document.getElementById('lives').innerText = lives;
    document.getElementById('level').innerText = level;
}

// Função para mudar de fase
function nextLevel() {
    level++;
    showLevelText = true;
    levelDisplayTime = 100; // Mostra o texto da fase por 100 frames
    document.body.style.backgroundColor = level % 2 === 0 ? '#f08080' : '#4169e1'; // Alterna cores
}

// Função para desenhar o texto da fase no meio da tela
function drawLevelText() {
    if (showLevelText) {
        ctx.font = '40px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(`Fase ${level}`, canvas.width / 2 - 70, canvas.height / 2);
        levelDisplayTime--;
        if (levelDisplayTime <= 0) {
            showLevelText = false;
        }
    }
}

// Loop principal do jogo
function gameLoop() {
    if (!gameOver) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        moveAirplane();
        moveBullets();
        moveEnemies();
        spawnEnemies();
        spawnTanks();
        drawAirplane();
        drawBullets();
        drawEnemies();
        checkCollisions();
        consumeFuel();
        updateHUD();
        drawLevelText(); // Desenha o texto da fase no meio da tela

        requestAnimationFrame(gameLoop);
    } else {
        document.getElementById('gameOverScreen').style.display = 'block';
        document.getElementById('finalScore').innerText = score;
    }
}

// Reiniciar o jogo
function restartGame() {
    gameOver = false;
    score = 0;
    fuel = 100;
    lives = 3;
    enemies = [];
    tanks = [];
    bullets = [];
    level = 1;
    enemiesDefeated = 0;
    document.getElementById('gameOverScreen').style.display = 'none';
    document.body.style.backgroundColor = '#add8e6'; // Nova cor de fundo
    gameLoop();
}

// Inicializa o jogo
window.onload = function() {
    gameLoop();
}
