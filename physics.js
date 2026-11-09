/**
 * Physics, Collision Engine, and Particle Effects
 * Handles platformer kinematics, AABB collisions, enemy stomping, and item boxes.
 */

class Particle {
    constructor(x, y, vx, vy, color, size, life, type = 'circle') {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.maxLife = life;
        this.life = life;
        this.type = type; // 'circle', 'heart', 'star', 'fire'
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.15; // gravity
        this.life--;
        this.size = Math.max(0, this.size - 0.05);
    }

    draw(ctx) {
        if (this.life <= 0) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
        ctx.fillStyle = this.color;

        if (this.type === 'heart') {
            ctx.beginPath();
            ctx.arc(this.x - 2, this.y, this.size, 0, Math.PI * 2);
            ctx.arc(this.x + 2, this.y, this.size, 0, Math.PI * 2);
            ctx.lineTo(this.x, this.y + this.size * 2);
            ctx.fill();
        } else if (this.type === 'star') {
            KittyRenderer.drawStar(ctx, this.x, this.y, 4, this.size * 2, this.size);
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

class PhysicsEngine {
    constructor(level) {
        this.level = level;
        this.particles = [];
        this.mode = 'cute';

        // Kinematics tuning (Super Mario Bros inspired feel)
        this.GRAVITY = 0.65;
        this.MAX_FALL_SPEED = 12;
        this.ACCEL = 0.8;
        this.MAX_SPEED = 4.8;
        this.FRICTION = 0.82;
        this.JUMP_FORCE = -12.5;
        this.BOUNCE_FORCE = -9;
    }

    isPlatformSolid(p) {
        return !!p;
    }

    updatePlatforms(player, dt = 0.016) {
        if (!this.level || !this.level.platforms) return;

        for (const p of this.level.platforms) {
            // Plataformas deslizantes / móviles horizontales
            if (p.isMoving || p.type === 'moving_h') {
                if (p.vx === undefined) p.vx = 1.2;
                p.x += p.vx;
                if (p.minX !== undefined && p.x <= p.minX) {
                    p.x = p.minX;
                    p.vx = Math.abs(p.vx);
                } else if (p.maxX !== undefined && p.x + p.width >= p.maxX) {
                    p.x = p.maxX - p.width;
                    p.vx = -Math.abs(p.vx);
                }
                if (player && player.standingPlatform === p) {
                    player.x += p.vx;
                }
            }
            // Plataformas deslizantes / móviles verticales
            else if (p.type === 'moving_v') {
                if (p.vy === undefined) p.vy = 1.0;
                p.y += p.vy;
                if (p.minY !== undefined && p.y <= p.minY) {
                    p.y = p.minY;
                    p.vy = Math.abs(p.vy);
                } else if (p.maxY !== undefined && p.y + p.height >= p.maxY) {
                    p.y = p.maxY - p.height;
                    p.vy = -Math.abs(p.vy);
                }
                if (player && player.standingPlatform === p) {
                    player.y += p.vy;
                }
            }
        }
    }

    updatePlayer(player, controls) {
        // --- HORIZONTAL MOVEMENT ---
        if (controls.state.left) {
            player.vx -= this.ACCEL;
            player.facing = -1;
            player.animState = 'walk';
        } else if (controls.state.right) {
            player.vx += this.ACCEL;
            player.facing = 1;
            player.animState = 'walk';
        } else {
            player.vx *= this.FRICTION;
            if (Math.abs(player.vx) < 0.1) {
                player.vx = 0;
                player.animState = 'idle';
            }
        }

        // Clamp horizontal velocity
        player.vx = Math.max(-this.MAX_SPEED, Math.min(this.MAX_SPEED, player.vx));

        // Move horizontally and check collisions
        player.x += player.vx;
        this.resolveHorizontalCollisions(player);

        // --- VERTICAL MOVEMENT & GRAVITY ---
        if (controls.state.jump && player.isGrounded) {
            player.vy = this.JUMP_FORCE;
            player.isGrounded = false;
            player.animState = 'jump';
            if (window.soundEngine) window.soundEngine.playJump();
            if (navigator.vibrate) {
                try { navigator.vibrate(15); } catch(e) {}
            }

            // Spawn cute jump dust/heart particles
            this.spawnJumpParticles(player.x + player.width / 2, player.y + player.height);
        }

        player.vy += this.GRAVITY;
        player.vy = Math.min(player.vy, this.MAX_FALL_SPEED);

        // Move vertically and check collisions
        player.y += player.vy;
        player.isGrounded = false;
        this.resolveVerticalCollisions(player);

        if (!player.isGrounded) {
            player.animState = 'jump';
        }

        // --- INVULNERABILITY TIMER ---
        if (player.invulnerableTimer > 0) {
            player.invulnerableTimer--;
        }

        // Clamp inside left level boundary
        if (player.x < 0) {
            player.x = 0;
            player.vx = 0;
        }

        // Update active particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    resolveHorizontalCollisions(player) {
        for (const p of this.level.platforms) {
            if (!this.isPlatformSolid(p)) continue;
            if (this.checkAABB(player, p)) {
                if (player.vx > 0) {
                    // Collided while moving right
                    player.x = p.x - player.width;
                    player.vx = 0;
                } else if (player.vx < 0) {
                    // Collided while moving left
                    player.x = p.x + p.width;
                    player.vx = 0;
                }
            }
        }
    }

    resolveVerticalCollisions(player) {
        player.standingPlatform = null;
        for (const p of this.level.platforms) {
            if (!this.isPlatformSolid(p)) continue;
            if (this.checkAABB(player, p)) {
                if (player.vy > 0) {
                    // Falling onto platform (Landing)
                    player.y = p.y - player.height;
                    player.vy = 0;
                    player.isGrounded = true;
                    player.standingPlatform = p;
                } else if (player.vy < 0) {
                    // Bonking head into ceiling or item box
                    player.y = p.y + p.height;
                    player.vy = 0;

                    // If it's an item box, trigger hit effect!
                    if (p.type === 'item_box' && p.content) {
                        this.hitItemBox(p);
                    }
                }
            }
        }
    }

    hitItemBox(box) {
        if (!box.hit) {
            box.hit = true;
            if (window.soundEngine) window.soundEngine.playCoin();

            // Spawn collectible reward above the box
            this.level.collectibles.push({
                x: box.x + 4,
                y: box.y - 30,
                width: 24,
                height: 24,
                collected: false,
                isReward: true
            });

            // Particles popping
            this.spawnCollectParticles(box.x + box.width / 2, box.y, '#FFD700', 'star');
        }
    }

    updateEnemies(player, onHurt) {
        const levelNum = (this.level && this.level.levelNumber) ? this.level.levelNumber : 1;
        // Escalado progresivo de velocidad: +20% más rápido por cada nivel
        const speedMultiplier = 1 + (levelNum - 1) * 0.20;
        // Mecánica de persecución activa a partir del Nivel 3 ("El Averno de Kitty")
        const canChase = levelNum >= 3;
        const CHASE_RANGE_X = 220; // Rango de visión horizontal
        const CHASE_RANGE_Y = 120; // Rango de visión vertical

        this.level.enemies.forEach(enemy => {
            if (!enemy.alive) return;

            // Timer de animación para apertura/cierre de boca de Pac-Man y slime
            enemy.animTime = (enemy.animTime || 0) + 0.016;

            // Velocidad base
            if (enemy.baseSpeed === undefined) {
                enemy.baseSpeed = Math.abs(enemy.vx) || 1.2;
            }

            const currentSpeed = enemy.baseSpeed * speedMultiplier;

            // Cálculo de distancia a Kitty
            const enemyCenterX = enemy.x + enemy.width / 2;
            const enemyCenterY = enemy.y + enemy.height / 2;
            const playerCenterX = player.x + player.width / 2;
            const playerCenterY = player.y + player.height / 2;

            const dx = playerCenterX - enemyCenterX;
            const dy = playerCenterY - enemyCenterY;

            // --- LÓGICA DE PERSECUCIÓN ACTIVA (Nivel 3+) ---
            if (canChase && Math.abs(dx) <= CHASE_RANGE_X && Math.abs(dy) <= CHASE_RANGE_Y) {
                enemy.isChasing = true;
                // Se mueve activamente en dirección hacia Kitty (signo de dx)
                const chaseDirection = dx >= 0 ? 1 : -1;
                // Impulso de aceleración de persecución (+15% extra al acechar)
                enemy.vx = chaseDirection * (currentSpeed * 1.15);
            } else {
                enemy.isChasing = false;
                // Patrullaje regular con la velocidad escalada del nivel
                const patrolDirection = enemy.vx >= 0 ? 1 : -1;
                enemy.vx = patrolDirection * currentSpeed;
            }

            // Movimiento y respeto de límites de plataforma
            enemy.x += enemy.vx;
            if (enemy.minX !== undefined && enemy.maxX !== undefined) {
                if (enemy.x <= enemy.minX) {
                    enemy.x = enemy.minX;
                    enemy.vx = Math.abs(enemy.vx);
                } else if (enemy.x + enemy.width >= enemy.maxX) {
                    enemy.x = enemy.maxX - enemy.width;
                    enemy.vx = -Math.abs(enemy.vx);
                }
            }

            // Check collision with player
            if (this.checkAABB(player, enemy)) {
                // If player is falling onto enemy's head -> Stomp!
                const isFalling = player.vy > 0;
                const playerBottom = player.y + player.height;
                const enemyTop = enemy.y + (enemy.type === 'pacman' ? 6 : 12);

                if (isFalling && playerBottom <= enemyTop + 16) {
                    // Squashed enemy
                    enemy.alive = false;
                    player.vy = this.BOUNCE_FORCE; // Bouncy jump boost
                    if (window.soundEngine) window.soundEngine.playStomp();
                    if (navigator.vibrate) {
                        try { navigator.vibrate(35); } catch(e) {}
                    }

                    const particleColor = enemy.type === 'pacman' ? '#FFD54F' : '#FF4081';
                    this.spawnCollectParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, particleColor, 'circle');
                } else if (player.invulnerableTimer <= 0) {
                    // Player gets hurt
                    onHurt();
                }
            }
        });
    }

    updateCollectibles(player, onCollect) {
        this.level.collectibles.forEach(item => {
            if (!item.collected && this.checkAABB(player, item)) {
                item.collected = true;
                if (window.soundEngine) window.soundEngine.playCoin();
                if (navigator.vibrate) {
                    try { navigator.vibrate(20); } catch(e) {}
                }
                onCollect(item);

                const particleColor = item.isReward ? '#FFD700' : '#FF4081';
                this.spawnCollectParticles(item.x + item.width / 2, item.y + item.height / 2, particleColor, 'heart');
                this.spawnCollectParticles(item.x + item.width / 2, item.y + item.height / 2, '#FFD54F', 'star');
            }
        });
    }

    updateCheckpoints(player, onReach) {
        if (!this.level.checkpoints) return;
        this.level.checkpoints.forEach(cp => {
            if (!cp.reached && this.checkAABB(player, cp)) {
                cp.reached = true;
                if (navigator.vibrate) {
                    try { navigator.vibrate([30, 40, 40]); } catch(e) {}
                }
                this.spawnCollectParticles(cp.x + cp.width / 2, cp.y - 10, '#FFD700', 'star');
                onReach(cp);
            }
        });
    }

    spawnJumpParticles(x, y) {
        for (let i = 0; i < 4; i++) {
            this.particles.push(new Particle(
                x + (Math.random() - 0.5) * 16,
                y - 2,
                (Math.random() - 0.5) * 2,
                -Math.random() * 2,
                'rgba(255, 182, 193, 0.8)',
                3,
                18,
                'circle'
            ));
        }
    }

    spawnCollectParticles(x, y, color, type) {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const speed = 2 + Math.random() * 2;
            this.particles.push(new Particle(
                x,
                y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed - 1.5,
                color,
                4,
                24,
                type
            ));
        }
    }

    spawnHellEmbers(cameraX, canvasWidth, canvasHeight) {
        if (Math.random() < 0.25) {
            this.particles.push(new Particle(
                cameraX + Math.random() * canvasWidth,
                canvasHeight - 10,
                (Math.random() - 0.5) * 1.5,
                -2 - Math.random() * 2.5,
                '#FF3D00',
                2.5,
                45,
                'fire'
            ));
        }
    }

    checkAABB(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }
}

window.PhysicsEngine = PhysicsEngine;
