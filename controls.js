/**
 * Input Controls Manager (Keyboard & Multi-Touch Virtual Controls)
 * Engineered for zero latency, multi-touch tracking, sliding D-pad, and gesture isolation.
 */
class ControlsManager {
    constructor() {
        this.state = {
            left: false,
            right: false,
            jump: false,
            shiftDimension: false
        };

        // Track active touch identifiers per button to support multi-touch thumbs
        this.activeTouches = new Map(); // buttonName -> touchIdentifier
        this.dpadTouchId = null;

        this.initKeyboard();
        this.initTouch();
    }

    initKeyboard() {
        window.addEventListener('keydown', (e) => {
            if (e.repeat) return;
            switch (e.code) {
                case 'ArrowLeft':
                case 'KeyA':
                    this.state.left = true;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.state.right = true;
                    break;
                case 'ArrowUp':
                case 'KeyW':
                case 'Space':
                    this.state.jump = true;
                    if (window.soundEngine) window.soundEngine.init();
                    e.preventDefault();
                    break;
                case 'ShiftLeft':
                case 'ShiftRight':
                case 'KeyE':
                    this.state.shiftDimension = true;
                    break;
            }
        });

        window.addEventListener('keyup', (e) => {
            switch (e.code) {
                case 'ArrowLeft':
                case 'KeyA':
                    this.state.left = false;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.state.right = false;
                    break;
                case 'ArrowUp':
                case 'KeyW':
                case 'Space':
                    this.state.jump = false;
                    break;
                case 'ShiftLeft':
                case 'ShiftRight':
                case 'KeyE':
                    this.state.shiftDimension = false;
                    break;
            }
        });
    }

    initTouch() {
        const leftBtn = document.getElementById('btn-touch-left');
        const rightBtn = document.getElementById('btn-touch-right');
        const jumpBtn = document.getElementById('btn-touch-jump');
        const shiftBtn = document.getElementById('btn-touch-shift');
        const dpadContainer = document.querySelector('.touch-dpad');

        // Audio unlock helper
        const unlockAudio = () => {
            if (window.soundEngine) {
                window.soundEngine.init();
            }
        };

        // --- D-PAD LOGIC (Supports tapping & sliding between Left and Right) ---
        if (dpadContainer && leftBtn && rightBtn) {
            const handleDpadTouch = (touch) => {
                const leftRect = leftBtn.getBoundingClientRect();
                const rightRect = rightBtn.getBoundingClientRect();

                // Check distance to centers or bounds
                const x = touch.clientX;
                const y = touch.clientY;

                // Expand hit test area slightly for generous mobile thumb control
                const isOverLeft = x >= leftRect.left - 20 && x <= leftRect.right + 10 &&
                                   y >= leftRect.top - 20 && y <= leftRect.bottom + 20;

                const isOverRight = x >= rightRect.left - 10 && x <= rightRect.right + 20 &&
                                    y >= rightRect.top - 20 && y <= rightRect.bottom + 20;

                if (isOverLeft) {
                    this.state.left = true;
                    this.state.right = false;
                    leftBtn.classList.add('pressed');
                    rightBtn.classList.remove('pressed');
                } else if (isOverRight) {
                    this.state.right = true;
                    this.state.left = false;
                    rightBtn.classList.add('pressed');
                    leftBtn.classList.remove('pressed');
                } else {
                    this.state.left = false;
                    this.state.right = false;
                    leftBtn.classList.remove('pressed');
                    rightBtn.classList.remove('pressed');
                }
            };

            const onDpadStart = (e) => {
                e.preventDefault();
                unlockAudio();
                const touch = e.changedTouches[0];
                if (touch) {
                    this.dpadTouchId = touch.identifier;
                    handleDpadTouch(touch);
                }
            };

            const onDpadMove = (e) => {
                e.preventDefault();
                for (let i = 0; i < e.changedTouches.length; i++) {
                    const touch = e.changedTouches[i];
                    if (touch.identifier === this.dpadTouchId) {
                        handleDpadTouch(touch);
                        break;
                    }
                }
            };

            const onDpadEnd = (e) => {
                e.preventDefault();
                for (let i = 0; i < e.changedTouches.length; i++) {
                    if (e.changedTouches[i].identifier === this.dpadTouchId) {
                        this.dpadTouchId = null;
                        this.state.left = false;
                        this.state.right = false;
                        leftBtn.classList.remove('pressed');
                        rightBtn.classList.remove('pressed');
                        break;
                    }
                }
            };

            dpadContainer.addEventListener('touchstart', onDpadStart, { passive: false });
            dpadContainer.addEventListener('touchmove', onDpadMove, { passive: false });
            dpadContainer.addEventListener('touchend', onDpadEnd, { passive: false });
            dpadContainer.addEventListener('touchcancel', onDpadEnd, { passive: false });
        }

        // --- ACTION BUTTONS (Jump & Shift) ---
        const setupActionButton = (btnEl, actionName) => {
            if (!btnEl) return;

            btnEl.addEventListener('touchstart', (e) => {
                e.preventDefault();
                e.stopPropagation();
                unlockAudio();

                const touch = e.changedTouches[0];
                if (touch) {
                    this.activeTouches.set(actionName, touch.identifier);
                    this.state[actionName] = true;
                    btnEl.classList.add('pressed');

                    if (actionName === 'jump' && navigator.vibrate) {
                        navigator.vibrate(15);
                    }
                }
            }, { passive: false });

            const onTouchEnd = (e) => {
                e.preventDefault();
                e.stopPropagation();
                for (let i = 0; i < e.changedTouches.length; i++) {
                    if (this.activeTouches.get(actionName) === e.changedTouches[i].identifier) {
                        this.activeTouches.delete(actionName);
                        this.state[actionName] = false;
                        btnEl.classList.remove('pressed');
                        break;
                    }
                }
            };

            btnEl.addEventListener('touchend', onTouchEnd, { passive: false });
            btnEl.addEventListener('touchcancel', onTouchEnd, { passive: false });
        };

        setupActionButton(jumpBtn, 'jump');
        setupActionButton(shiftBtn, 'shiftDimension');

        // --- MOUSE FALLBACKS FOR TESTING IN DESKTOP BROWSER ---
        const setupMouseFallback = (btnEl, actionName) => {
            if (!btnEl) return;
            btnEl.addEventListener('mousedown', (e) => {
                e.preventDefault();
                unlockAudio();
                this.state[actionName] = true;
                btnEl.classList.add('pressed');
            });
            btnEl.addEventListener('mouseup', (e) => {
                e.preventDefault();
                this.state[actionName] = false;
                btnEl.classList.remove('pressed');
            });
            btnEl.addEventListener('mouseleave', () => {
                this.state[actionName] = false;
                btnEl.classList.remove('pressed');
            });
        };

        setupMouseFallback(leftBtn, 'left');
        setupMouseFallback(rightBtn, 'right');
        setupMouseFallback(jumpBtn, 'jump');
        setupMouseFallback(shiftBtn, 'shiftDimension');

        // Global safety: clear all if window loses focus or touches cancel
        window.addEventListener('touchcancel', () => this.reset());
        window.addEventListener('blur', () => this.reset());
    }

    reset() {
        this.state.left = false;
        this.state.right = false;
        this.state.jump = false;
        this.state.shiftDimension = false;
        this.activeTouches.clear();
        this.dpadTouchId = null;
        document.querySelectorAll('.touch-btn').forEach(b => b.classList.remove('pressed'));
    }
}

window.ControlsManager = ControlsManager;
