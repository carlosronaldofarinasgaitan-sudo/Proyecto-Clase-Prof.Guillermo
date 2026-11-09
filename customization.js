/**
 * Customization & Dress-Up Wardrobe System for "Kitty Shelzy"
 * Stores available outfits, accessories, and user selections.
 * Updates Kitty's appearance in both closet preview and canvas game in real time.
 */

const WARDROBE_DATA = {
    fur: [
        { id: 'white', name: 'Blanco Clásico', color: '#FFFFFF', innerEar: '#FFB6C1', outline: '#2b2b2b' },
        { id: 'pink', name: 'Fresa Pastel', color: '#FFE4E9', innerEar: '#FF69B4', outline: '#3b252a' },
        { id: 'cream', name: 'Crema Dulce', color: '#FFF8DC', innerEar: '#FFD700', outline: '#423724' },
        { id: 'shadow', name: 'Gatita Sombra', color: '#2B2338', innerEar: '#FF0055', outline: '#15101E' },
        { id: 'mint', name: 'Menta Kawaii', color: '#E0F2F1', innerEar: '#4DB6AC', outline: '#004D40' },
        { id: 'galaxy', name: 'Galaxia Cósmica', color: '#311B92', innerEar: '#EA80FC', outline: '#12005E' },
        { id: 'cinnamon', name: 'Canela Cálida', color: '#D7CCC8', innerEar: '#BCAAA4', outline: '#3E2723' },
        { id: 'neon_pink', name: 'Fucsia Neón', color: '#FF80AB', innerEar: '#FF4081', outline: '#880E4F' },
        { id: 'golden', name: 'Gatita Dorada', color: '#FFF9C4', innerEar: '#FFD54F', outline: '#FF8F00' }
    ],
    head: [
        { id: 'classic_bow', name: 'Lazo Rojo Clásico', icon: '🎀', type: 'bow', color: '#FF1744' },
        { id: 'gamer_headset', name: 'Diadema Gamer RGB', icon: '🎧', type: 'gamer_headset' },
        { id: 'bunny_ears', name: 'Orejitas Conejita', icon: '🐰', type: 'bunny_ears' },
        { id: 'devil_horns', name: 'Cuernos Diabólicos', icon: '😈', type: 'horns', color: '#D50000' },
        { id: 'angel_halo', name: 'Aureola Angelical', icon: '😇', type: 'halo', color: '#FFD700' },
        { id: 'witch_hat', name: 'Gorro de Brujita', icon: '🧙‍♀️', type: 'witch', color: '#4A148C' },
        { id: 'pirate_hat', name: 'Sombrero Pirata', icon: '🏴‍☠️', type: 'pirate_hat' },
        { id: 'strawberry', name: 'Clip Fresa', icon: '🍓', type: 'strawberry', color: '#FF4081' },
        { id: 'party_hat', name: 'Gorro de Fiesta', icon: '🥳', type: 'party_hat' },
        { id: 'neon_ribbon', name: 'Lazo Neón Cyber', icon: '🎀', type: 'neon_ribbon' },
        { id: 'crown', name: 'Corona Princesa', icon: '👑', type: 'crown', color: '#FFC107' },
        { id: 'goth_crown', name: 'Corona Gótica', icon: '🖤', type: 'goth_crown' },
        { id: 'beret', name: 'Boina Francesa', icon: '🎨', type: 'beret' },
        { id: 'chef_hat', name: 'Gorro Chef', icon: '👩‍🍳', type: 'chef', color: '#FFFFFF' }
    ],
    outfit: [
        { id: 'overalls', name: 'Overol Clásico', icon: '👖', type: 'overalls', mainColor: '#1E88E5', subColor: '#FDD835' },
        { id: 'kawaii_dress', name: 'Vestido Pastel', icon: '👗', type: 'dress', mainColor: '#FF69B4', subColor: '#FFF0F5' },
        { id: 'sakura_kimono', name: 'Kimono Sakura', icon: '🌸', type: 'sakura_kimono' },
        { id: 'astronaut', name: 'Traje Astronauta', icon: '🚀', type: 'astronaut' },
        { id: 'dino_shelzy', name: 'Kigurumi Dino', icon: '🦖', type: 'dino_shelzy' },
        { id: 'demon_robe', name: 'Túnica Infernal', icon: '🔥', type: 'demon', mainColor: '#B71C1C', subColor: '#212121' },
        { id: 'vampire', name: 'Vampiresa Nocturna', icon: '🧛‍♀️', type: 'vampire' },
        { id: 'goth_dress', name: 'Vestido Gótico', icon: '🖤', type: 'goth', mainColor: '#212121', subColor: '#9C27B0' },
        { id: 'angel_gown', name: 'Bata Celestial', icon: '✨', type: 'angel', mainColor: '#F5F5F5', subColor: '#FFD700' },
        { id: 'hero_suit', name: 'Traje Heroína', icon: '🦸‍♀️', type: 'hero', mainColor: '#E91E63', subColor: '#00E676' },
        { id: 'fitness', name: 'Conjunto Fitness', icon: '👟', type: 'fitness' },
        { id: 'cyber_dress', name: 'Vestido Cyberpunk', icon: '⚡', type: 'cyber_dress' },
        { id: 'witch_crimson', name: 'Túnica Carmesí', icon: '🔮', type: 'witch_crimson' }
    ],
    accessory: [
        { id: 'none', name: 'Ninguno', icon: '❌', type: 'none' },
        { id: 'star_wand', name: 'Varita Mágica', icon: '⭐', type: 'wand', color: '#FFD700' },
        { id: 'laser_sword', name: 'Espada Láser Rosa', icon: '⚔️', type: 'laser_sword' },
        { id: 'pitchfork', name: 'Tridente Malvado', icon: '🔱', type: 'pitchfork', color: '#C62828' },
        { id: 'chibi_switch', name: 'Consola Chibi', icon: '🎮', type: 'chibi_switch' },
        { id: 'boba_tea', name: 'Bubble Tea', icon: '🧋', type: 'boba_tea' },
        { id: 'magic_mic', name: 'Micrófono Idol', icon: '🎤', type: 'magic_mic' },
        { id: 'lollipop', name: 'Paleta Dulce', icon: '🍭', type: 'lollipop', color: '#00E5FF' },
        { id: 'fairy_wings', name: 'Alas de Hada', icon: '✨', type: 'fairy_wings' },
        { id: 'demon_wings', name: 'Alas de Demonio', icon: '🦇', type: 'demon_wings', color: '#311B92' },
        { id: 'angel_wings', name: 'Alas de Ángel', icon: '🪽', type: 'angel_wings', color: '#FFFFFF' }
    ]
};

