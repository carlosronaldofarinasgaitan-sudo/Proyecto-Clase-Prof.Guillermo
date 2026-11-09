/**
 * Level Definitions & Procedural Level Generation
 * Includes Level 1 handcrafted, sequential procedural levels (Level 2+)
 * with dynamic Cute-Hell zones, strict jump physics constraints, and
 * a mathematical reachability validation rule to prevent impossible jumps.
 */

const TILE_SIZE = 32;

class LevelManager {
    static getLevelName(levelNumber) {
        const fixedNames = {
            1: "Nivel 1: El Despertar Kawaii",
            2: "Nivel 2: Pesadilla Pastel 🎀",
            3: "Nivel 3: El Averno de Kitty",
            4: "Nivel 4: ¡Hola Shelzy XD!",
            5: "Nivel 5: Zona Prohibida para Frikis"
        };
        if (fixedNames[levelNumber]) return fixedNames[levelNumber];

        const prefixes = [
            "La Furia de", "El Laberinto de", "El Caos Secreto de",
            "La Dimensión Bizarra de", "El Apocalipsis Rosita de",
            "La Venganza Pastel de", "El Desafío Friki de", "El Reino Oculto de"
        ];
        const themes = [
            "Kitty Shelzy", "Los Cupcakes Malditos", "El Lazo Diabólico",
            "Los Frikis del Malvavisco", "La Reina Shelzy", "Las Sombras Kawaii",
            "Los Diablillos Glaseados", "El Azúcar Infernal"
        ];
        const suffixes = ["😈", "✨", "(Modo Pro)", "XD", "🔥", "🎀", "3000", "Infinito"];

        const p = prefixes[(levelNumber * 3) % prefixes.length];
        const t = themes[(levelNumber * 7) % themes.length];
        const s = suffixes[(levelNumber * 5) % suffixes.length];
        return `Nivel ${levelNumber}: ${p} ${t} ${s}`;
    }

    static getLevel(levelNumber = 1) {
        let level;
        if (levelNumber <= 1) {
            level = LevelManager.getLevel1();
        } else {
            level = LevelManager.generateProceduralLevel(levelNumber);
        }

        // Apply strict horizontal distance validation rule
        LevelManager.validateAndFixLevelReachability(level);

        return level;
    }

