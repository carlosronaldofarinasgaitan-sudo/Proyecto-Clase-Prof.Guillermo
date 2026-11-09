/**
 * Renderer for Hello Kitty, Environment, Blocks, Particles and Effects.
 * Procedural vector canvas rendering ensures 100% asset independence.
 */

class KittyRenderer {
    /**
     * Draws Hello Kitty with dynamic wardrobe items and animations.
     */
    static drawKitty(ctx, x, y, scale = 1, facing = 1, state = 'idle', animTime = 0, wardrobe = null) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(facing * scale, scale);

        const fur = wardrobe?.fur || { color: '#FFFFFF', innerEar: '#FFB6C1', outline: '#2b2b2b' };
        const headwear = wardrobe?.head || { type: 'bow', color: '#FF1744' };
        const outfit = wardrobe?.outfit || { type: 'overalls', mainColor: '#1E88E5', subColor: '#FDD835' };
        const accessory = wardrobe?.accessory || { type: 'none' };

        // Walk/jump offsets
        let legOffset1 = 0;
        let legOffset2 = 0;
        let armAngle = 0;
        let bodyBob = 0;

        if (state === 'walk') {
            legOffset1 = Math.sin(animTime * 12) * 6;
            legOffset2 = -Math.sin(animTime * 12) * 6;
            armAngle = Math.sin(animTime * 12) * 0.35;
            bodyBob = Math.abs(Math.sin(animTime * 12)) * 3;
        } else if (state === 'jump') {
            legOffset1 = -3;
            legOffset2 = -3;
            armAngle = -0.5;
            bodyBob = -2;
        } else {
            // Idle breathing
            bodyBob = Math.sin(animTime * 3) * 1.5;
        }

        // --- BACK ACCESSORIES (e.g. Wings) ---
        if (accessory.type === 'demon_wings') {
            KittyRenderer.drawDemonWings(ctx, -6, 8 - bodyBob, animTime);
        } else if (accessory.type === 'angel_wings') {
            KittyRenderer.drawAngelWings(ctx, -6, 8 - bodyBob, animTime);
        } else if (accessory.type === 'fairy_wings') {
            KittyRenderer.drawFairyWings(ctx, -6, 8 - bodyBob, animTime);
        }

        // --- LEGS & FEET ---
        ctx.fillStyle = fur.color;
        ctx.strokeStyle = fur.outline;
        ctx.lineWidth = 2.5;

