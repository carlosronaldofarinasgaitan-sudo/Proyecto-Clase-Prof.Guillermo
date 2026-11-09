/**
 * Main Game Controller & Game Loop
 * Manages game state, camera, HUD, dynamic Cute <-> Hell dimension shifts,
 * 3-hearts life system, progressive checkpoints, level sequencing & procedural levels.
 */

class Game {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.width = 960;
        this.height = 540;

        this.controls = null;
        this.physics = null;
        this.level = null;
        this.currentLevelIndex = 1;

        this.state = 'WELCOME'; // 'WELCOME', 'WARDROBE', 'PLAYING', 'GAMEOVER', 'VICTORY'
        this.mode = 'cute';      // 'cute' or 'hell'
        this.dimensionTransition = 0; // Screen flash / rift effect timer

        this.player = {
            x: 80,
            y: 350,
            width: 30,
            height: 44,
            vx: 0,
            vy: 0,
            isGrounded: false,
            facing: 1,
            animState: 'idle',
            animTime: 0,
            invulnerableTimer: 0
        };

        this.camera = { x: 0, y: 0 };
        this.hearts = 3;
        this.maxHearts = 3;
        this.score = 0;
        this.cupcakes = 0;
        this.currentCheckpoint = null;
        this.toastTimer = null;

        // Récord de puntuación y progreso guardados en localStorage
        this.highScore = parseInt(localStorage.getItem('kitty_shelzy_high_score') || '0', 10);
        this.maxUnlockedLevel = parseInt(localStorage.getItem('kitty_shelzy_max_unlocked_level') || '1', 10);
        this.levelStars = JSON.parse(localStorage.getItem('kitty_shelzy_level_stars') || '{}');
        this.levelScores = JSON.parse(localStorage.getItem('kitty_shelzy_level_scores') || '{}');
        this.isNewHighScore = false;
        this.screenShake = 0;

        this.lastTime = 0;
        this.rafId = null;

