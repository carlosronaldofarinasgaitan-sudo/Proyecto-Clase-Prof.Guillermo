/**
 * Audio System using HTML5 Web Audio API
 * Generates retro 8-bit sound effects and dynamic background music
 * for both Cute Kawaii mode and Dark/Hell mode without external audio files.
 */
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.bgmPlaying = false;
        this.currentMode = 'cute'; // 'cute' or 'hell'
        this.bgmTimer = null;
        this.bgmStep = 0;
        this.tempo = 135;
        this.masterGain = null;
    }

    init() {
        if (!this.ctx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContextClass();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.3, this.ctx.currentTime);
        }
        return this.isMuted;
    }

    // --- Sound Effects ---

    playJump() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = this.currentMode === 'cute' ? 'triangle' : 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.15);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    playCoin() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'triangle';

        const freq1 = this.currentMode === 'cute' ? 987.77 : 440; // B5 or A4
        const freq2 = this.currentMode === 'cute' ? 1318.51 : 622.25; // E6 or Eb5 (darker)

        osc1.frequency.setValueAtTime(freq1, now);
        osc1.frequency.setValueAtTime(freq2, now + 0.08);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc1.connect(gain);
        gain.connect(this.masterGain);

        osc1.start(now);
        osc1.stop(now + 0.3);
    }

    playStomp() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(250, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.12);
    }

    playHurt() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.25);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.25);
    }

    playDimensionShift(toHell = true) {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;

        // Sub bass rumble / rising chime
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = toHell ? 'sawtooth' : 'sine';

        if (toHell) {
            osc.frequency.setValueAtTime(500, now);
            osc.frequency.exponentialRampToValueAtTime(40, now + 0.6);
        } else {
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.6);
        }

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.6);
    }

    playVictory() {
        if (this.isMuted || !this.ctx) return;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
            setTimeout(() => {
                if (this.ctx && !this.isMuted) {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.value = freq;
                    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);
                    osc.connect(gain);
                    gain.connect(this.masterGain);
                    osc.start();
                    osc.stop(this.ctx.currentTime + 0.35);
                }
            }, i * 140);
        });
    }

    playGameOver() {
        if (this.isMuted || !this.ctx) return;
        const notes = [440, 415.30, 392, 349.23]; // A4, Ab4, G4, F4
        notes.forEach((freq, i) => {
            setTimeout(() => {
                if (this.ctx && !this.isMuted) {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.value = freq;
                    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
                    osc.connect(gain);
                    gain.connect(this.masterGain);
                    osc.start();
                    osc.stop(this.ctx.currentTime + 0.4);
                }
            }, i * 180);
        });
    }

    // --- Dynamic Background Music Sequencer ---

    setMode(mode) {
        if (this.currentMode !== mode) {
            this.currentMode = mode;
            this.playDimensionShift(mode === 'hell');
        }
    }

    startBGM() {
        if (this.bgmPlaying) return;
        this.bgmPlaying = true;
        this.bgmStep = 0;
        this.scheduleNextBeat();
    }

    stopBGM() {
        this.bgmPlaying = false;
        if (this.bgmTimer) {
            clearTimeout(this.bgmTimer);
            this.bgmTimer = null;
        }
    }

    scheduleNextBeat() {
        if (!this.bgmPlaying) return;

        const beatMs = this.currentMode === 'cute' ? 140 : 120;
        this.playBeatStep(this.bgmStep);
        this.bgmStep = (this.bgmStep + 1) % 32;

        this.bgmTimer = setTimeout(() => {
            this.scheduleNextBeat();
        }, beatMs);
    }

    playBeatStep(step) {
        if (this.isMuted || !this.ctx || this.ctx.state !== 'running') return;
        const now = this.ctx.currentTime;

        if (this.currentMode === 'cute') {
            // Cute bubbly pentatonic melody (C, D, E, G, A)
            const cuteMelody = [
                523.25, 0, 659.25, 783.99, 880.00, 783.99, 659.25, 0,
                587.33, 0, 659.25, 587.33, 523.25, 0, 659.25, 783.99,
                880.00, 1046.50, 880.00, 783.99, 659.25, 783.99, 880.00, 0,
                783.99, 659.25, 587.33, 523.25, 659.25, 0, 523.25, 0
            ];

            const cuteBass = [
                261.63, 0, 261.63, 0, 329.63, 0, 392.00, 0,
                293.66, 0, 293.66, 0, 392.00, 0, 261.63, 0,
                349.23, 0, 349.23, 0, 392.00, 0, 440.00, 0,
                392.00, 0, 329.63, 0, 261.63, 0, 261.63, 0
            ];

            const note = cuteMelody[step];
            if (note > 0) {
                this.playTone(note, 'triangle', 0.12, 0.1);
            }

            const bassNote = cuteBass[step];
            if (bassNote > 0) {
                this.playTone(bassNote, 'sine', 0.15, 0.12);
            }

            // Snare pop every 4 steps
            if (step % 4 === 2) {
                this.playCuteSnare();
            }
        } else {
            // Hell dark, fast distorted chiptune in D Phrygian / Minor (D, Eb, F, G, A, Bb)
            const hellBass = [
                146.83, 146.83, 155.56, 146.83, 174.61, 146.83, 155.56, 146.83,
                146.83, 146.83, 196.00, 174.61, 155.56, 146.83, 130.81, 146.83,
                146.83, 146.83, 155.56, 146.83, 174.61, 146.83, 155.56, 146.83,
                220.00, 207.65, 196.00, 174.61, 155.56, 146.83, 110.00, 146.83
            ];

            const hellLead = [
                587.33, 0, 622.25, 0, 698.46, 0, 622.25, 587.33,
                0, 587.33, 783.99, 698.46, 622.25, 0, 587.33, 0,
                880.00, 830.61, 783.99, 0, 698.46, 0, 622.25, 0,
                587.33, 622.25, 587.33, 0, 587.33, 880.00, 587.33, 0
            ];

            const leadNote = hellLead[step];
            if (leadNote > 0) {
                this.playTone(leadNote, 'sawtooth', 0.15, 0.08);
            }

            const bassNote = hellBass[step];
            if (bassNote > 0) {
                this.playTone(bassNote, 'square', 0.18, 0.1);
            }

            // Heavy kick / glitch click
            if (step % 2 === 0) {
                this.playHellKick();
            }
        }
    }

    playTone(freq, type, duration, volume) {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + duration);
    }

    playCuteSnare() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.05);
    }

    playHellKick() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.07);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.07);
    }
}

// Global sound manager instance
window.soundEngine = new SoundEngine();