class CustomizationManager {
    constructor() {
        this.selected = {
            fur: 'white',
            head: 'classic_bow',
            outfit: 'overalls',
            accessory: 'star_wand'
        };

        this.previewCanvas = null;
        this.previewCtx = null;
        this.previewAnimTime = 0;
        this.animFrameId = null;
        this.isInitialized = false;

        this.loadFromStorage();
    }

    init() {
        if (this.isInitialized) return;

        this.previewCanvas = document.getElementById('closet-kitty-preview');
        if (this.previewCanvas) {
            this.previewCtx = this.previewCanvas.getContext('2d');
            this.startPreviewAnimation();
        }

        this.buildUI();
        this.updateActiveUIButtons();
        this.drawPreview();
        this.isInitialized = true;
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('kitty_shelzy_customization') || localStorage.getItem('hello_kitty_customization');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.selected = { ...this.selected, ...parsed };
            }
        } catch (e) {
            console.warn('No se pudo acceder a LocalStorage, usando valores por defecto:', e);
        }
    }

    saveToStorage() {
        try {
            const json = JSON.stringify(this.selected);
            localStorage.setItem('kitty_shelzy_customization', json);
            localStorage.setItem('hello_kitty_customization', json);
        } catch (e) {
            console.warn('No se pudo guardar en LocalStorage:', e);
        }
    }

    setItem(category, itemId) {
        if (this.selected[category] !== undefined) {
            this.selected[category] = itemId;
            this.saveToStorage();
            this.updateActiveUIButtons();
            this.drawPreview();
        }
    }

    randomize() {
        const categories = ['fur', 'head', 'outfit', 'accessory'];
        categories.forEach(cat => {
            const list = WARDROBE_DATA[cat];
            const randomItem = list[Math.floor(Math.random() * list.length)];
            this.selected[cat] = randomItem.id;
        });
        this.saveToStorage();
        this.updateActiveUIButtons();
        this.drawPreview();
    }

    getSelectedData() {
        return {
            fur: WARDROBE_DATA.fur.find(f => f.id === this.selected.fur) || WARDROBE_DATA.fur[0],
            head: WARDROBE_DATA.head.find(h => h.id === this.selected.head) || WARDROBE_DATA.head[0],
            outfit: WARDROBE_DATA.outfit.find(o => o.id === this.selected.outfit) || WARDROBE_DATA.outfit[0],
            accessory: WARDROBE_DATA.accessory.find(a => a.id === this.selected.accessory) || WARDROBE_DATA.accessory[0]
        };
    }

    buildUI() {
        const renderCategory = (containerId, categoryName, items) => {
            const container = document.getElementById(containerId);
            if (!container) return;
            container.innerHTML = '';

            items.forEach(item => {
                const btn = document.createElement('button');
                btn.className = `wardrobe-btn ${this.selected[categoryName] === item.id ? 'active' : ''}`;
                btn.dataset.category = categoryName;
                btn.dataset.id = item.id;
                btn.setAttribute('type', 'button');

                if (categoryName === 'fur') {
                    btn.innerHTML = `
                        <span class="color-swatch" style="background-color: ${item.color}; border: 2.5px solid ${item.outline};"></span>
                        <span class="btn-name">${item.name}</span>
                    `;
                } else {
                    btn.innerHTML = `
                        <span class="btn-icon">${item.icon || '🎀'}</span>
                        <span class="btn-name">${item.name}</span>
                    `;
                }

                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.setItem(categoryName, item.id);
                    if (window.soundEngine) {
                        window.soundEngine.init();
                        window.soundEngine.playCoin();
                    }
                });

                container.appendChild(btn);
            });
        };

        renderCategory('wardrobe-fur-list', 'fur', WARDROBE_DATA.fur);
        renderCategory('wardrobe-head-list', 'head', WARDROBE_DATA.head);
        renderCategory('wardrobe-outfit-list', 'outfit', WARDROBE_DATA.outfit);
        renderCategory('wardrobe-acc-list', 'accessory', WARDROBE_DATA.accessory);

        // Tab switching logic
        const tabs = document.querySelectorAll('.wardrobe-tab');
        const contents = document.querySelectorAll('.wardrobe-category-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));

                tab.classList.add('active');
                const target = document.getElementById(tab.dataset.target);
                if (target) target.classList.add('active');
                if (window.soundEngine) window.soundEngine.playCoin();
            });
        });

        // Randomize button
        const randBtn = document.getElementById('btn-randomize-kitty');
        if (randBtn) {
            randBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.randomize();
                if (window.soundEngine) window.soundEngine.playCoin();
            });
        }
    }

    updateActiveUIButtons() {
        const buttons = document.querySelectorAll('.wardrobe-btn');
        buttons.forEach(btn => {
            const cat = btn.dataset.category;
            const id = btn.dataset.id;
            if (this.selected[cat] === id) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    startPreviewAnimation() {
        if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
        const animate = (time) => {
            this.previewAnimTime = time * 0.003;
            this.drawPreview();
            this.animFrameId = requestAnimationFrame(animate);
        };
        this.animFrameId = requestAnimationFrame(animate);
    }

    drawPreview() {
        if (!this.previewCtx || !this.previewCanvas) return;
        const ctx = this.previewCtx;
        const w = this.previewCanvas.width;
        const h = this.previewCanvas.height;

        ctx.clearRect(0, 0, w, h);

        const centerX = w / 2;
        const centerY = h / 2 + 10;

        // Pedestal glow
        const glowGrad = ctx.createRadialGradient(centerX, centerY + 45, 10, centerX, centerY + 45, 65);
        glowGrad.addColorStop(0, 'rgba(255, 128, 171, 0.4)');
        glowGrad.addColorStop(1, 'rgba(255, 128, 171, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY + 45, 65, 20, 0, 0, Math.PI * 2);
        ctx.fill();

        // Shadow under Kitty Shelzy
        ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY + 48, 38, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Idle floating/breathing bounce
        const bounce = Math.sin(this.previewAnimTime * 2.5) * 3.5;

        // Draw Kitty with all equipped layers
        if (window.KittyRenderer) {
            window.KittyRenderer.drawKitty(
                ctx,
                centerX,
                centerY + bounce,
                1.35, // Escala para vista previa en el vestidor
                1,    // Mirando hacia el frente/derecha
                'idle',
                this.previewAnimTime * 3.5,
                this.getSelectedData()
            );
        }
    }
}

// Global instance
window.customization = new CustomizationManager();

// Auto-init on script execution if DOM ready
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    window.customization.init();
} else {
    document.addEventListener('DOMContentLoaded', () => {
        window.customization.init();
    });
}