        // Back foot
        ctx.beginPath();
        ctx.ellipse(-7, 26 + legOffset2 - bodyBob, 6, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Front foot
        ctx.beginPath();
        ctx.ellipse(7, 26 + legOffset1 - bodyBob, 6, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // --- BODY & OUTFIT ---
        KittyRenderer.drawOutfit(ctx, 0, 10 - bodyBob, outfit, fur, animTime);

        // --- HEAD ---
        const headY = -14 - bodyBob;
        KittyRenderer.drawHead(ctx, 0, headY, fur);

        // --- HEADWEAR ---
        KittyRenderer.drawHeadwear(ctx, 0, headY, headwear, animTime);

        // --- HANDS & HELD ACCESSORY ---
        // Back hand
        ctx.fillStyle = fur.color;
        ctx.strokeStyle = fur.outline;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(-14, 12 - bodyBob - armAngle * 10, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Front hand (holding accessory)
        const frontHandX = 14;
        const frontHandY = 12 - bodyBob + armAngle * 10;
        ctx.beginPath();
        ctx.arc(frontHandX, frontHandY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Draw held item
        if (accessory.type !== 'none' && accessory.type !== 'demon_wings' && accessory.type !== 'angel_wings') {
            KittyRenderer.drawHeldItem(ctx, frontHandX + 2, frontHandY, accessory, animTime);
        }

        ctx.restore();
    }

    /**
     * Draws Hello Kitty's iconic head, ears, eyes, nose, and whiskers.
     */
    static drawHead(ctx, x, y, fur) {
        ctx.save();
        ctx.translate(x, y);

        ctx.fillStyle = fur.color;
        ctx.strokeStyle = fur.outline;
        ctx.lineWidth = 2.6;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        // Ears
        // Left Ear
        ctx.beginPath();
        ctx.moveTo(-20, -10);
        ctx.quadraticCurveTo(-26, -26, -18, -26);
        ctx.quadraticCurveTo(-10, -22, -8, -12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Left Inner Ear
        ctx.fillStyle = fur.innerEar;
        ctx.beginPath();
        ctx.moveTo(-18, -12);
        ctx.quadraticCurveTo(-22, -22, -17, -22);
        ctx.quadraticCurveTo(-12, -18, -11, -13);
        ctx.closePath();
        ctx.fill();

        // Right Ear
        ctx.fillStyle = fur.color;
        ctx.beginPath();
        ctx.moveTo(8, -12);
        ctx.quadraticCurveTo(10, -22, 18, -26);
        ctx.quadraticCurveTo(26, -26, 20, -10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Right Inner Ear
        ctx.fillStyle = fur.innerEar;
        ctx.beginPath();
        ctx.moveTo(11, -13);
        ctx.quadraticCurveTo(12, -18, 17, -22);
        ctx.quadraticCurveTo(22, -22, 18, -12);
        ctx.closePath();
        ctx.fill();

        // Head Oval (Classic Hello Kitty proportions: wide, slightly flattened oval)
        ctx.fillStyle = fur.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, 24, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Eyes (Two glossy vertical black ovals)
        ctx.fillStyle = '#1A1A1A';
        ctx.beginPath();
        ctx.ellipse(-10, 1, 2.6, 3.8, 0, 0, Math.PI * 2);
        ctx.ellipse(10, 1, 2.6, 3.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye highlights
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-11, 0, 1, 0, Math.PI * 2);
        ctx.arc(9, 0, 1, 0, Math.PI * 2);
        ctx.fill();

        // Nose (Cute yellow oval horizontally placed)
        ctx.fillStyle = '#FFEB3B';
        ctx.strokeStyle = '#D4A017';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(0, 4, 3, 2.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Whiskers (3 on each side)
        ctx.strokeStyle = fur.outline;
        ctx.lineWidth = 2;

        // Left whiskers
        ctx.beginPath();
        ctx.moveTo(-17, 0); ctx.lineTo(-27, -2);
        ctx.moveTo(-18, 4); ctx.lineTo(-28, 4);
        ctx.moveTo(-17, 8); ctx.lineTo(-26, 10);

        // Right whiskers
        ctx.moveTo(17, 0); ctx.lineTo(27, -2);
        ctx.moveTo(18, 4); ctx.lineTo(28, 4);
        ctx.moveTo(17, 8); ctx.lineTo(26, 10);
        ctx.stroke();

        ctx.restore();
    }

    /**
     * Draws Headwear (Bow, Horns, Halo, Witch Hat, Crown, etc.)
     */
    static drawHeadwear(ctx, x, y, headwear, animTime = 0) {
        ctx.save();
        ctx.translate(x, y);

        switch (headwear.type) {
            case 'bow': // Classic Hello Kitty Bow (top right ear)
                ctx.translate(14, -16);
                ctx.fillStyle = headwear.color || '#FF1744';
                ctx.strokeStyle = '#8E0000';
                ctx.lineWidth = 2;

                // Left loop
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(-10, -8, -10, 8, 0, 0);
                ctx.fill(); ctx.stroke();

                // Right loop
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(10, -8, 10, 8, 0, 0);
                ctx.fill(); ctx.stroke();

                // Center knot
                ctx.beginPath();
                ctx.ellipse(0, 0, 4, 4, 0, 0, Math.PI * 2);
                ctx.fill(); ctx.stroke();
                break;

            case 'horns': // Demon Horns
                ctx.fillStyle = '#D50000';
                ctx.strokeStyle = '#4A0000';
                ctx.lineWidth = 2;

                // Left Horn
                ctx.beginPath();
                ctx.moveTo(-14, -18);
                ctx.quadraticCurveTo(-22, -32, -18, -34);
                ctx.quadraticCurveTo(-14, -28, -8, -18);
                ctx.closePath();
                ctx.fill(); ctx.stroke();

                // Right Horn
                ctx.beginPath();
                ctx.moveTo(8, -18);
                ctx.quadraticCurveTo(14, -28, 18, -34);
                ctx.quadraticCurveTo(22, -32, 14, -18);
                ctx.closePath();
                ctx.fill(); ctx.stroke();
                break;

            case 'halo': // Glowing Angel Halo
                const floatY = -28 + Math.sin(animTime * 4) * 2;
                ctx.strokeStyle = '#FFD700';
                ctx.shadowColor = '#FFF59D';
                ctx.shadowBlur = 8;
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.ellipse(0, floatY, 18, 5, 0, 0, Math.PI * 2);
                ctx.stroke();
                break;

            case 'witch': // Spooky Witch Hat
                ctx.translate(0, -16);
                // Rim
                ctx.fillStyle = '#311B92';
                ctx.strokeStyle = '#1A0B4B';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.ellipse(0, 0, 26, 7, 0, 0, Math.PI * 2);
                ctx.fill(); ctx.stroke();

                // Cone
                ctx.beginPath();
                ctx.moveTo(-16, -2);
                ctx.quadraticCurveTo(-6, -26, 12, -28);
                ctx.lineTo(8, -26);
                ctx.quadraticCurveTo(4, -14, 16, -2);
                ctx.closePath();
                ctx.fill(); ctx.stroke();

                // Gold star buckle
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(0, -4, 3, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'crown': // Gold Princess Crown
                ctx.translate(0, -20);
                ctx.fillStyle = '#FFC107';
                ctx.strokeStyle = '#B78103';
                ctx.lineWidth = 1.8;
                ctx.beginPath();
                ctx.moveTo(-12, 2);
                ctx.lineTo(-14, -10);
                ctx.lineTo(-6, -5);
                ctx.lineTo(0, -12);
                ctx.lineTo(6, -5);
                ctx.lineTo(14, -10);
                ctx.lineTo(12, 2);
                ctx.closePath();
                ctx.fill(); ctx.stroke();

                // Ruby gem in center
                ctx.fillStyle = '#E91E63';
                ctx.beginPath();
                ctx.arc(0, -4, 2.5, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'strawberry': // Strawberry Clip
                ctx.translate(14, -16);
                ctx.fillStyle = '#FF1744';
                ctx.strokeStyle = '#8E0000';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(0, -6);
                ctx.quadraticCurveTo(8, -6, 7, 4);
                ctx.lineTo(0, 9);
                ctx.lineTo(-7, 4);
                ctx.quadraticCurveTo(-8, -6, 0, -6);
                ctx.fill(); ctx.stroke();

                // Green leaf
                ctx.fillStyle = '#4CAF50';
                ctx.beginPath();
                ctx.ellipse(0, -7, 4, 2, 0, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'chef': // Baker Chef Hat
                ctx.translate(0, -18);
                ctx.fillStyle = '#FFFFFF';
                ctx.strokeStyle = '#9E9E9E';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.rect(-12, -2, 24, 6);
                ctx.fill(); ctx.stroke();
                ctx.beginPath();
                ctx.arc(-8, -8, 8, 0, Math.PI * 2);
                ctx.arc(0, -12, 10, 0, Math.PI * 2);
                ctx.arc(8, -8, 8, 0, Math.PI * 2);
                ctx.fill(); ctx.stroke();
                break;

            case 'gamer_headset': // RGB Gamer Headset with cat ears
                ctx.translate(0, -14);
                ctx.strokeStyle = '#212121';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(0, 4, 23, Math.PI * 0.9, Math.PI * 0.1);
                ctx.stroke();

                // Ear cups
                ctx.fillStyle = '#E91E63';
                ctx.beginPath();
                ctx.ellipse(-23, 6, 5, 8, 0, 0, Math.PI * 2);
                ctx.ellipse(23, 6, 5, 8, 0, 0, Math.PI * 2);
                ctx.fill();

                // RGB Neon lights
                ctx.fillStyle = '#00E5FF';
                ctx.shadowColor = '#00E5FF';
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.arc(-23, 6, 2.5, 0, Math.PI * 2);
                ctx.arc(23, 6, 2.5, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'bunny_ears': // Kawaii Long Bunny Ears
                ctx.translate(0, -18);
                ctx.fillStyle = '#FFFFFF';
                ctx.strokeStyle = '#2b2b2b';
                ctx.lineWidth = 2;

                // Left ear
                ctx.beginPath();
                ctx.ellipse(-9, -15, 5, 15, -0.15, 0, Math.PI * 2);
                ctx.fill(); ctx.stroke();
                ctx.fillStyle = '#FF80AB';
                ctx.beginPath();
                ctx.ellipse(-9, -15, 2.5, 10, -0.15, 0, Math.PI * 2);
                ctx.fill();

                // Right ear (cute bend)
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.ellipse(9, -15, 5, 15, 0.2, 0, Math.PI * 2);
                ctx.fill(); ctx.stroke();
                ctx.fillStyle = '#FF80AB';
                ctx.beginPath();
                ctx.ellipse(9, -15, 2.5, 10, 0.2, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'pirate_hat': // Pirate Captain Hat
                ctx.translate(0, -18);
                ctx.fillStyle = '#212121';
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-22, 2);
                ctx.quadraticCurveTo(-14, -20, 0, -22);
                ctx.quadraticCurveTo(14, -20, 22, 2);
                ctx.closePath();
                ctx.fill(); ctx.stroke();

                // Tiny skull in center
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(0, -8, 3.5, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'party_hat': // Colorful Cone Party Hat
                ctx.translate(4, -18);
                ctx.fillStyle = '#FF4081';
                ctx.strokeStyle = '#F50057';
                ctx.lineWidth = 1.8;
                ctx.beginPath();
                ctx.moveTo(-10, 2);
                ctx.lineTo(6, -26);
                ctx.lineTo(12, 2);
                ctx.closePath();
                ctx.fill(); ctx.stroke();

                // Stripes
                ctx.strokeStyle = '#FFEB3B';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-4, -6); ctx.lineTo(9, -6);
                ctx.moveTo(-1, -15); ctx.lineTo(8, -15);
                ctx.stroke();

                // Top pom-pom
                ctx.fillStyle = '#00E5FF';
                ctx.beginPath();
                ctx.arc(6, -27, 4, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'neon_ribbon': // Giant Cyberpunk Ribbon
                ctx.translate(14, -16);
                ctx.fillStyle = '#00E5FF';
                ctx.strokeStyle = '#D500F9';
                ctx.lineWidth = 2.5;
                ctx.shadowColor = '#00E5FF';
                ctx.shadowBlur = 8;
                // Left loop
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(-14, -10, -14, 10, 0, 0);
                ctx.fill(); ctx.stroke();
                // Right loop
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(14, -10, 14, 10, 0, 0);
                ctx.fill(); ctx.stroke();
                // Core
                ctx.fillStyle = '#FF4081';
                ctx.beginPath();
                ctx.arc(0, 0, 5, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'goth_crown': // Gothic Spiked Crown
                ctx.translate(0, -20);
                ctx.fillStyle = '#1A1A1A';
                ctx.strokeStyle = '#7B1FA2';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-14, 2);
                ctx.lineTo(-16, -14);
                ctx.lineTo(-7, -6);
                ctx.lineTo(0, -18);
                ctx.lineTo(7, -6);
                ctx.lineTo(16, -14);
                ctx.lineTo(14, 2);
                ctx.closePath();
                ctx.fill(); ctx.stroke();

                // Amethyst Gem
                ctx.fillStyle = '#E040FB';
                ctx.beginPath();
                ctx.arc(0, -5, 3, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'beret': // French Chic Beret
                ctx.translate(2, -18);
                ctx.fillStyle = '#C2185B';
                ctx.strokeStyle = '#880E4F';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.ellipse(-2, 0, 22, 9, -0.15, 0, Math.PI * 2);
                ctx.fill(); ctx.stroke();
                // Small stem
                ctx.beginPath();
                ctx.moveTo(-2, -9);
                ctx.lineTo(-2, -13);
                ctx.stroke();
                break;
        }

        ctx.restore();
    }

    /**
     * Draws Hello Kitty's Clothing / Outfits.
     */
    static drawOutfit(ctx, x, y, outfit, fur, animTime) {
        ctx.save();
        ctx.translate(x, y);

        const outline = fur.outline || '#2b2b2b';
        ctx.strokeStyle = outline;
        ctx.lineWidth = 2.4;
        ctx.lineJoin = 'round';

        switch (outfit.type) {
            case 'overalls': // Classic Blue Overalls + Yellow T-Shirt
                // Yellow Shirt Body
                ctx.fillStyle = outfit.subColor || '#FDD835';
                ctx.beginPath();
                ctx.ellipse(0, 4, 15, 12, 0, 0, Math.PI * 2);
                ctx.fill(); ctx.stroke();

                // Blue Dungarees
                ctx.fillStyle = outfit.mainColor || '#1E88E5';
                ctx.beginPath();
                ctx.moveTo(-13, 6);
                ctx.lineTo(-13, 16);
                ctx.lineTo(13, 16);
                ctx.lineTo(13, 6);
                ctx.closePath();
                ctx.fill(); ctx.stroke();

                // Straps
                ctx.beginPath();
                ctx.rect(-10, -2, 4, 10);
                ctx.rect(6, -2, 4, 10);
                ctx.fill(); ctx.stroke();

                // Yellow Buttons
                ctx.fillStyle = '#FDD835';
                ctx.beginPath();
                ctx.arc(-8, 5, 2, 0, Math.PI * 2);
                ctx.arc(8, 5, 2, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'dress': // Pastel Kawaii Frilly Dress
                ctx.fillStyle = outfit.mainColor || '#FF69B4';
                ctx.beginPath();
                ctx.moveTo(-6, -1);
                ctx.lineTo(6, -1);
                ctx.lineTo(16, 16);
                ctx.lineTo(-16, 16);
                ctx.closePath();
                ctx.fill(); ctx.stroke();

                // White frills
                ctx.fillStyle = '#FFFFFF';
                for (let i = -14; i <= 14; i += 7) {
                    ctx.beginPath();
                    ctx.arc(i, 16, 3.5, 0, Math.PI);
                    ctx.fill(); ctx.stroke();
                }

                // Chest Heart
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(-2, 4, 2, 0, Math.PI * 2);
                ctx.arc(2, 4, 2, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'demon': // Infernal Robe
                ctx.fillStyle = outfit.mainColor || '#B71C1C';
                ctx.beginPath();
                ctx.moveTo(-8, -2);
                ctx.lineTo(8, -2);
                ctx.lineTo(17, 18);
                ctx.lineTo(10, 15);
                ctx.lineTo(0, 18);
                ctx.lineTo(-10, 15);
                ctx.lineTo(-17, 18);
                ctx.closePath();
                ctx.fill(); ctx.stroke();

                // Black collar & gold talisman
                ctx.fillStyle = '#212121';
                ctx.beginPath();
                ctx.moveTo(-10, -2); ctx.lineTo(0, 5); ctx.lineTo(10, -2);
                ctx.stroke();

                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(0, 6, 2.5, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'goth': // Gothic Lolita Dress
                ctx.fillStyle = outfit.mainColor || '#212121';
                ctx.beginPath();
                ctx.moveTo(-7, 0); ctx.lineTo(7, 0); ctx.lineTo(16, 17); ctx.lineTo(-16, 17);
                ctx.closePath();
                ctx.fill(); ctx.stroke();

                // Purple lacing
                ctx.strokeStyle = '#AB47BC';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(-5, 4); ctx.lineTo(5, 8);
                ctx.moveTo(5, 4); ctx.lineTo(-5, 8);
                ctx.moveTo(-5, 9); ctx.lineTo(5, 13);
                ctx.moveTo(5, 9); ctx.lineTo(-5, 13);
                ctx.stroke();
                break;

            case 'angel': // Celestial Gown
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.moveTo(-6, -1); ctx.lineTo(6, -1); ctx.lineTo(16, 17); ctx.lineTo(-16, 17);
                ctx.closePath();
                ctx.fill(); ctx.stroke();

                // Gold hem
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(-15, 14, 30, 3);
                break;

            case 'hero': // Heroine Bodysuit & Cape
                // Cape behind
                ctx.fillStyle = '#FF1744';
                ctx.beginPath();
                ctx.moveTo(-10, 0);
                ctx.quadraticCurveTo(-18 + Math.sin(animTime * 8) * 4, 10, -12, 19);
                ctx.lineTo(-4, 15);
                ctx.closePath();
                ctx.fill(); ctx.stroke();

                // Suit
                ctx.fillStyle = outfit.mainColor || '#E91E63';
                ctx.beginPath();
                ctx.ellipse(0, 6, 14, 10, 0, 0, Math.PI * 2);
                ctx.fill(); ctx.stroke();

                // Belt
                ctx.fillStyle = '#00E676';
                ctx.fillRect(-12, 8, 24, 4);
                break;

            case 'sakura_kimono': // Sakura Traditional Kimono
                ctx.fillStyle = '#F8BBD0';
                ctx.beginPath();
                ctx.moveTo(-7, 0);
                ctx.lineTo(7, 0);
                ctx.lineTo(16, 18);
                ctx.lineTo(-16, 18);
                ctx.closePath();
                ctx.fill(); ctx.stroke();

                // Wide Obi Belt
                ctx.fillStyle = '#D81B60';
                ctx.fillRect(-13, 6, 26, 6);
                ctx.strokeStyle = '#880E4F';
                ctx.strokeRect(-13, 6, 26, 6);

                // Sakura flower dot
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(0, 9, 2.5, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'astronaut': // Galactic Space Suit
                ctx.fillStyle = '#ECEFF1';
                ctx.beginPath();
                ctx.ellipse(0, 6, 16, 12, 0, 0, Math.PI * 2);
                ctx.fill(); ctx.stroke();

                // Cyan Visor / Chest Panel
                ctx.fillStyle = '#00E5FF';
                ctx.shadowColor = '#00E5FF';
                ctx.shadowBlur = 4;
                ctx.fillRect(-8, 2, 16, 8);

                // Space Badge
                ctx.fillStyle = '#FF5252';
                ctx.beginPath();
                ctx.arc(-4, -2, 2.5, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'dino_shelzy': // Dino Kigurumi
                ctx.fillStyle = '#76FF03';
                ctx.beginPath();
                ctx.ellipse(0, 6, 15, 12, 0, 0, Math.PI * 2);
                ctx.fill(); ctx.stroke();

                // Belly patch
                ctx.fillStyle = '#CCFF90';
                ctx.beginPath();
                ctx.ellipse(0, 6, 8, 8, 0, 0, Math.PI * 2);
                ctx.fill();

                // Dino dorsal plates
                ctx.fillStyle = '#FF3D00';
                ctx.beginPath();
                ctx.moveTo(-14, 2); ctx.lineTo(-18, 0); ctx.lineTo(-14, -2);
                ctx.moveTo(-15, 8); ctx.lineTo(-19, 6); ctx.lineTo(-15, 4);
                ctx.fill(); ctx.stroke();
                break;

            case 'vampire': // Vampire High Collar Robe
                // High collar back
                ctx.fillStyle = '#B71C1C';
                ctx.beginPath();
                ctx.moveTo(-14, 0); ctx.lineTo(-18, -10); ctx.lineTo(0, -4); ctx.lineTo(18, -10); ctx.lineTo(14, 0);
                ctx.closePath();
                ctx.fill(); ctx.stroke();

                // Black gown
                ctx.fillStyle = '#121212';
                ctx.beginPath();
                ctx.moveTo(-7, 0); ctx.lineTo(7, 0); ctx.lineTo(16, 18); ctx.lineTo(-16, 18);
                ctx.closePath();
                ctx.fill(); ctx.stroke();

                // Crimson gem
                ctx.fillStyle = '#FF1744';
                ctx.beginPath();
                ctx.arc(0, 5, 2.5, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'fitness': // Sporty Fitness Set
                // Top
                ctx.fillStyle = '#FF4081';
                ctx.beginPath();
                ctx.rect(-10, 0, 20, 8);
                ctx.fill(); ctx.stroke();

                // Shorts
                ctx.fillStyle = '#212121';
                ctx.beginPath();
                ctx.rect(-12, 9, 24, 8);
                ctx.fill(); ctx.stroke();
                break;

            case 'cyber_dress': // Cyberpunk Neon Dress
                ctx.fillStyle = '#100D28';
                ctx.beginPath();
                ctx.moveTo(-7, 0); ctx.lineTo(7, 0); ctx.lineTo(16, 17); ctx.lineTo(-16, 17);
                ctx.closePath();
                ctx.fill(); ctx.stroke();

                // Circuit lines
                ctx.strokeStyle = '#00E5FF';
                ctx.lineWidth = 1.5;
                ctx.shadowColor = '#00E5FF';
                ctx.shadowBlur = 4;
                ctx.beginPath();
                ctx.moveTo(-8, 4); ctx.lineTo(-2, 10); ctx.lineTo(8, 6);
                ctx.moveTo(-4, 14); ctx.lineTo(6, 14);
                ctx.stroke();
                break;

            case 'witch_crimson': // Crimson Sorceress Robe
                ctx.fillStyle = '#880E4F';
                ctx.beginPath();
                ctx.moveTo(-8, 0); ctx.lineTo(8, 0); ctx.lineTo(17, 18); ctx.lineTo(-17, 18);
                ctx.closePath();
                ctx.fill(); ctx.stroke();

                // Gold star embroidery
                ctx.fillStyle = '#FFD700';
                KittyRenderer.drawStar(ctx, 0, 8, 4, 4, 2);
                break;
        }

        ctx.restore();
    }

    /**
     * Draws Held Items (Star Wand, Pitchfork, Lollipop)
     */
    static drawHeldItem(ctx, x, y, accessory, animTime) {
        ctx.save();
        ctx.translate(x, y);

        switch (accessory.type) {
            case 'wand': // Star Wand
                ctx.rotate(-0.3 + Math.sin(animTime * 5) * 0.1);
                // Handle
                ctx.strokeStyle = '#FFEB3B';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(0, 8); ctx.lineTo(0, -14);
                ctx.stroke();

                // Star on top
                ctx.fillStyle = '#FFD700';
                ctx.shadowColor = '#FFF59D';
                ctx.shadowBlur = 6;
                KittyRenderer.drawStar(ctx, 0, -16, 5, 6, 3);
                break;

            case 'pitchfork': // Pitchfork
                ctx.rotate(0.2);
                ctx.strokeStyle = '#B71C1C';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(0, 10); ctx.lineTo(0, -16);
                ctx.stroke();

                // Prongs
                ctx.strokeStyle = '#FF1744';
                ctx.beginPath();
                ctx.moveTo(-7, -22); ctx.lineTo(-6, -14); ctx.lineTo(6, -14); ctx.lineTo(7, -22);
                ctx.moveTo(0, -14); ctx.lineTo(0, -24);
                ctx.stroke();
                break;

            case 'lollipop': // Swirly Candy
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(0, 10); ctx.lineTo(0, -6);
                ctx.stroke();

                // Swirl candy
                ctx.fillStyle = '#FF4081';
                ctx.beginPath();
                ctx.arc(0, -12, 8, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = '#00E5FF';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, -12, 4, 0, Math.PI);
                ctx.stroke();
                break;

            case 'laser_sword': // Neon Pink Laser Blade
                ctx.rotate(-0.4);
                // Hilt
                ctx.strokeStyle = '#424242';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(0, 10); ctx.lineTo(0, -2);
                ctx.stroke();
                // Glowing Blade
                ctx.strokeStyle = '#FF4081';
                ctx.lineWidth = 3.5;
                ctx.shadowColor = '#FF4081';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.moveTo(0, -2); ctx.lineTo(0, -26);
                ctx.stroke();
                // Core
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(0, -2); ctx.lineTo(0, -25);
                ctx.stroke();
                break;

            case 'chibi_switch': // Handheld Chibi Console
                ctx.rotate(0.1);
                // Body
                ctx.fillStyle = '#1E1E1E';
                ctx.fillRect(-10, -14, 20, 12);
                // Left Joy-Con (Blue)
                ctx.fillStyle = '#00E5FF';
                ctx.fillRect(-10, -14, 4, 12);
                // Right Joy-Con (Pink/Red)
                ctx.fillStyle = '#FF1744';
                ctx.fillRect(6, -14, 4, 12);
                // Screen
                ctx.fillStyle = '#81D4FA';
                ctx.fillRect(-5, -12, 10, 8);
                break;

            case 'boba_tea': // Bubble Tea Cup
                ctx.rotate(-0.1);
                // Cup
                ctx.fillStyle = 'rgba(255, 224, 178, 0.9)';
                ctx.beginPath();
                ctx.moveTo(-5, -14); ctx.lineTo(5, -14); ctx.lineTo(4, 2); ctx.lineTo(-4, 2);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = '#8D6E63';
                ctx.lineWidth = 1;
                ctx.stroke();
                // Boba pearls
                ctx.fillStyle = '#3E2723';
                ctx.beginPath();
                ctx.arc(-2, 0, 1.5, 0, Math.PI * 2);
                ctx.arc(2, 0, 1.5, 0, Math.PI * 2);
                ctx.arc(0, -3, 1.5, 0, Math.PI * 2);
                ctx.fill();
                // Pink straw
                ctx.strokeStyle = '#FF4081';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(1, -14); ctx.lineTo(3, -20);
                ctx.stroke();
                break;

            case 'magic_mic': // Idol Microphone
                ctx.rotate(-0.3);
                // Handle
                ctx.strokeStyle = '#424242';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(0, 8); ctx.lineTo(0, -6);
                ctx.stroke();
                // Mic head
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(0, -9, 4.5, 0, Math.PI * 2);
                ctx.fill();
                break;
        }

        ctx.restore();
    }

    static drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let step = Math.PI / spikes;
        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            let x = cx + Math.cos(rot) * outerRadius;
            let y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;
            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
    }

    static drawDemonWings(ctx, x, y, animTime) {
        ctx.save();
        ctx.translate(x, y);
        const flap = Math.sin(animTime * 8) * 0.15;
        ctx.rotate(flap);

        ctx.fillStyle = '#311B92';
        ctx.strokeStyle = '#12005E';
        ctx.lineWidth = 2;

        // Wing outline
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-14, -14);
        ctx.quadraticCurveTo(-26, -16, -28, -6);
        ctx.quadraticCurveTo(-24, 0, -20, 2);
        ctx.quadraticCurveTo(-14, 4, 0, 0);
        ctx.fill(); ctx.stroke();

        ctx.restore();
    }

    static drawAngelWings(ctx, x, y, animTime) {
        ctx.save();
        ctx.translate(x, y);
        const flap = Math.sin(animTime * 6) * 0.1;
        ctx.rotate(flap);

        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#E0E0E0';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-12, -14, -22, -10);
        ctx.quadraticCurveTo(-26, 2, -16, 8);
        ctx.quadraticCurveTo(-8, 6, 0, 0);
        ctx.fill(); ctx.stroke();

        ctx.restore();
    }

    static drawFairyWings(ctx, x, y, animTime) {
        ctx.save();
        ctx.translate(x, y);
        const flutter = Math.sin(animTime * 14) * 0.2;
        ctx.rotate(flutter);

        ctx.fillStyle = 'rgba(0, 229, 255, 0.55)';
        ctx.strokeStyle = '#E040FB';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = '#00E5FF';
        ctx.shadowBlur = 8;

        // Top wing
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-14, -18, -24, -12);
        ctx.quadraticCurveTo(-22, 2, -12, 4);
        ctx.quadraticCurveTo(-6, 2, 0, 0);
        ctx.fill(); ctx.stroke();

        // Bottom wing
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-10, 4, -18, 12);
        ctx.quadraticCurveTo(-14, 16, -6, 8);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        ctx.restore();
    }

    // --- ENVIRONMENT & WORLD RENDERING ---

    static drawBackground(ctx, width, height, cameraX, mode, time) {
        if (mode === 'cute') {
            // Candy sky gradient
            const grad = ctx.createLinearGradient(0, 0, 0, height);
            grad.addColorStop(0, '#B3E5FC'); // Pastel blue
            grad.addColorStop(0.5, '#F8BBD0'); // Pastel pink
            grad.addColorStop(1, '#FFF9C4'); // Pastel yellow morning
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);

            // Smiling Kawaii Sun
            ctx.save();
            ctx.fillStyle = '#FFEE58';
            ctx.shadowColor = '#FFF59D';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(width - 90, 80, 42, 0, Math.PI * 2);
            ctx.fill();
            // Sun face
            ctx.fillStyle = '#3E2723';
            ctx.beginPath();
            ctx.arc(width - 100, 75, 3, 0, Math.PI * 2);
            ctx.arc(width - 80, 75, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(width - 90, 85, 6, 0, Math.PI);
            ctx.stroke();
            // Rosy cheeks
            ctx.fillStyle = '#FF80AB';
            ctx.beginPath();
            ctx.arc(width - 103, 83, 3, 0, Math.PI * 2);
            ctx.arc(width - 77, 83, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Parallax Pastel Hills
            ctx.fillStyle = '#E1BEE7';
            ctx.beginPath();
            const hill1X = -(cameraX * 0.15) % 400;
            for (let x = hill1X - 400; x < width + 400; x += 300) {
                ctx.arc(x + 150, height - 30, 200, Math.PI, 0);
            }
            ctx.fill();

            ctx.fillStyle = '#C8E6C9';
            ctx.beginPath();
            const hill2X = -(cameraX * 0.3) % 350;
            for (let x = hill2X - 350; x < width + 350; x += 250) {
                ctx.arc(x + 125, height - 10, 160, Math.PI, 0);
            }
            ctx.fill();

            // Fluffy candy clouds
            KittyRenderer.drawClouds(ctx, cameraX * 0.25, time, '#FFFFFF', 0.85);

        } else {
            // Hell Dark Fiery Sky
            const grad = ctx.createLinearGradient(0, 0, 0, height);
            grad.addColorStop(0, '#100003');
            grad.addColorStop(0.5, '#3D0007');
            grad.addColorStop(0.9, '#B71C1C');
            grad.addColorStop(1, '#FF5722');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);

            // Blood Moon
            ctx.save();
            ctx.fillStyle = '#D50000';
            ctx.shadowColor = '#FF1744';
            ctx.shadowBlur = 25;
            ctx.beginPath();
            ctx.arc(width - 90, 80, 42, 0, Math.PI * 2);
            ctx.fill();
            // Eclipse shadow
            ctx.fillStyle = '#210003';
            ctx.beginPath();
            ctx.arc(width - 102, 74, 38, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Jagged Obsidian Volcano Peaks (Parallax)
            ctx.fillStyle = '#1A0508';
            ctx.beginPath();
            const peak1X = -(cameraX * 0.2) % 400;
            ctx.moveTo(peak1X - 400, height);
            for (let x = peak1X - 400; x < width + 400; x += 180) {
                ctx.lineTo(x + 90, height - 180 - ((x % 50)));
                ctx.lineTo(x + 180, height);
            }
            ctx.fill();

            // Dark ominous smoke clouds
            KittyRenderer.drawClouds(ctx, cameraX * 0.35, time, '#210206', 0.7);

            // Lava river glow at the bottom
            const lavaGlow = ctx.createLinearGradient(0, height - 60, 0, height);
            lavaGlow.addColorStop(0, 'rgba(255, 87, 34, 0)');
            lavaGlow.addColorStop(1, 'rgba(255, 61, 0, 0.85)');
            ctx.fillStyle = lavaGlow;
            ctx.fillRect(0, height - 60, width, 60);
        }
    }

    static drawClouds(ctx, scrollX, time, color, alpha) {
        ctx.save();
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;

        const cloudDefs = [
            { base: 60, y: 50, s: 0.9 },
            { base: 280, y: 90, s: 1.1 },
            { base: 520, y: 40, s: 0.8 },
            { base: 760, y: 75, s: 1.0 },
            { base: 1040, y: 55, s: 1.2 }
        ];

        cloudDefs.forEach(c => {
            const cx = ((c.base - scrollX + (time * 15)) % 1200) - 100;
            const cy = c.y;
            const r = 24 * c.s;

            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.arc(cx + r * 0.7, cy - r * 0.3, r * 0.8, 0, Math.PI * 2);
            ctx.arc(cx + r * 1.4, cy, r * 0.9, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }

    /**
     * Draws Tiles / Blocks according to Cute or Hell theme.
     * Supports ground, blocks, item boxes, pipes, moving platforms (moving_h, moving_v),
     * collapsible/falling platforms (falling), and dimension-exclusive platforms (kawaii_only, hell_only).
     */
    static drawTile(ctx, x, y, width, height, type, mode, animTime) {
        ctx.save();
        ctx.translate(x, y);

        if (mode === 'cute') {
            switch (type) {
                case 'ground':
                    // Marshmallow soil with strawberry frosting grass
                    ctx.fillStyle = '#FFE0B2'; // Marshmallow biscuit
                    ctx.fillRect(0, 0, width, height);

                    // Pink frosting top
                    ctx.fillStyle = '#F48FB1';
                    ctx.beginPath();
                    ctx.rect(0, 0, width, 8);
                    ctx.fill();

                    // Frosting drip
                    for (let d = 4; d < width; d += 10) {
                        ctx.beginPath();
                        ctx.arc(d, 8, 3, 0, Math.PI);
                        ctx.fill();
                    }

                    // Sprinkles
                    ctx.fillStyle = '#00E5FF';
                    ctx.fillRect(8, 16, 4, 2);
                    ctx.fillStyle = '#FFEB3B';
                    ctx.fillRect(20, 22, 4, 2);
                    ctx.fillStyle = '#76FF03';
                    ctx.fillRect(12, 28, 4, 2);

                    ctx.strokeStyle = '#F06292';
                    ctx.lineWidth = 1.5;
                    ctx.strokeRect(0, 0, width, height);
                    break;

                case 'block':
                case 'item_box':
                    // Kawaii Question / Heart Block
                    ctx.fillStyle = '#FFD54F';
                    ctx.fillRect(0, 0, width, height);
                    ctx.strokeStyle = '#FFA000';
                    ctx.lineWidth = 2.5;
                    ctx.strokeRect(0, 0, width, height);

                    // Screw rivets in corners
                    ctx.fillStyle = '#FFA000';
                    ctx.fillRect(2, 2, 3, 3);
                    ctx.fillRect(width - 5, 2, 3, 3);
                    ctx.fillRect(2, height - 5, 3, 3);
                    ctx.fillRect(width - 5, height - 5, 3, 3);

                    // Cute Heart or Star icon
                    ctx.fillStyle = '#E91E63';
                    ctx.beginPath();
                    ctx.arc(width / 2 - 3, height / 2 - 2, 4, 0, Math.PI * 2);
                    ctx.arc(width / 2 + 3, height / 2 - 2, 4, 0, Math.PI * 2);
                    ctx.lineTo(width / 2, height / 2 + 6);
                    ctx.closePath();
                    ctx.fill();
                    break;

                case 'pipe':
                    // Candy Cane striped pipe
                    ctx.fillStyle = '#E0F7FA';
                    ctx.fillRect(0, 0, width, height);
                    // Stripes
                    ctx.fillStyle = '#FF4081';
                    for (let s = -width; s < width + height; s += 16) {
                        ctx.beginPath();
                        ctx.moveTo(s, 0);
                        ctx.lineTo(s + 8, 0);
                        ctx.lineTo(s + 8 - height, height);
                        ctx.lineTo(s - height, height);
                        ctx.fill();
                    }
                    ctx.strokeStyle = '#0097A7';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(0, 0, width, height);
                    break;

                case 'moving_h':
                case 'moving_v':
                    // Plataforma móvil alada / dorada en Kawaii
                    ctx.fillStyle = '#FFF8E1';
                    ctx.fillRect(0, 0, width, height);
                    ctx.strokeStyle = '#FFB300';
                    ctx.lineWidth = 2.5;
                    ctx.strokeRect(0, 0, width, height);

                    // Decoración de alas en los bordes
                    ctx.fillStyle = '#FF80AB';
                    ctx.beginPath();
                    ctx.arc(8, height / 2, 5, 0, Math.PI * 2);
                    ctx.arc(width - 8, height / 2, 5, 0, Math.PI * 2);
                    ctx.fill();

                    // Flecha o engranaje brillante de dirección
                    ctx.fillStyle = '#FF4081';
                    ctx.font = 'bold 11px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(type === 'moving_h' ? '⇄ 🎀' : '⇅ ✨', width / 2, height / 2);
                    break;
            }
        } else {
            // HELL MODE TILES
            switch (type) {
                case 'ground':
                    // Obsidian stone with fiery lava fissures
                    ctx.fillStyle = '#1B1B1B';
                    ctx.fillRect(0, 0, width, height);

                    // Molten lava top layer
                    ctx.fillStyle = '#D50000';
                    ctx.fillRect(0, 0, width, 5);

                    // Glowing magma fissure line
                    ctx.strokeStyle = '#FF6D00';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(0, 4);
                    ctx.lineTo(width * 0.4, 14);
                    ctx.lineTo(width * 0.7, 8);
                    ctx.lineTo(width, 18);
                    ctx.stroke();

                    ctx.strokeStyle = '#3E2723';
                    ctx.lineWidth = 1.5;
                    ctx.strokeRect(0, 0, width, height);
                    break;

                case 'block':
                case 'item_box':
                    // Dark Cursed Obsidian Block with glowing demon eye
                    ctx.fillStyle = '#212121';
                    ctx.fillRect(0, 0, width, height);
                    ctx.strokeStyle = '#FF1744';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(0, 0, width, height);

                    // Spikes on corners
                    ctx.fillStyle = '#B71C1C';
                    ctx.fillRect(2, 2, 4, 4);
                    ctx.fillRect(width - 6, 2, 4, 4);

                    // Demon eye in center
                    ctx.fillStyle = '#FF5252';
                    ctx.beginPath();
                    ctx.ellipse(width / 2, height / 2, 6, 4, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(width / 2 - 1, height / 2 - 3, 2, 6);
                    break;

                case 'pipe':
                    // Scorched iron incinerator pipe with glowing vents
                    ctx.fillStyle = '#263238';
                    ctx.fillRect(0, 0, width, height);
                    ctx.fillStyle = '#FF3D00';
                    ctx.fillRect(4, 4, width - 8, 4);
                    ctx.fillRect(4, height / 2, width - 8, 4);
                    ctx.strokeStyle = '#D50000';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(0, 0, width, height);
                    break;

                case 'moving_h':
                case 'moving_v':
                    // Plataforma móvil de roca ígnea en el Averno
                    ctx.fillStyle = '#212121';
                    ctx.fillRect(0, 0, width, height);
                    ctx.strokeStyle = '#FF3D00';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(0, 0, width, height);

                    // Núcleo de magma pulsante
                    ctx.fillStyle = '#FF5722';
                    ctx.fillRect(6, 4, width - 12, height - 8);

                    // Indicador rúnico
                    ctx.fillStyle = '#FFD600';
                    ctx.font = 'bold 11px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(type === 'moving_h' ? '⚡ ⇄ ⚡' : '🔥 ⇅ 🔥', width / 2, height / 2);
                    break;
            }
        }

        ctx.restore();
    }

    /**
     * Draws Collectibles (Cute: Cupcake/Strawberry, Hell: Fiery Skull/Soul Crystal)
     */
    static drawCollectible(ctx, x, y, width, height, mode, animTime) {
        ctx.save();
        const floatY = y + Math.sin(animTime * 6) * 4;
        ctx.translate(x + width / 2, floatY + height / 2);

        if (mode === 'cute') {
            // Strawberry Cupcake
            // Wrapper
            ctx.fillStyle = '#81D4FA';
            ctx.beginPath();
            ctx.moveTo(-9, 4); ctx.lineTo(9, 4); ctx.lineTo(6, 12); ctx.lineTo(-6, 12);
            ctx.closePath();
            ctx.fill();

            // Swirl pink cream
            ctx.fillStyle = '#FF4081';
            ctx.beginPath();
            ctx.arc(0, 3, 9, Math.PI, 0);
            ctx.fill();

            // Strawberry topper
            ctx.fillStyle = '#D50000';
            ctx.beginPath();
            ctx.arc(0, -6, 4, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Burning Hell Crystal / Crimson Skull
            ctx.fillStyle = '#FF1744';
            ctx.shadowColor = '#FF5252';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(0, -11);
            ctx.lineTo(8, 0);
            ctx.lineTo(0, 11);
            ctx.lineTo(-8, 0);
            ctx.closePath();
            ctx.fill();

            // Inner flare
            ctx.fillStyle = '#FFEB3B';
            ctx.beginPath();
            ctx.arc(0, 0, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    /**
     * Draws Enemies (Cute: Chibi Slime / Bunny, Hell: Fire Imp / Demon Bat,
     * and Pac-Man style enemies with animated chomping mouth & directional orientation)
     */
    static drawEnemy(ctx, enemy, mode, animTime) {
        ctx.save();
        ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);

        // Orientación según la dirección en que camina
        const facing = (enemy.vx !== undefined ? (enemy.vx >= 0 ? 1 : -1) : 1);
        ctx.scale(facing, 1);

        const currentTime = enemy.animTime || animTime;

        if (enemy.type === 'pacman') {
            // === NUEVA VARIEDAD DE ENEMIGO: ESTILO PAC-MAN ===
            const chompRate = enemy.isChasing ? 20 : 11;
            const mouthAngle = Math.abs(Math.sin(currentTime * chompRate)) * 0.35 * Math.PI;

            if (mode === 'cute') {
                // Pac-Man Kawaii: Amarillo limón alegre, ojo anime y lazo
                ctx.fillStyle = '#FFD54F';
                ctx.strokeStyle = '#FFA000';
                ctx.lineWidth = 2.2;

                // Cuerpo esférico con boca abriendo/cerrando
                ctx.beginPath();
                ctx.arc(0, 0, 13, mouthAngle, Math.PI * 2 - mouthAngle);
                ctx.lineTo(0, 0);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Gran ojo anime brillante
                ctx.fillStyle = '#212121';
                ctx.beginPath();
                ctx.arc(1, -6, 2.5, 0, Math.PI * 2);
                ctx.fill();

                // Reflejo blanco del ojo
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(0, -7, 1.2, 0, Math.PI * 2);
                ctx.fill();

                // Mejilla rosada
                ctx.fillStyle = '#FF80AB';
                ctx.beginPath();
                ctx.arc(-4, 3, 2, 0, Math.PI * 2);
                ctx.fill();

                // Pequeño lazo rosita superior
                ctx.fillStyle = '#FF4081';
                ctx.beginPath();
                ctx.arc(-2, -13, 2.5, 0, Math.PI * 2);
                ctx.arc(2, -13, 2.5, 0, Math.PI * 2);
                ctx.fill();

            } else {
                // Pac-Man Averno: Demonio pesadilla carmesí con colmillos afilados
                const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, 14);
                grad.addColorStop(0, '#FF1744');
                grad.addColorStop(0.7, '#D50000');
                grad.addColorStop(1, '#3E0007');

                ctx.fillStyle = grad;
                ctx.strokeStyle = '#B71C1C';
                ctx.lineWidth = 2.5;

                // Cuerpo con boca voraz animada
                ctx.beginPath();
                ctx.arc(0, 0, 13, mouthAngle, Math.PI * 2 - mouthAngle);
                ctx.lineTo(0, 0);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Dientes triangulares afilados cuando abre la boca
                if (mouthAngle > 0.08) {
                    ctx.fillStyle = '#FFFFFF';
                    // Diente superior
                    ctx.beginPath();
                    ctx.moveTo(3, -2); ctx.lineTo(7, -mouthAngle * 9); ctx.lineTo(10, -2);
                    ctx.fill();
                    // Diente inferior
                    ctx.beginPath();
                    ctx.moveTo(3, 2); ctx.lineTo(7, mouthAngle * 9); ctx.lineTo(10, 2);
                    ctx.fill();
                }

                // Ojo demoníaco amarillo ardiente
                ctx.fillStyle = '#FFEA00';
                ctx.beginPath();
                ctx.ellipse(1, -6, 3, 2, -0.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#000000';
                ctx.fillRect(1, -8, 1.5, 4);

                // Cuernos afilados de diablo
                ctx.fillStyle = '#FFD600';
                ctx.beginPath();
                ctx.moveTo(-4, -12); ctx.lineTo(-7, -18); ctx.lineTo(-2, -14);
                ctx.moveTo(2, -12); ctx.lineTo(5, -18); ctx.lineTo(0, -14);
                ctx.fill();
            }

        } else if (mode === 'cute') {
            // Chibi Pink Gel Slime
            const squish = Math.sin(currentTime * 10) * 2;
            ctx.fillStyle = '#FF80AB';
            ctx.strokeStyle = '#C2185B';
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.ellipse(0, 2 + squish / 2, 14, 12 - squish, 0, 0, Math.PI * 2);
            ctx.fill(); ctx.stroke();

            // Big happy eyes
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(-5, 0, 2.5, 0, Math.PI * 2);
            ctx.arc(5, 0, 2.5, 0, Math.PI * 2);
            ctx.fill();

            // Smile
            ctx.beginPath();
            ctx.arc(0, 3, 3, 0, Math.PI);
            ctx.stroke();

            // Rosy cheeks
            ctx.fillStyle = '#FF4081';
            ctx.beginPath();
            ctx.arc(-8, 3, 2, 0, Math.PI * 2);
            ctx.arc(8, 3, 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Hell Imp / Demon Bat
            const flap = Math.sin(currentTime * 15) * 4;
            ctx.fillStyle = '#B71C1C';
            ctx.strokeStyle = '#4A0000';
            ctx.lineWidth = 2;

            // Bat wings
            ctx.beginPath();
            ctx.moveTo(-6, 0);
            ctx.lineTo(-18, -8 + flap);
            ctx.lineTo(-14, 4);
            ctx.closePath();
            ctx.fill(); ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(6, 0);
            ctx.lineTo(18, -8 + flap);
            ctx.lineTo(14, 4);
            ctx.closePath();
            ctx.fill(); ctx.stroke();

            // Body
            ctx.beginPath();
            ctx.arc(0, 0, 11, 0, Math.PI * 2);
            ctx.fill(); ctx.stroke();

            // Little Horns
            ctx.fillStyle = '#FFD600';
            ctx.beginPath();
            ctx.moveTo(-6, -8); ctx.lineTo(-9, -15); ctx.lineTo(-2, -10);
            ctx.moveTo(6, -8); ctx.lineTo(9, -15); ctx.lineTo(2, -10);
            ctx.fill();

            // Glowing yellow evil eyes
            ctx.fillStyle = '#FFEA00';
            ctx.beginPath();
            ctx.moveTo(-6, -2); ctx.lineTo(-2, 0); ctx.lineTo(-6, 2);
            ctx.moveTo(6, -2); ctx.lineTo(2, 0); ctx.lineTo(6, 2);
            ctx.fill();
        }

        // Indicador visual de persecución activa (Nivel 3+)
        if (enemy.isChasing) {
            ctx.save();
            ctx.translate(0, -18);
            ctx.textAlign = 'center';
            if (mode === 'cute') {
                ctx.font = 'bold 13px sans-serif';
                ctx.fillText('💢', 0, 0);
            } else {
                ctx.font = 'bold 14px sans-serif';
                ctx.shadowColor = '#FF1744';
                ctx.shadowBlur = 8;
                ctx.fillText('❗', 0, 0);
            }
            ctx.restore();
        }

        ctx.restore();
    }

    /**
     * Draws Checkpoint Totem / Flag
     */
    static drawCheckpoint(ctx, cp, mode, animTime) {
        ctx.save();
        ctx.translate(cp.x + cp.width / 2, cp.y + cp.height);

        const isReached = cp.reached;

        if (mode === 'cute') {
            // Cute Star & Ribbon Totem
            ctx.fillStyle = isReached ? '#FF4081' : '#BDBDBD';
            ctx.strokeStyle = isReached ? '#C2185B' : '#757575';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(0, 0, 16, 6, 0, 0, Math.PI * 2);
            ctx.fill(); ctx.stroke();

            // Pole
            ctx.fillStyle = isReached ? '#FFD54F' : '#9E9E9E';
            ctx.fillRect(-3, -44, 6, 44);

            // Waving ribbon / flag
            const wave = Math.sin(animTime * 6) * 3;
            ctx.fillStyle = isReached ? '#FF4081' : '#757575';
            ctx.beginPath();
            ctx.moveTo(3, -40);
            ctx.lineTo(26 + wave, -33);
            ctx.lineTo(3, -26);
            ctx.closePath();
            ctx.fill();

            // Star or gem topper
            if (isReached) {
                ctx.fillStyle = '#FFD700';
                ctx.shadowColor = '#FFF59D';
                ctx.shadowBlur = 10;
                KittyRenderer.drawStar(ctx, 0, -48, 5, 8, 4);
            } else {
                ctx.fillStyle = '#E0E0E0';
                ctx.beginPath();
                ctx.arc(0, -48, 5, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            // Hell Obsidian Brazier / Demonic Rune
            ctx.fillStyle = '#212121';
            ctx.strokeStyle = isReached ? '#FF1744' : '#424242';
            ctx.lineWidth = 2;

            // Brazier Pillar
            ctx.beginPath();
            ctx.moveTo(-10, 0);
            ctx.lineTo(-6, -38);
            ctx.lineTo(6, -38);
            ctx.lineTo(10, 0);
            ctx.closePath();
            ctx.fill(); ctx.stroke();

            // Fire / Rune at the top
            if (isReached) {
                const flamePulse = Math.sin(animTime * 12) * 2;
                ctx.fillStyle = '#FF5722';
                ctx.shadowColor = '#FF1744';
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.moveTo(-7, -38);
                ctx.quadraticCurveTo(-10, -50 + flamePulse, 0, -54 + flamePulse);
                ctx.quadraticCurveTo(10, -50 + flamePulse, 7, -38);
                ctx.closePath();
                ctx.fill();

                // Inner yellow core
                ctx.fillStyle = '#FFEB3B';
                ctx.beginPath();
                ctx.arc(0, -44, 3, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = '#424242';
                ctx.beginPath();
                ctx.arc(0, -42, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.restore();
    }
}

window.KittyRenderer = KittyRenderer;