    static getLevel1() {
        return {
            levelNumber: 1,
            name: "Nivel 1: El Despertar Kawaii",
            width: 4400,
            height: 540,
            spawn: { x: 80, y: 350 },
            goal: { x: 4220, y: 320, width: 40, height: 120 },

            checkpoints: [
                { id: 'cp_0', x: 80, y: 396, width: 32, height: 44, reached: true, name: 'Pradera Inicial' },
                { id: 'cp_1', x: 1340, y: 396, width: 32, height: 44, reached: false, name: 'Paso del Arcoíris' },
                { id: 'cp_2', x: 2300, y: 396, width: 32, height: 44, reached: false, name: 'Fortaleza del Averno' },
                { id: 'cp_3', x: 3760, y: 396, width: 32, height: 44, reached: false, name: 'Santuario Dorado' }
            ],

            zones: [
                { startX: 0, endX: 1750, mode: 'cute', name: 'Pradera Algodón de Azúcar' },
                { startX: 1750, endX: 3550, mode: 'hell', name: 'El Averno de Caramelo Quemado' },
                { startX: 3550, endX: 4400, mode: 'cute', name: 'Santuario del Lazo Dorado' }
            ],

            platforms: [
                // Zona 1: Pradera Kawaii (0 a 1750px) - Todas sólidas en ambas dimensiones
                { x: 0, y: 440, width: 680, height: 100, type: 'ground', dimension: 'both' },
                { x: 250, y: 340, width: 32, height: 32, type: 'block', dimension: 'both' },
                { x: 282, y: 340, width: 32, height: 32, type: 'item_box', content: 'cupcake', dimension: 'both' },
                { x: 314, y: 340, width: 32, height: 32, type: 'block', dimension: 'both' },
                { x: 346, y: 340, width: 32, height: 32, type: 'item_box', content: 'cupcake', dimension: 'both' },
                { x: 480, y: 376, width: 48, height: 64, type: 'pipe', dimension: 'both' },

                // Plataformas sólidas estables (dimension: 'both')
                { x: 740, y: 440, width: 320, height: 100, type: 'ground', dimension: 'both' },
                { x: 840, y: 310, width: 90, height: 24, type: 'block', dimension: 'both' },
                { x: 970, y: 240, width: 80, height: 24, type: 'block', dimension: 'both' },

                // Plataforma deslizante/móvil horizontal para cruzar el abismo
                { x: 1120, y: 410, width: 85, height: 22, type: 'moving_h', isMoving: true, minX: 1090, maxX: 1240, vx: 1.2, originX: 1120, dimension: 'both' },

                // Isla de Checkpoint 1
                { x: 1280, y: 440, width: 360, height: 100, type: 'ground', dimension: 'both' },
                { x: 1390, y: 340, width: 80, height: 28, type: 'block', dimension: 'both' },
                { x: 1510, y: 340, width: 64, height: 28, type: 'item_box', content: 'cupcake', dimension: 'both' },

                // Escalera de ascenso hacia el umbral del Averno
                { x: 1680, y: 390, width: 70, height: 50, type: 'ground', dimension: 'both' },
                { x: 1780, y: 340, width: 80, height: 100, type: 'ground', dimension: 'both' },

                // Zona 2: El Averno de Kitty (1750 a 3550px)
                // Plataformas sólidas estables que NO desaparecen ni caen al cambiar dimensión
                { x: 1890, y: 340, width: 75, height: 24, type: 'block', dimension: 'both' },
                { x: 2010, y: 290, width: 85, height: 24, type: 'block', dimension: 'both' },
                { x: 2140, y: 240, width: 85, height: 24, type: 'block', dimension: 'both' },

                // Fortaleza Averno con Checkpoint 2
                { x: 2260, y: 440, width: 380, height: 100, type: 'ground', dimension: 'both' },
                { x: 2360, y: 350, width: 70, height: 28, type: 'block', dimension: 'both' },
                { x: 2470, y: 300, width: 70, height: 28, type: 'item_box', content: 'crystal', dimension: 'both' },

                // Plataforma deslizante/móvil vertical en el Averno
                { x: 2680, y: 360, width: 80, height: 22, type: 'moving_v', isMoving: true, minY: 250, maxY: 380, vy: -1.0, originY: 360, dimension: 'both' },

                // Puente sólido estable de bloques de obsidiana
                { x: 2800, y: 300, width: 75, height: 24, type: 'block', dimension: 'both' },
                { x: 2920, y: 300, width: 75, height: 24, type: 'block', dimension: 'both' },
                { x: 3040, y: 330, width: 80, height: 24, type: 'block', dimension: 'both' },

                // Bastión final del Averno
                { x: 3170, y: 440, width: 340, height: 100, type: 'ground', dimension: 'both' },
                { x: 3260, y: 350, width: 64, height: 32, type: 'block', dimension: 'both' },
                { x: 3380, y: 300, width: 80, height: 32, type: 'item_box', content: 'crystal', dimension: 'both' },

                // Zona 3: Santuario del Lazo Dorado (3550 a 4400px)
                // Plataforma deslizante/móvil horizontal para cruzar el gran abismo hacia la luz
                { x: 3550, y: 390, width: 80, height: 22, type: 'moving_h', isMoving: true, minX: 3530, maxX: 3680, vx: 1.1, originX: 3550, dimension: 'both' },

                // Gran explanada final con Checkpoint 3
                { x: 3710, y: 440, width: 690, height: 100, type: 'ground', dimension: 'both' },

                // Torres flotantes sólidas y estables antes de la meta
                { x: 3880, y: 340, width: 80, height: 24, type: 'block', dimension: 'both' },
                { x: 3990, y: 270, width: 80, height: 24, type: 'block', dimension: 'both' },
                { x: 4100, y: 220, width: 90, height: 24, type: 'item_box', content: 'cupcake', dimension: 'both' }
            ],

            collectibles: [
                { x: 286, y: 290, width: 24, height: 24, collected: false },
                { x: 350, y: 290, width: 24, height: 24, collected: false },
                { x: 600, y: 400, width: 24, height: 24, collected: false },
                { x: 880, y: 260, width: 24, height: 24, collected: false },
                { x: 1000, y: 190, width: 24, height: 24, collected: false },
                { x: 1420, y: 290, width: 24, height: 24, collected: false },
                { x: 1530, y: 290, width: 24, height: 24, collected: false },
                { x: 2040, y: 240, width: 24, height: 24, collected: false },
                { x: 2170, y: 190, width: 24, height: 24, collected: false },
                { x: 2490, y: 250, width: 24, height: 24, collected: false },
                { x: 2940, y: 250, width: 24, height: 24, collected: false },
                { x: 3060, y: 280, width: 24, height: 24, collected: false },
                { x: 3400, y: 250, width: 24, height: 24, collected: false },
                { x: 3910, y: 290, width: 24, height: 24, collected: false },
                { x: 4020, y: 220, width: 24, height: 24, collected: false },
                { x: 4130, y: 170, width: 24, height: 24, collected: false }
            ],

            enemies: [
                // Enemigo 1: Estilo PAC-MAN patrullando zona kawaii con boca animada
                { type: 'pacman', x: 520, y: 412, width: 28, height: 28, minX: 420, maxX: 640, baseSpeed: 1.3, vx: 1.3, alive: true, isChasing: false },
                
                // Enemigo 2: Chibi slime tradicional
                { x: 900, y: 412, width: 28, height: 26, minX: 780, maxX: 1020, baseSpeed: 1.2, vx: -1.2, alive: true, isChasing: false },

                // Enemigo 3: Slime en Checkpoint 1
                { x: 1450, y: 412, width: 28, height: 26, minX: 1370, maxX: 1580, baseSpeed: 1.2, vx: 1.2, alive: true, isChasing: false },

                // Enemigo 4: Estilo PAC-MAN Demoniaco en el Averno (orientado y con dientes/llamas)
                { type: 'pacman', x: 2140, y: 212, width: 28, height: 28, minX: 2140, maxX: 2220, baseSpeed: 1.6, vx: 1.6, alive: true, isChasing: false },

                // Enemigo 5: Imp murciélago de fuego
                { x: 2450, y: 412, width: 28, height: 26, minX: 2350, maxX: 2600, baseSpeed: 1.8, vx: 1.8, alive: true, isChasing: false },

                // Enemigo 6: Estilo PAC-MAN Cazador voraz en plataformas flotantes
                { type: 'pacman', x: 3040, y: 302, width: 28, height: 28, minX: 3040, maxX: 3120, baseSpeed: 1.8, vx: -1.8, alive: true, isChasing: false },

                // Enemigo 7: Imp en el bastión del averno
                { x: 3260, y: 412, width: 28, height: 26, minX: 3190, maxX: 3480, baseSpeed: 1.7, vx: 1.7, alive: true, isChasing: false },

                // Enemigo 8: Estilo PAC-MAN Kawaii celebrando cerca de la meta
                { type: 'pacman', x: 3820, y: 412, width: 28, height: 28, minX: 3740, maxX: 3950, baseSpeed: 1.3, vx: 1.3, alive: true, isChasing: false }
            ]
        };
    }

