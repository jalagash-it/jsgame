const GAMEBOX_WIDTH = 1400;
const GAMEBOX_HEIGHT = 600;
const ROCKET_WIDTH = 64;
const ROCKET_HEIGHT = 64;
const gameBox = document.getElementById('gameBox');
const scoreDiv = document.getElementById('scores');
const questionLabel = document.getElementById('questionLabel');
gameBox.style.width = GAMEBOX_WIDTH + 'px';
gameBox.style.height = GAMEBOX_HEIGHT + 'px';


class Game {
    gameStatus = 'stop';
    moving = { toLeft: false, toRight: false, toTop: false, toBottom: false };
    gameSpeed = 20;
    rocketStep = 4;
    enemyStep = 2;
    engineInterval;
    bullets = [];
    enemies = [];
    rocket;
    self;
    leftBorder;
    rightBorder;
    topBorder;
    bottomBorder;

    constructor() {
        self = this;
        document.body.onkeydown = function(e) {
            if (self.status !== 'play')
                return;
            switch (e.code) {
                case 'Space':
                    { self.shoot(); }
                    break;
                case 'ArrowLeft':
                    { self.rocketToLeft(); }
                    break;
                case 'ArrowRight':
                    { self.rocketToRight(); }
                    break;
                case 'ArrowUp':
                    { self.rocketToUp(); }
                    break;
                case 'ArrowDown':
                    { self.rocketToBottom(); }
                    break;
            }
        }
        document.body.onkeyup = function(e) {
            if (self.status !== 'play')
                return;
            switch (e.code) {
                case 'ArrowLeft':
                    { self.moving.toLeft = false; }
                    break;
                case 'ArrowRight':
                    { self.moving.toRight = false; }
                    break;
                case 'ArrowUp':
                    { self.moving.toTop = false; }
                    break;
                case 'ArrowDown':
                    { self.moving.toBottom = false; }
                    break;
                case 'Escape':
                    { self.pause(); }
                    break;
            }

        }
        const gRect = gameBox.getClientRects()[0];
        self.leftBorder = Math.ceil(gRect.x);
        self.rightBorder = Math.ceil(gRect.x + gRect.width - 64);
        self.topBorder = Math.ceil(gRect.y);
        self.bottomBorder = Math.ceil(gRect.y + gRect.height - 64);
        self.tests();
    }
    tests() {

    }
    createRocket() {
        const r = document.getElementById('rocket');
        const gRect = gameBox.getClientRects()[0];

        let top = Math.ceil(gRect.y + gRect.height - 64);
        r.top = top;
        r.style.top = top + 'px';

        let left = Math.ceil(gRect.left) + Math.ceil(gRect.width / 2);
        r.left = left;
        r.style.left = left + 'px';

        r.width = ROCKET_WIDTH;
        r.style.width = ROCKET_WIDTH + 'px';

        r.height = ROCKET_HEIGHT;
        r.style.height = ROCKET_HEIGHT + 'px';
        return r;
    }
    createEnemy(settings) {
        let d = document.createElement('div');
        d.className = 'enemy-rocket';
        gameBox.appendChild(d);
        d.left = settings.left;
        d.style.left = d.left + 'px';
        d.top = settings.top;
        d.style.top = d.top + 'px';
        d.toLeft = settings.toLeft;
        self.enemies.push(d);
    }
    shoot() {
        let bullet = document.createElement('div');
        bullet.className = 'bullet';
        const left = self.rocket.left + (self.rocket.width / 2) - 16;
        bullet.style.left = left + 'px';
        bullet.left = left;
        const top = self.rocket.top - 16;
        bullet.style.top = top + 'px';
        bullet.top = top;
        gameBox.appendChild(bullet);
        self.bullets.push(bullet);
    }
    rocketToLeft() {
        self.moving.toLeft = true;
    }
    rocketToRight() {
        self.moving.toRight = true;
    }
    rocketToUp() {
        self.moving.toTop = true;
    }
    rocketToBottom() {
        self.moving.toBottom = true;
    }
    start() {
        if (self.status != 'play') {
            self.status = 'play';
            self.engineInterval = setInterval(self.engine, self.gameSpeed);
            location.hash = '#main';
            location.hash = '#gameBox';
            self.rocket = self.createRocket();
            self.questionStart();
            self.questionTest();
        }
    }
    pause() {
        clearInterval(self.engineInterval);
        self.questionPause();
        self.status = 'pause';
    }
    stop() {
        self.questionStop();
        clearInterval(self.engineInterval);
        self.bullets.forEach(b => b.remove());
        self.bullets.length = 0;

        self.enemies.forEach(b => b.remove());
        self.enemies.length = 0;

        self.rocket = null;
        self.moving.toLeft = false;
        self.moving.toRight = false;
        self.moving.toTop = false;
        self.moving.toBottom = false;
        self.status = 'stop';
    }
    restart() {
        self.stop();
        self.start();
        location.hash = '#main';
        location.hash = '#gameBox';
    }
    engine() {
        self.moveBullets();
        self.moveRocket();
        self.enemyCrash();
        self.moveEnemies();
        self.generateEnemies();
        self.stopIfCrash();
    }
    moveBullets() {
        for (let i = self.bullets.length - 1; i >= 0; i--) {
            let l = self.bullets[i].top -= 5;
            if (self.bullets[i].top < self.topBorder) {
                self.bullets[i].remove();
                self.bullets.splice(i, 1);
                continue;
            }
            self.bullets[i].style.top = l + 'px';
        }
    }
    moveRocket() {
        if (self.moving.toLeft) {
            if (self.rocket.left > self.leftBorder) {
                self.rocket.left -= self.rocketStep;
                self.rocket.style.left = self.rocket.left + 'px';
            }
        } else if (self.moving.toRight) {
            if (self.rocket.left < self.rightBorder) {
                self.rocket.left += self.rocketStep;
                self.rocket.style.left = self.rocket.left + 'px';
            }
        }
        if (self.moving.toTop) {
            if (self.rocket.top > self.topBorder) {
                self.rocket.top -= self.rocketStep;
                self.rocket.style.top = self.rocket.top + 'px';
            }
        } else if (self.moving.toBottom) {
            if (self.rocket.top < self.bottomBorder) {
                self.rocket.top += self.rocketStep;
                self.rocket.style.top = self.rocket.top++ + 'px';
            }
        }

    }
    moveEnemies() {
        for (let i = self.enemies.length - 1; i >= 0; i--) {
            let e = self.enemies[i];
            e.top += self.enemyStep;
            if (e.top > self.bottomBorder) {
                e.remove();
                self.enemies.splice(i, 1)
                return;
            }
            if (Math.random() >= 0.98)
                e.toLeft = !e.toLeft;
            if (e.toLeft && e.left > self.leftBorder) {
                e.left -= self.enemyStep;
            } else if (e.left < self.rightBorder) {
                e.left += self.enemyStep;
            }
            e.style.left = e.left + 'px';
            e.style.top = e.top + 'px';
        }
    }
    enemyCrash() {
        for (let i = self.bullets.length - 1; i >= 0; i--)
            for (let j = self.enemies.length - 1; j >= 0; j--) {
                let b = self.bullets[i];
                let e = self.enemies[j];
                if (b.left > e.left && b.left < (e.left + 32) && b.top < (e.top + 64) && b.top > e.top) {
                    self.bullets.splice(i, 1);
                    b.remove();
                    self.enemies.splice(j, 1);
                    e.remove();
                    scoreDiv.innerText -= -15;
                }

            }

    }
    generateEnemies() {
        if (self.enemies.length > 5) return;
        let left = Math.floor(Math.random() * (self.rightBorder - self.leftBorder) + self.leftBorder);
        self.createEnemy({
            left: left,
            top: 100,
            toLeft: left % 2 == 1
        })
    }
    stopIfCrash() {
        let l = self.rocket.left - 32;
        let r = self.rocket.left + 32;
        let t = self.rocket.top - 32;
        let b = self.rocket.top + 32;
        for (let i = 0; i < self.enemies.length; i++) {
            let e = self.enemies[i];
            if (e.left >= l && e.left <= r && e.top <= b && e.top >= t) {

                self.gameOver();
                return;
            }
        }
    }
    gameOver() {
        self.pause();
        self.moving.toLeft = false;
        self.moving.toRight = false;
        self.moving.toTop = false;
        self.moving.toBottom = false;
        alert('Ойын аяқталды. Ұпайыңыз:' + scoreDiv.innerText);
    }
    use(module) {
        if (!module || !(module.workWithGame instanceof Function))
            return;
        module.workWithGame(self);
    }
}


const gameInstance = new Game();

gameInstance.use(questionsModule)
document.getElementById('btnStart').onclick = () => gameInstance.start();
document.getElementById('btnStop').onclick = () => gameInstance.stop();
document.getElementById('btnPause').onclick = () => gameInstance.pause();
document.getElementById('btnRestart').onclick = () => gameInstance.restart();

console.info('Ойна да үйрен');