        this.init();
    }

    init() {
        this.canvas = document.getElementById('game-canvas');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
        }

        this.controls = new window.ControlsManager();
        this.loadLevel(this.currentLevelIndex);
        this.physics = new window.PhysicsEngine(this.level);

        this.setupUI();
        this.startWelcomeLoader();

        // Start game loop
        this.lastTime = performance.now();
        this.rafId = requestAnimationFrame((t) => this.gameLoop(t));
    }

    resizeCanvas() {
        if (!this.canvas) return;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    loadLevel(levelNumber) {
        this.currentLevelIndex = levelNumber;
        this.level = window.LevelManager.getLevel(levelNumber);
        if (this.physics) {
            this.physics.level = this.level;
        }
        this.currentCheckpoint = this.level.checkpoints[0];
    }

    nextLevel() {
        this.loadLevel(this.currentLevelIndex + 1);
        this.startGame(false); // keep accumulated score & cupcakes
        this.showToast(`🎉 ¡Entrando a ${this.level.name}!`);
    }

    setupUI() {
        // Enter Wardrobe button from Welcome Screen
        const enterWardrobeBtn = document.getElementById('btn-enter-wardrobe');
        if (enterWardrobeBtn) {
            enterWardrobeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.soundEngine) {
                    window.soundEngine.init();
                }
                const welcomeEl = document.getElementById('welcome-screen');
                const dressupEl = document.getElementById('dressup-screen');
                if (welcomeEl) welcomeEl.classList.remove('active');
                if (dressupEl) dressupEl.classList.add('active');
                this.state = 'WARDROBE';
            });
        }

        // Start Game button from Wardrobe -> Ahora abre el Mapa de Mundos estilo Super Mario Bros
        const startBtn = document.getElementById('btn-start-adventure');
        if (startBtn) {
            startBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openLevelSelect();
            });
        }

        // Return to Wardrobe from World Map
        const mapWardrobeBtn = document.getElementById('btn-map-goto-wardrobe');
        if (mapWardrobeBtn) {
            mapWardrobeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openWardrobe();
            });
        }

        // Map button from HUD and Modals
        const mapBtns = document.querySelectorAll('.btn-goto-map');
        mapBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openLevelSelect();
            });
        });

        // Retry / Restart buttons
        const retryBtns = document.querySelectorAll('.btn-retry-game');
        retryBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.restartLevel();
            });
        });

        // Next Level button
        const nextLevelBtn = document.getElementById('btn-next-level');
        if (nextLevelBtn) {
            nextLevelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.nextLevel();
            });
        }

        // Wardrobe Return buttons
        const wardrobeBtns = document.querySelectorAll('.btn-goto-wardrobe');
        wardrobeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openWardrobe();
            });
        });

        // Audio Mute toggle
        const audioBtn = document.getElementById('btn-toggle-sound');
        if (audioBtn) {
            audioBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.soundEngine) {
                    const isMuted = window.soundEngine.toggleMute();
                    audioBtn.textContent = isMuted ? '🔇' : '🔊';
                }
            });
        }

        // Dimension Shift Button (Manual Invert Trigger)
        const shiftBtn = document.getElementById('btn-touch-shift');
        if (shiftBtn) {
            shiftBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleDimension();
            });
        }
    }

    startWelcomeLoader() {
        let progress = 0;
        const fillEl = document.getElementById('welcome-progress-fill');
        const percentEl = document.getElementById('welcome-progress-percent');
        const statusEl = document.getElementById('welcome-progress-status');
        const enterBtn = document.getElementById('btn-enter-wardrobe');

        const phrases = [
            { threshold: 0, text: "Preparando lazos y galletitas..." },
            { threshold: 30, text: "Glaseando mundos pastel..." },
            { threshold: 65, text: "Invocando portales del averno..." },
            { threshold: 88, text: "Sincronizando a Kitty Shelzy..." },
            { threshold: 100, text: "¡Todo listo para la aventura!" }
        ];

        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 8) + 4;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
            }

            if (fillEl) fillEl.style.width = `${progress}%`;
            if (percentEl) percentEl.textContent = `${progress}%`;

            if (statusEl) {
                const currentPhrase = [...phrases].reverse().find(p => progress >= p.threshold);
                if (currentPhrase) statusEl.textContent = currentPhrase.text;
            }

            if (progress === 100 && enterBtn) {
                enterBtn.style.display = 'flex';
            }
        }, 55);
    }

    startGame(resetScore = true) {
        if (window.soundEngine) {
            window.soundEngine.init();
            window.soundEngine.setMode('cute');
            window.soundEngine.startBGM();
        }

        const welcomeEl = document.getElementById('welcome-screen');
        if (welcomeEl) welcomeEl.classList.remove('active');
        const dressupEl = document.getElementById('dressup-screen');
        if (dressupEl) dressupEl.classList.remove('active');
        const mapEl = document.getElementById('level-select-screen');
        if (mapEl) mapEl.classList.remove('active');

        document.getElementById('game-screen').classList.add('active');
        document.getElementById('game-over-modal').classList.remove('active');
        document.getElementById('victory-modal').classList.remove('active');

        this.state = 'PLAYING';
        this.mode = 'cute';
        this.hearts = 3;

        if (resetScore) {
            this.score = 0;
            this.cupcakes = 0;
            this.isNewHighScore = false;
        }

        this.currentCheckpoint = this.level.checkpoints[0];
        this.respawnAtCheckpoint();
        this.updateHUD();
    }

    openLevelSelect() {
        if (window.soundEngine) {
            window.soundEngine.stopBGM();
        }

        const welcomeEl = document.getElementById('welcome-screen');
        if (welcomeEl) welcomeEl.classList.remove('active');
        const dressupEl = document.getElementById('dressup-screen');
        if (dressupEl) dressupEl.classList.remove('active');
        const gameEl = document.getElementById('game-screen');
        if (gameEl) gameEl.classList.remove('active');
        const mapEl = document.getElementById('level-select-screen');
        if (mapEl) mapEl.classList.add('active');

        document.getElementById('game-over-modal').classList.remove('active');
        document.getElementById('victory-modal').classList.remove('active');

        this.state = 'LEVEL_SELECT';
        this.renderWorldMap();
    }

    renderWorldMap() {
        const container = document.getElementById('world-map-nodes');
        if (!container) return;

        const levelsMeta = [
            { num: 1, name: "El Despertar Kawaii", icon: "🌸", desc: "Pradera de Algodón" },
            { num: 2, name: "Pesadilla Pastel 🎀", icon: "🎀", desc: "Bosque de Azúcar" },
            { num: 3, name: "El Averno de Kitty", icon: "😈", desc: "Volcán de Magma" },
            { num: 4, name: "¡Hola Shelzy XD!", icon: "🧁", desc: "Caos Glaseado" },
            { num: 5, name: "Zona Prohibida para Frikis", icon: "🎮", desc: "Fortaleza Final" }
        ];

        let totalStars = 0;
        container.innerHTML = '';

        levelsMeta.forEach(lvl => {
            const isUnlocked = lvl.num <= this.maxUnlockedLevel;
            const stars = this.levelStars[lvl.num] || 0;
            const best = this.levelScores[lvl.num] || 0;
            totalStars += stars;

            const isCurrent = lvl.num === this.currentLevelIndex;

            const card = document.createElement('div');
            card.className = `map-node-card ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''}`;

            let starsHTML = '';
            for (let s = 1; s <= 3; s++) {
                starsHTML += `<span class="${s <= stars ? 'star-filled' : 'star-empty'}">⭐</span>`;
            }

            card.innerHTML = `
                <span class="node-number-tag">Mundo ${lvl.num}</span>
                <div class="node-icon-circle">${lvl.icon}</div>
                <h3 class="node-title">${lvl.name}</h3>
                <div class="node-stars-row">${starsHTML}</div>
                <div class="node-best-score">🏆 Récord: ${best}</div>
                <button class="node-play-btn" ${isUnlocked ? `data-level="${lvl.num}"` : 'disabled'}>
                    ${isUnlocked ? '¡JUGAR!' : '🔒 Bloqueado'}
                </button>
            `;

            if (isUnlocked) {
                const btn = card.querySelector('.node-play-btn');
                if (btn) {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.loadLevel(lvl.num);
                        this.startGame(true);
                    });
                }
                card.addEventListener('click', () => {
                    this.loadLevel(lvl.num);
                    this.startGame(true);
                });
            }

            container.appendChild(card);
        });

        // Update stats summary in map header
        const starsEl = document.getElementById('map-total-stars');
        if (starsEl) starsEl.textContent = `${totalStars}/15`;

        const highEl = document.getElementById('map-high-score');
        if (highEl) highEl.textContent = this.highScore;
    }

    openWardrobe() {
        if (window.soundEngine) {
            window.soundEngine.stopBGM();
        }

        const welcomeEl = document.getElementById('welcome-screen');
        if (welcomeEl) welcomeEl.classList.remove('active');
        const mapEl = document.getElementById('level-select-screen');
        if (mapEl) mapEl.classList.remove('active');

        document.getElementById('game-screen').classList.remove('active');
        document.getElementById('dressup-screen').classList.add('active');
        document.getElementById('game-over-modal').classList.remove('active');
        document.getElementById('victory-modal').classList.remove('active');

        this.state = 'WARDROBE';
    }

    restartLevel() {
        this.loadLevel(this.currentLevelIndex);
        this.startGame(false);
    }

    respawnAtCheckpoint() {
        const cp = this.currentCheckpoint || this.level.checkpoints[0];
        this.player.x = cp.x;
        this.player.y = cp.y;
        this.player.vx = 0;
        this.player.vy = 0;
        this.player.isGrounded = false;
        this.player.invulnerableTimer = 110; // ~1.85 segundos de inmunidad post-daño

        // Snap camera instantly to checkpoint
        this.camera.x = Math.max(0, Math.min(this.level.width - this.width, this.player.x - this.width * 0.35));
    }

    onCheckpointReached(checkpoint) {
        this.currentCheckpoint = checkpoint;
        if (window.soundEngine) {
            window.soundEngine.playCoin();
        }
        this.showToast(`🚩 ¡Punto de Control: ${checkpoint.name}!`);
    }

    showToast(message) {
        const toast = document.getElementById('checkpoint-toast');
        const text = document.getElementById('checkpoint-toast-text');
        if (!toast || !text) return;

        text.textContent = message;
        toast.classList.add('visible');

        if (this.toastTimer) clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => {
            toast.classList.remove('visible');
            this.toastTimer = null;
        }, 2400);
    }

    toggleDimension() {
        const nextMode = this.mode === 'cute' ? 'hell' : 'cute';
        this.switchMode(nextMode);
    }

    switchMode(newMode) {
        if (this.mode === newMode) return;
        this.mode = newMode;
        if (this.physics) {
            this.physics.mode = newMode;
        }
        this.dimensionTransition = 22; // Destello y glitch visual

        if (navigator.vibrate) {
            try { navigator.vibrate([25, 40, 25]); } catch(e) {}
        }

        if (window.soundEngine) {
            window.soundEngine.setMode(newMode);
        }

        // Update HUD indicator badge
        const badge = document.getElementById('hud-dimension-badge');
        if (badge) {
            if (newMode === 'hell') {
                badge.className = 'dimension-badge hell-theme';
                badge.innerHTML = '🔥 PESADILLA INFERNAL 😈';
            } else {
                badge.className = 'dimension-badge cute-theme';
                badge.innerHTML = '🌸 MUNDO KAWAII ✨';
            }
        }
    }

    checkDynamicZoneTransition() {
        // Automatically transition between Cute and Hell as player traverses level
        const currentZone = this.level.zones.find(z => this.player.x >= z.startX && this.player.x < z.endX);
        if (currentZone && currentZone.mode !== this.mode) {
            this.switchMode(currentZone.mode);
        }
    }

    onPlayerHurt() {
        if (this.player.invulnerableTimer > 0) return;

        this.hearts--;
        if (window.soundEngine) window.soundEngine.playHurt();
        this.screenShake = 16; // Visual juice: pantalla tiembla brevemente al recibir daño

        if (navigator.vibrate) {
            try { navigator.vibrate([60, 50, 120]); } catch(e) {}
        }

        this.updateHUD();

        if (this.hearts > 0) {
            // Respawn en el último checkpoint alcanzado con gracia de invencibilidad
            this.respawnAtCheckpoint();
            this.showToast(`💔 Corazón perdido (${this.hearts}/3) - Reapareces en Checkpoint`);
        } else {
            // Solo se activa el Game Over real al perder los 3 corazones
            this.triggerGameOver();
        }
    }

    onItemCollected(item) {
        this.cupcakes++;
        this.score += 100;

        // Comprobar y actualizar High Score inmediatamente
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('kitty_shelzy_high_score', this.highScore);
            this.isNewHighScore = true;
        }

        // Spawn visual juice: pop flotante de puntaje
        this.spawnFloatingScore(item.x, item.y, "+100 🧁");

        this.updateHUD();
    }

    spawnFloatingScore(worldX, worldY, text) {
        const container = document.getElementById('canvas-container');
        if (!container) return;

        const screenX = worldX - this.camera.x;
        if (screenX < -50 || screenX > this.width + 50) return;

        const pop = document.createElement('div');
        pop.className = 'floating-score-text';
        pop.textContent = text;
        pop.style.left = `${(screenX / this.width) * 100}%`;
        pop.style.top = `${(worldY / this.height) * 100}%`;
        container.appendChild(pop);

        setTimeout(() => {
            if (pop.parentNode) pop.remove();
        }, 850);
    }

    triggerGameOver() {
        this.state = 'GAMEOVER';
        if (window.soundEngine) {
            window.soundEngine.stopBGM();
            window.soundEngine.playGameOver();
        }

        const scoreEl = document.getElementById('gameover-score');
        const cupEl = document.getElementById('gameover-cupcakes');
        const hsEl = document.getElementById('gameover-highscore');
        const badgeEl = document.getElementById('gameover-newrecord-badge');

        if (scoreEl) scoreEl.textContent = this.score;
        if (cupEl) cupEl.textContent = this.cupcakes;
        if (hsEl) hsEl.textContent = this.highScore;
        if (badgeEl) badgeEl.style.display = this.isNewHighScore ? 'inline-block' : 'none';

        document.getElementById('game-over-modal').classList.add('active');
    }

    triggerVictory() {
        this.state = 'VICTORY';
        if (window.soundEngine) {
            window.soundEngine.stopBGM();
            window.soundEngine.playVictory();
        }

        const subtitleEl = document.getElementById('victory-level-subtitle');
        if (subtitleEl) {
            subtitleEl.textContent = `¡Kitty Shelzy ha superado ${this.level.name}! 🎉`;
        }

        // Calificación por estrellas (⭐⭐⭐) guardada en localStorage
        const totalCollectibles = (this.level && this.level.collectibles) ? Math.max(1, this.level.collectibles.length) : 10;
        const collectedRatio = this.cupcakes / totalCollectibles;

        let stars = 1; // 1 estrella base por terminar
        if (collectedRatio >= 0.5 || this.hearts === 3) stars = 2; // 2 estrellas por 50%+ o sin daño
        if (collectedRatio >= 0.8 && this.hearts >= 2) stars = 3;  // 3 estrellas por maestría
        if (this.hearts === 3 && collectedRatio >= 0.6) stars = 3;

        this.levelStars[this.currentLevelIndex] = Math.max(this.levelStars[this.currentLevelIndex] || 0, stars);
        localStorage.setItem('kitty_shelzy_level_stars', JSON.stringify(this.levelStars));

        // Guardar mejor puntaje para este nivel
        this.levelScores[this.currentLevelIndex] = Math.max(this.levelScores[this.currentLevelIndex] || 0, this.score);
        localStorage.setItem('kitty_shelzy_level_scores', JSON.stringify(this.levelScores));

        // Desbloquear siguiente nivel hasta el 5
        if (this.currentLevelIndex + 1 > this.maxUnlockedLevel && this.currentLevelIndex < 5) {
            this.maxUnlockedLevel = this.currentLevelIndex + 1;
            localStorage.setItem('kitty_shelzy_max_unlocked_level', this.maxUnlockedLevel);
        }

        // Renderizado de estrellas visuales animadas
        const starsBox = document.getElementById('victory-stars-container');
        if (starsBox) {
            starsBox.innerHTML = '';
            for (let s = 1; s <= 3; s++) {
                const span = document.createElement('span');
                span.className = `vstar star-${s} ${s <= stars ? 'earned' : 'empty'}`;
                span.textContent = '⭐';
                starsBox.appendChild(span);
            }
        }

        const starsTag = document.getElementById('victory-stars-rating-text');
        if (starsTag) {
            if (stars === 3) starsTag.textContent = "⭐⭐⭐ ¡3 Estrellas! ¡Maestra Pastelera Perfecta!";
            else if (stars === 2) starsTag.textContent = "⭐⭐ ¡2 Estrellas! ¡Excelente Exploradora!";
            else starsTag.textContent = "⭐ ¡1 Estrella! ¡Sobreviviste al Averno!";
        }

        const scoreEl = document.getElementById('victory-score');
        const cupEl = document.getElementById('victory-cupcakes');
        const heartsEl = document.getElementById('victory-hearts');
        const hsEl = document.getElementById('victory-highscore');
        const badgeEl = document.getElementById('victory-newrecord-badge');

        if (scoreEl) scoreEl.textContent = this.score;
        if (cupEl) cupEl.textContent = this.cupcakes;
        if (heartsEl) heartsEl.textContent = this.hearts;
        if (hsEl) hsEl.textContent = this.highScore;
        if (badgeEl) badgeEl.style.display = this.isNewHighScore ? 'inline-block' : 'none';

        document.getElementById('victory-modal').classList.add('active');
    }

    updateHUD() {
        // Hearts display (3 corazones)
        const heartsContainer = document.getElementById('hud-hearts-container');
        if (heartsContainer) {
            heartsContainer.innerHTML = '';
            for (let i = 0; i < this.maxHearts; i++) {
                const heart = document.createElement('span');
                heart.className = `hud-heart ${i < this.hearts ? 'full' : 'empty'}`;
                heart.textContent = i < this.hearts ? '💖' : '🖤';
                heartsContainer.appendChild(heart);
            }
        }

        // Level name badge
        const levelBadge = document.getElementById('hud-level-badge');
        if (levelBadge && this.level) {
            levelBadge.textContent = this.level.name;
        }

        // Cupcakes / Score display
        const scoreEl = document.getElementById('hud-score-value');
        if (scoreEl) {
            scoreEl.textContent = this.score;
        }

        // High Score display
        const highScoreEl = document.getElementById('hud-highscore-value');
        if (highScoreEl) {
            highScoreEl.textContent = this.highScore;
        }

        // Barra de progreso del nivel en tiempo real
        this.updateHUDProgress();
    }

    updateHUDProgress() {
        if (!this.level) return;
        const spawnX = (this.level.spawn && this.level.spawn.x) ? this.level.spawn.x : 80;
        const goalX = (this.level.goal && this.level.goal.x) ? this.level.goal.x : (this.level.width - 250);
        const totalDist = Math.max(1, goalX - spawnX);
        const currentDist = Math.max(0, this.player.x - spawnX);
        const percent = Math.min(100, Math.max(0, Math.floor((currentDist / totalDist) * 100)));

        const fillEl = document.getElementById('hud-progress-fill');
        const markerEl = document.getElementById('hud-progress-marker');
        const percentEl = document.getElementById('hud-progress-percent');

        if (fillEl) fillEl.style.width = `${percent}%`;
        if (markerEl) markerEl.style.left = `${percent}%`;
        if (percentEl) percentEl.textContent = `${percent}%`;
    }

    gameLoop(timestamp) {
        const dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        if (this.state === 'PLAYING') {
            this.update(dt);
            this.render();
        }

        this.rafId = requestAnimationFrame((t) => this.gameLoop(t));
    }

    update(dt) {
        this.player.animTime += dt;

        // Actualizar estado de dimensión y plataformas (móviles / colapsables)
        this.physics.mode = this.mode;
        this.physics.updatePlatforms(this.player, dt);

        // Physics & collision updates
        this.physics.updatePlayer(this.player, this.controls);

        // Check dynamic Cute <-> Hell zone threshold
        this.checkDynamicZoneTransition();

        // Checkpoints verification
        this.physics.updateCheckpoints(this.player, (cp) => this.onCheckpointReached(cp));

        // Enemies update
        this.physics.updateEnemies(this.player, () => this.onPlayerHurt());

        // Collectibles update
        this.physics.updateCollectibles(this.player, (item) => this.onItemCollected(item));

        // Actualizar barra de progreso del nivel en tiempo real según avance de Kitty
        this.updateHUDProgress();

        // If in Hell mode, spawn atmospheric ember particles
        if (this.mode === 'hell') {
            this.physics.spawnHellEmbers(this.camera.x, this.width, this.height);
        }

        // Check Pit / Lava fall (Death floor at Y = 520)
        if (this.player.y > this.height) {
            this.onPlayerHurt();
        }

        // Check Victory Goal
        if (this.physics.checkAABB(this.player, this.level.goal)) {
            this.triggerVictory();
        }

        // Camera smoothly follows Kitty
        const targetCamX = this.player.x - this.width * 0.35;
        this.camera.x += (targetCamX - this.camera.x) * 0.08;
        this.camera.x = Math.max(0, Math.min(this.level.width - this.width, this.camera.x));
    }

    render() {
        const ctx = this.ctx;
        if (!ctx) return;
        const time = this.player.animTime;

        ctx.clearRect(0, 0, this.width, this.height);

        // 1. Draw Dynamic Parallax Background
        window.KittyRenderer.drawBackground(ctx, this.width, this.height, this.camera.x, this.mode, time);

        // 2. Draw World Objects with Camera Offset
        ctx.save();
        ctx.translate(-this.camera.x, 0);

        // Draw Platforms / Blocks
        this.level.platforms.forEach(p => {
            if (p.x + p.width >= this.camera.x && p.x <= this.camera.x + this.width) {
                window.KittyRenderer.drawTile(ctx, p.x, p.y, p.width, p.height, p.type, this.mode, time);
            }
        });

        // Draw Checkpoints
        if (this.level.checkpoints) {
            this.level.checkpoints.forEach(cp => {
                if (cp.x + cp.width >= this.camera.x && cp.x <= this.camera.x + this.width) {
                    window.KittyRenderer.drawCheckpoint(ctx, cp, this.mode, time);
                }
            });
        }

        // Draw Collectibles
        this.level.collectibles.forEach(item => {
            if (!item.collected && item.x + item.width >= this.camera.x && item.x <= this.camera.x + this.width) {
                window.KittyRenderer.drawCollectible(ctx, item.x, item.y, item.width, item.height, this.mode, time);
            }
        });

        // Draw Enemies
        this.level.enemies.forEach(enemy => {
            if (enemy.alive && enemy.x + enemy.width >= this.camera.x && enemy.x <= this.camera.x + this.width) {
                window.KittyRenderer.drawEnemy(ctx, enemy, this.mode, time);
            }
        });

        // Draw Goal Flag / Portal
        this.drawGoal(ctx, this.level.goal, time);

        // Draw Particles
        this.physics.particles.forEach(p => p.draw(ctx));

        // Draw Hello Kitty (Player) with active wardrobe selection
        const isFlickering = this.player.invulnerableTimer > 0 && Math.floor(this.player.invulnerableTimer / 4) % 2 === 0;
        if (!isFlickering) {
            const wardrobeData = window.customization ? window.customization.getSelectedData() : null;
            window.KittyRenderer.drawKitty(
                ctx,
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height - 24,
                1.0,
                this.player.facing,
                this.player.animState,
                time,
                wardrobeData
            );
        }

        ctx.restore();

        // 3. Dimension Rift Screen Flash Effect
        if (this.dimensionTransition > 0) {
            ctx.save();
            ctx.fillStyle = this.mode === 'hell' ? 'rgba(255, 23, 68, 0.45)' : 'rgba(255, 255, 255, 0.55)';
            ctx.fillRect(0, 0, this.width, this.height);
            this.dimensionTransition--;
            ctx.restore();
        }
    }

    drawGoal(ctx, goal, time) {
        ctx.save();
        ctx.translate(goal.x, goal.y);

        // Golden Pole
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(16, 0, 6, goal.height);

        // Top Orb
        ctx.beginPath();
        ctx.arc(19, 0, 8, 0, Math.PI * 2);
        ctx.fill();

        // Kawaii Flag waving
        const wave = Math.sin(time * 8) * 4;
        ctx.fillStyle = '#FF4081';
        ctx.beginPath();
        ctx.moveTo(22, 10);
        ctx.lineTo(60 + wave, 22);
        ctx.lineTo(22, 34);
        ctx.closePath();
        ctx.fill();

        // Bow icon on flag
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(36 + wave * 0.5, 22, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// Launch game when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