    /**
     * Procedural Level Generator for Level 2 and beyond.
     * Generates strictly sequential platforms ensuring that gaps NEVER exceed
     * Kitty's jump physics limits.
     */
    static generateProceduralLevel(levelNumber) {
        let seed = levelNumber * 7919 + 104729;
        const rng = () => {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };

        const totalWidth = 4400 + Math.min(2000, (levelNumber - 1) * 400);
        const zone1End = Math.floor(totalWidth * 0.36);
        const zone2End = Math.floor(totalWidth * 0.80);

        const levelName = LevelManager.getLevelName(levelNumber);

        const platforms = [];
        const collectibles = [];
        const enemies = [];
        const checkpoints = [];

        // Checkpoint target locations
        const cp1Target = Math.floor(zone1End - 200);
        const cp2Target = Math.floor((zone1End + zone2End) / 2);
        const cp3Target = Math.floor(zone2End + 80);

        // CP0 is always at start
        checkpoints.push({ id: 'cp_0', x: 80, y: 396, width: 32, height: 44, reached: true, name: 'Zona de Inicio' });

        // Initial starting platform
        platforms.push({ x: 0, y: 440, width: 550, height: 100, type: 'ground' });

        let currentRight = 550; // tracks the exact right edge of the last placed platform
        let lastHeight = 440;
        const enemyBaseSpeed = 1.2 + Math.min(0.9, (levelNumber - 1) * 0.1);

        let cp1Placed = false;
        let cp2Placed = false;
        let cp3Placed = false;

        while (currentRight < totalWidth - 850) {
            const inHell = currentRight >= zone1End && currentRight < zone2End;

            // Check if we should place a checkpoint seamlessly into the sequence
            if (!cp1Placed && currentRight >= cp1Target) {
                const gap = 55 + Math.floor(rng() * 25); // 55 - 80 px (safe jump)
                const startX = currentRight + gap;
                const groundW = 240;
                platforms.push({ x: startX, y: 440, width: groundW, height: 100, type: 'ground' });
                checkpoints.push({ id: 'cp_1', x: startX + 70, y: 396, width: 32, height: 44, reached: false, name: 'Frontera de la Pesadilla' });
                currentRight = startX + groundW;
                lastHeight = 440;
                cp1Placed = true;
                continue;
            }

            if (!cp2Placed && currentRight >= cp2Target) {
                const gap = 55 + Math.floor(rng() * 25);
                const startX = currentRight + gap;
                const groundW = 240;
                platforms.push({ x: startX, y: 440, width: groundW, height: 100, type: 'ground' });
                checkpoints.push({ id: 'cp_2', x: startX + 70, y: 406, width: 32, height: 44, reached: false, name: 'Paso del Averno' });
                currentRight = startX + groundW;
                lastHeight = 440;
                cp2Placed = true;
                continue;
            }

            if (!cp3Placed && currentRight >= cp3Target) {
                const gap = 55 + Math.floor(rng() * 25);
                const startX = currentRight + gap;
                const groundW = 240;
                platforms.push({ x: startX, y: 440, width: groundW, height: 100, type: 'ground' });
                checkpoints.push({ id: 'cp_3', x: startX + 70, y: 396, width: 32, height: 44, reached: false, name: 'Entrada al Santuario' });
                currentRight = startX + groundW;
                lastHeight = 440;
                cp3Placed = true;
                continue;
            }

            // Normal chunk generation with 6 diverse structure patterns:
            // Safe gap based on Kitty's jump: strictly between 50 and 80 pixels!
            const gap = 50 + Math.floor(rng() * 32); // 50 to 82 px max!
            const startX = currentRight + gap;
            const pattern = Math.floor(rng() * 6);

            if (pattern === 0) {
                // Pattern 0: Solid ground with pipe or mystery box
                const groundW = 240 + Math.floor(rng() * 180);
                platforms.push({ x: startX, y: 440, width: groundW, height: 100, type: 'ground' });

                // Floating item box
                const boxX = startX + Math.floor(groundW / 2) - 16;
                platforms.push({
                    x: boxX,
                    y: 340,
                    width: 32,
                    height: 32,
                    type: 'item_box',
                    content: inHell ? 'crystal' : 'cupcake'
                });
                collectibles.push({ x: boxX + 4, y: 290, width: 24, height: 24, collected: false });

                // Enemy patrol (50% chance Pac-Man)
                if (groundW >= 220) {
                    const isPacman = rng() > 0.45;
                    enemies.push({
                        type: isPacman ? 'pacman' : 'slime',
                        x: startX + 40,
                        y: 412,
                        width: 28,
                        height: isPacman ? 28 : 26,
                        minX: startX + 15,
                        maxX: startX + groundW - 30,
                        baseSpeed: inHell ? 1.7 : 1.2,
                        vx: inHell ? 1.7 : 1.2,
                        alive: true,
                        isChasing: false
                    });
                }

                currentRight = startX + groundW;
                lastHeight = 440;

            } else if (pattern === 1) {
                // Pattern 1: Secuencia de bloques sólidos estables a través del abismo (dimension: both)
                let stepX = startX;
                const stepCount = inHell ? 3 : 2;

                for (let s = 0; s < stepCount; s++) {
                    const stepW = 80 + Math.floor(rng() * 20); // 80 - 100px width
                    const stepY = 350 + Math.floor(rng() * 40);

                    platforms.push({
                        x: stepX,
                        y: stepY,
                        width: stepW,
                        height: 24,
                        type: 'block',
                        dimension: 'both'
                    });

                    collectibles.push({
                        x: stepX + Math.floor(stepW / 2) - 12,
                        y: stepY - 30,
                        width: 24,
                        height: 24,
                        collected: false
                    });

                    // Next step gap: strictly 50 to 75px
                    stepX += stepW + (50 + Math.floor(rng() * 25));
                }

                currentRight = stepX;
                lastHeight = 360;

            } else if (pattern === 2) {
                // Pattern 2: Puente elevado de bloques con suelo y patrullero Pac-Man
                const groundW = 280 + Math.floor(rng() * 140);
                platforms.push({ x: startX, y: 440, width: groundW, height: 100, type: 'ground', dimension: 'both' });

                // Bloque elevado sólido
                platforms.push({
                    x: startX + 90,
                    y: 330,
                    width: 70,
                    height: 26,
                    type: 'block',
                    dimension: 'both'
                });

                collectibles.push({ x: startX + 115, y: 285, width: 24, height: 24, collected: false });

                // Enemy on ground below: Pac-Man chaser
                enemies.push({
                    type: 'pacman',
                    x: startX + 30,
                    y: 412,
                    width: 28,
                    height: 28,
                    minX: startX + 10,
                    maxX: startX + groundW - 30,
                    baseSpeed: inHell ? 1.7 : 1.2,
                    vx: -(inHell ? 1.7 : 1.2),
                    alive: true,
                    isChasing: false
                });

                currentRight = startX + groundW;
                lastHeight = 440;

            } else if (pattern === 3) {
                // Pattern 3: Plataforma móvil/deslizante para cruzar el abismo (isMoving: true)
                const isVertical = rng() > 0.6;
                const platW = 80;
                if (isVertical) {
                    platforms.push({
                        x: startX,
                        y: 360,
                        width: platW,
                        height: 22,
                        type: 'moving_v',
                        isMoving: true,
                        minY: 270,
                        maxY: 390,
                        vy: -1.0,
                        originY: 360,
                        dimension: 'both'
                    });
                } else {
                    platforms.push({
                        x: startX,
                        y: 390,
                        width: platW,
                        height: 22,
                        type: 'moving_h',
                        isMoving: true,
                        minX: startX - 20,
                        maxX: startX + 110,
                        vx: 1.1,
                        originX: startX,
                        dimension: 'both'
                    });
                }

                collectibles.push({
                    x: startX + Math.floor(platW / 2) - 12,
                    y: 320,
                    width: 24,
                    height: 24,
                    collected: false
                });

                currentRight = startX + platW + (isVertical ? 0 : 80);
                lastHeight = 370;

            } else if (pattern === 4) {
                // Pattern 4: Bloques flotantes sólidos dobles estables (dimension: both)
                const platW = 75;
                platforms.push({
                    x: startX,
                    y: 360,
                    width: platW,
                    height: 24,
                    type: 'block',
                    dimension: 'both'
                });

                const nextX = startX + platW + (55 + Math.floor(rng() * 20));
                platforms.push({
                    x: nextX,
                    y: 360,
                    width: platW,
                    height: 24,
                    type: 'block',
                    dimension: 'both'
                });

                collectibles.push(
                    { x: startX + 25, y: 310, width: 24, height: 24, collected: false },
                    { x: nextX + 25, y: 310, width: 24, height: 24, collected: false }
                );

                currentRight = nextX + platW;
                lastHeight = 360;

            } else {
                // Pattern 5: Plataforma escalonada sólida de bloques estables
                const platW = 90 + Math.floor(rng() * 25);
                const platY = inHell ? 340 : 360;

                platforms.push({
                    x: startX,
                    y: platY,
                    width: platW,
                    height: 24,
                    type: 'block',
                    dimension: 'both'
                });

                collectibles.push({
                    x: startX + Math.floor(platW / 2) - 12,
                    y: platY - 30,
                    width: 24,
                    height: 24,
                    collected: false
                });

                // Pac-Man guarding the platform
                enemies.push({
                    type: 'pacman',
                    x: startX + 10,
                    y: platY - 28,
                    width: 28,
                    height: 28,
                    minX: startX,
                    maxX: startX + platW,
                    baseSpeed: inHell ? 1.6 : 1.2,
                    vx: inHell ? 1.6 : -1.2,
                    alive: true,
                    isChasing: false
                });

                currentRight = startX + platW;
                lastHeight = platY;
            }
        }

        // Final Sanctuary Platform & Goal
        const sanctuaryGap = 55 + Math.floor(rng() * 25);
        const sanctuaryX = currentRight + sanctuaryGap;
        const sanctuaryW = totalWidth - sanctuaryX;

        platforms.push({ x: sanctuaryX, y: 440, width: Math.max(800, sanctuaryW), height: 100, type: 'ground' });
        platforms.push({ x: sanctuaryX + 150, y: 360, width: 64, height: 32, type: 'block' });
        platforms.push({ x: sanctuaryX + 280, y: 300, width: 80, height: 32, type: 'item_box', content: 'cupcake' });

        collectibles.push(
            { x: sanctuaryX + 170, y: 310, width: 24, height: 24, collected: false },
            { x: sanctuaryX + 310, y: 250, width: 24, height: 24, collected: false }
        );

        return {
            levelNumber,
            name: levelName,
            width: totalWidth,
            height: 540,
            spawn: { x: 80, y: 350 },
            goal: { x: totalWidth - 250, y: 320, width: 40, height: 120 },
            checkpoints,
            zones: [
                { startX: 0, endX: zone1End, mode: 'cute', name: 'Pradera Glaseada' },
                { startX: zone1End, endX: zone2End, mode: 'hell', name: 'Averno de Lava y Azúcar' },
                { startX: zone2End, endX: totalWidth, mode: 'cute', name: 'Santuario del Lazo Rosa' }
            ],
            platforms,
            collectibles,
            enemies
        };
    }

    /**
     * Maximum Horizontal Distance Validation & Auto-Correction Rule.
     * Evaluates every consecutive platform gap across the level based on
     * Kitty's jump physics (Jump force: -12.5, Gravity: 0.65, Speed: 4.8).
     * If any horizontal gap exceeds the maximum playable limit, it automatically
     * inserts stepping stone bridge platforms to guarantee 100% reachability.
     */
    static validateAndFixLevelReachability(level) {
        if (!level || !level.platforms || level.platforms.length < 2) return 0;

        // Sort all platforms horizontally by x
        level.platforms.sort((a, b) => a.x - b.x);

        // Constants based on Kitty's Jump Physics:
        // Theoretical max flight distance at speed 4.8 is 184px.
        // We enforce safe, responsive thresholds for mobile controls:
        const MAX_SAFE_GAP_LEVEL = 90;   // Same height jump
        const MAX_SAFE_GAP_UP = 70;      // Upward jump (dest higher than source by > 25px)
        const MAX_SAFE_GAP_DOWN = 100;   // Downward jump

        let fixedCount = 0;
        let i = 0;

        while (i < level.platforms.length - 1) {
            const current = level.platforms[i];
            const next = level.platforms[i + 1];

            const currentRight = current.x + current.width;
            const nextLeft = next.x;
            const gap = nextLeft - currentRight;

            // If platforms overlap horizontally, no horizontal gap issue
            if (gap <= 0) {
                i++;
                continue;
            }

            const deltaY = next.y - current.y; // < 0 means next is higher
            let maxAllowed = MAX_SAFE_GAP_LEVEL;

            if (deltaY < -25) {
                maxAllowed = MAX_SAFE_GAP_UP;
            } else if (deltaY > 25) {
                maxAllowed = MAX_SAFE_GAP_DOWN;
            }

            // If the gap exceeds the safe playable limit, insert a bridging platform
            if (gap > maxAllowed) {
                const bridgeW = Math.min(80, Math.max(64, Math.floor(gap * 0.45)));
                const bridgeX = Math.floor(currentRight + (gap - bridgeW) / 2);

                // Safe intermediate height
                let bridgeY = Math.floor((current.y + next.y) / 2);
                if (bridgeY > 440) bridgeY = 440;
                if (bridgeY < 320) bridgeY = 320;

                const bridgePlatform = {
                    x: bridgeX,
                    y: bridgeY,
                    width: bridgeW,
                    height: 24,
                    type: 'block',
                    isBridge: true
                };

                // Insert bridge platform into array
                level.platforms.splice(i + 1, 0, bridgePlatform);
                fixedCount++;
                // Re-evaluate from current platform to ensure current -> bridge and bridge -> next are both valid
            } else {
                i++;
            }
        }

        return fixedCount;
    }
}

window.LevelManager = LevelManager;
