/* ==========================================================================
   AstroType v3.0 — Debounced Storage, Web Audio Engine & Cockpit Voice
   Created & Developed by YRZQ_WLDN
   ========================================================================== */
(function (global) {
  'use strict';

  const AstroType = (global.AstroType = global.AstroType || {});

  // ==========================================
  // 1. DEBOUNCED SAFE LOCALSTORAGE ENGINE
  //    Zero synchronous disk I/O during combat!
  // ==========================================
  const PREFIX = 'astrotype_v2_';
  const pendingWrites = new Map();
  let flushTimer = null;

  const storage = {
    get(key, fallback) {
      if (pendingWrites.has(key)) {
        return pendingWrites.get(key);
      }
      try {
        const val = localStorage.getItem(PREFIX + key);
        return val !== null ? JSON.parse(val) : fallback;
      } catch (e) {
        return fallback;
      }
    },
    set(key, val, immediate) {
      pendingWrites.set(key, val);
      if (immediate) {
        this.flush();
        return;
      }
      if (!flushTimer) {
        flushTimer = setTimeout(() => {
          this.flush();
        }, 1200);
      }
    },
    flush() {
      if (flushTimer) {
        clearTimeout(flushTimer);
        flushTimer = null;
      }
      if (pendingWrites.size === 0) return;
      pendingWrites.forEach((val, key) => {
        try {
          localStorage.setItem(PREFIX + key, JSON.stringify(val));
        } catch (e) {}
      });
      pendingWrites.clear();
    },
    removeKeys(keys) {
      this.flush();
      keys.forEach((k) => {
        pendingWrites.delete(k);
        try {
          localStorage.removeItem(PREFIX + k);
        } catch (e) {}
      });
    }
  };

  window.addEventListener('pagehide', () => storage.flush());
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) storage.flush();
  });

  AstroType.storage = storage;

  // ==========================================
  // 2. SYNTHESIZED SOUND ENGINE (WEB AUDIO API)
  //    Compressor-protected, zero-clipping, lookahead BGM
  // ==========================================
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.compressor = null;
      this.bgmGain = null;
      this.bgmFilter = null;
      this.noiseBuffer = null;

      this.muted = storage.get('muted', false);
      this.soundType = storage.get('soundType', 'laser'); // 'laser' | 'clack' | 'retro'
      this.bgmEnabled = storage.get('bgmEnabled', false);

      this.bgmTimer = null;
      this.bgmNextNoteTime = 0;
      this.bgmStep = 0;
      this.bgmPausedByVisibility = false;
      this.lastKeySoundTime = 0;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        try {
          this.ctx = new AudioCtx({ latencyHint: 'interactive' });
          this.compressor = this.ctx.createDynamicsCompressor();
          this.compressor.threshold.value = -16;
          this.compressor.knee.value = 18;
          this.compressor.ratio.value = 6;
          this.compressor.attack.value = 0.003;
          this.compressor.release.value = 0.12;

          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.value = this.muted ? 0 : 0.9;

          this.compressor.connect(this.masterGain);
          this.masterGain.connect(this.ctx.destination);

          // Pre-bake short noise buffer for tactile mechanical clack & explosions
          const sr = this.ctx.sampleRate;
          const len = Math.floor(sr * 0.18);
          this.noiseBuffer = this.ctx.createBuffer(1, len, sr);
          const data = this.noiseBuffer.getChannelData(0);
          for (let i = 0; i < len; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sr * 0.045));
          }
        } catch (e) {
          this.ctx = null;
          return;
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }

    setMuted(muted) {
      this.muted = !!muted;
      storage.set('muted', this.muted, true);
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setTargetAtTime(this.muted ? 0 : 0.9, this.ctx.currentTime, 0.02);
      }
      if (this.muted) {
        this.stopBGM();
      } else if (this.bgmEnabled) {
        this.startBGM();
      }
    }

    playKeySound(combo) {
      if (this.muted) return;
      this.init();
      if (!this.ctx || !this.compressor) return;

      const now = this.ctx.currentTime;
      // Guard against duplicate audio overload on simultaneous bursts
      if (now - this.lastKeySoundTime < 0.018) return;
      this.lastKeySoundTime = now;

      try {
        if (this.soundType === 'clack') {
          // Tactile Mechanical Switch Thock + Crisp Click
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          const baseF = 340 + (Math.random() - 0.5) * 45;
          osc.frequency.setValueAtTime(baseF, now);
          osc.frequency.exponentialRampToValueAtTime(95, now + 0.032);
          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.038);
          osc.connect(gain);
          gain.connect(this.compressor);
          osc.start(now);
          osc.stop(now + 0.04);

          if (this.noiseBuffer) {
            const src = this.ctx.createBufferSource();
            src.buffer = this.noiseBuffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(2400 + Math.random() * 600, now);
            filter.Q.value = 2.2;
            const nGain = this.ctx.createGain();
            nGain.gain.setValueAtTime(0.14, now);
            nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.022);
            src.connect(filter);
            filter.connect(nGain);
            nGain.connect(this.compressor);
            src.start(now);
            src.stop(now + 0.025);
          }
        } else if (this.soundType === 'retro') {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          const scale = [392, 440, 523.25, 587.33, 659.25, 783.99, 880, 1046.5];
          const f = scale[(combo || 0) % scale.length];
          osc.frequency.setValueAtTime(f, now);
          osc.frequency.setValueAtTime(f * 1.5, now + 0.022);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.052);
          osc.connect(gain);
          gain.connect(this.compressor);
          osc.start(now);
          osc.stop(now + 0.056);
        } else {
          // Sci-fi Laser Pew with smooth harmonic combo lift
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          const pitchBonus = Math.min(520, (combo || 0) * 18);
          osc.frequency.setValueAtTime(680 + pitchBonus, now);
          osc.frequency.exponentialRampToValueAtTime(175, now + 0.062);
          gain.gain.setValueAtTime(0.095, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);
          osc.connect(gain);
          gain.connect(this.compressor);
          osc.start(now);
          osc.stop(now + 0.068);
        }
      } catch (e) {}
    }

    playExplosion(isBoss) {
      if (this.muted) return;
      this.init();
      if (!this.ctx || !this.compressor) return;
      try {
        const now = this.ctx.currentTime;
        const dur = isBoss ? 0.48 : 0.20;

        // Low punch body
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(isBoss ? 150 : 210, now);
        osc.frequency.exponentialRampToValueAtTime(28, now + dur);
        gain.gain.setValueAtTime(isBoss ? 0.28 : 0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
        osc.connect(gain);
        gain.connect(this.compressor);
        osc.start(now);
        osc.stop(now + dur + 0.01);

        // Filtered plasma burst noise
        if (this.noiseBuffer) {
          const src = this.ctx.createBufferSource();
          src.buffer = this.noiseBuffer;
          const flt = this.ctx.createBiquadFilter();
          flt.type = 'lowpass';
          flt.frequency.setValueAtTime(isBoss ? 1400 : 1800, now);
          flt.frequency.exponentialRampToValueAtTime(220, now + Math.min(0.17, dur));
          const nGain = this.ctx.createGain();
          nGain.gain.setValueAtTime(isBoss ? 0.22 : 0.11, now);
          nGain.gain.exponentialRampToValueAtTime(0.001, now + Math.min(0.17, dur));
          src.connect(flt);
          flt.connect(nGain);
          nGain.connect(this.compressor);
          src.start(now);
          src.stop(now + Math.min(0.18, dur));
        }
      } catch (e) {}
    }

    playError() {
      if (this.muted) return;
      this.init();
      if (!this.ctx || !this.compressor) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(145, now);
        osc.frequency.setValueAtTime(102, now + 0.045);
        gain.gain.setValueAtTime(0.075, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.105);
        osc.connect(gain);
        gain.connect(this.compressor);
        osc.start(now);
        osc.stop(now + 0.11);
      } catch (e) {}
    }

    playEmp() {
      if (this.muted) return;
      this.init();
      if (!this.ctx || !this.compressor) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(980, now);
        osc.frequency.exponentialRampToValueAtTime(55, now + 0.48);
        gain.gain.setValueAtTime(0.26, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
        osc.connect(gain);
        gain.connect(this.compressor);
        osc.start(now);
        osc.stop(now + 0.5);
      } catch (e) {}
    }

    playPowerup() {
      if (this.muted) return;
      this.init();
      if (!this.ctx || !this.compressor) return;
      try {
        const freqs = [440, 554.37, 659.25, 880];
        const base = this.ctx.currentTime;
        for (let i = 0; i < freqs.length; i++) {
          const t = base + i * 0.048;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freqs[i], t);
          gain.gain.setValueAtTime(0.11, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
          osc.connect(gain);
          gain.connect(this.compressor);
          osc.start(t);
          osc.stop(t + 0.13);
        }
      } catch (e) {}
    }

    playLevelClear() {
      if (this.muted) return;
      this.init();
      if (!this.ctx || !this.compressor) return;
      try {
        const notes = [523.25, 659.25, 783.99, 1046.5];
        const base = this.ctx.currentTime;
        for (let i = 0; i < notes.length; i++) {
          const t = base + i * 0.08;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(notes[i], t);
          gain.gain.setValueAtTime(0.13, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
          osc.connect(gain);
          gain.connect(this.compressor);
          osc.start(t);
          osc.stop(t + 0.25);
        }
      } catch (e) {}
    }

    // Lookahead Procedural Synthwave BGM (shared filter, zero drift, auto-pauses when hidden)
    startBGM() {
      if (this.muted || !this.bgmEnabled || document.hidden) return;
      this.init();
      if (!this.ctx || !this.compressor || this.bgmTimer) return;

      try {
        if (!this.bgmGain) {
          this.bgmFilter = this.ctx.createBiquadFilter();
          this.bgmFilter.type = 'lowpass';
          this.bgmFilter.frequency.value = 920;
          this.bgmFilter.Q.value = 1.6;

          this.bgmGain = this.ctx.createGain();
          this.bgmGain.gain.value = 0.05;

          this.bgmFilter.connect(this.bgmGain);
          this.bgmGain.connect(this.compressor);
        } else {
          this.bgmGain.gain.setTargetAtTime(0.05, this.ctx.currentTime, 0.04);
        }

        const chords = [
          [220.0, 261.63, 329.63, 440.0],   // Am
          [174.61, 220.0, 261.63, 349.23],  // F
          [130.81, 164.81, 196.0, 261.63],  // C
          [196.0, 246.94, 293.66, 392.0]    // G
        ];
        const bassRoots = [110.0, 87.31, 65.41, 98.0];
        const stepDur = 0.185; // ~162 BPM 8th notes

        this.bgmNextNoteTime = this.ctx.currentTime + 0.04;

        const schedule = () => {
          if (this.muted || !this.bgmEnabled || !this.ctx || document.hidden) {
            this.stopBGM();
            return;
          }
          const lookahead = this.ctx.currentTime + 0.14;
          while (this.bgmNextNoteTime < lookahead) {
            const t = this.bgmNextNoteTime;
            const chordIdx = Math.floor(this.bgmStep / 8) % chords.length;
            const arpFreq = chords[chordIdx][this.bgmStep % 4];

            // Arp voice
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(arpFreq, t);
            g.gain.setValueAtTime(0.55, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
            osc.connect(g);
            g.connect(this.bgmFilter);
            osc.start(t);
            osc.stop(t + 0.16);

            // Synthwave pulsing sub-bass every 2 steps
            if (this.bgmStep % 2 === 0) {
              const bass = this.ctx.createOscillator();
              const bg = this.ctx.createGain();
              bass.type = 'triangle';
              bass.frequency.setValueAtTime(bassRoots[chordIdx], t);
              bg.gain.setValueAtTime(0.85, t);
              bg.gain.exponentialRampToValueAtTime(0.001, t + 0.30);
              bass.connect(bg);
              bg.connect(this.bgmFilter);
              bass.start(t);
              bass.stop(t + 0.32);
            }

            this.bgmStep++;
            this.bgmNextNoteTime += stepDur;
          }
        };

        this.bgmTimer = setInterval(schedule, 60);
      } catch (e) {}
    }

    stopBGM() {
      if (this.bgmTimer) {
        clearInterval(this.bgmTimer);
        this.bgmTimer = null;
      }
      if (this.bgmGain && this.ctx) {
        try {
          this.bgmGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.03);
        } catch (e) {}
      }
    }

    toggleBGM() {
      this.bgmEnabled = !this.bgmEnabled;
      storage.set('bgmEnabled', this.bgmEnabled, true);
      if (this.bgmEnabled && !this.muted) {
        this.startBGM();
      } else {
        this.stopBGM();
      }
      return this.bgmEnabled;
    }
  }

  const sound = new SoundEngine();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (sound.bgmTimer) {
        sound.bgmPausedByVisibility = true;
        sound.stopBGM();
      }
    } else if (sound.bgmPausedByVisibility) {
      sound.bgmPausedByVisibility = false;
      if (sound.bgmEnabled && !sound.muted) {
        sound.startBGM();
      }
    }
  });

  AstroType.sound = sound;

  // ==========================================
  // 3. NON-BLOCKING COCKPIT VOICE ANNOUNCER
  //    Cached voice lookup + off-frame dispatch
  // ==========================================
  const cockpitVoice = {
    enabled: storage.get('voiceAnnouncerEnabled', true),
    lastSpokenMs: 0,
    cachedVoice: null,

    refreshVoice() {
      if (!('speechSynthesis' in window)) return;
      try {
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          this.cachedVoice =
            voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('id')) ||
            voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('en')) ||
            voices[0];
        }
      } catch (e) {}
    },

    speak(text) {
      if (!this.enabled || sound.muted) return;
      if (!('speechSynthesis' in window)) return;
      const now = performance.now();
      if (now - this.lastSpokenMs < 2400) return;
      this.lastSpokenMs = now;

      // Defer off the critical keystroke / render frame to prevent speech API main-thread jank
      setTimeout(() => {
        if (!this.enabled || sound.muted || document.hidden) return;
        try {
          if (!this.cachedVoice) this.refreshVoice();
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(text);
          u.rate = 1.15;
          u.pitch = 0.95;
          u.volume = 0.85;
          if (this.cachedVoice) u.voice = this.cachedVoice;
          window.speechSynthesis.speak(u);
        } catch (e) {}
      }, 0);
    }
  };

  if ('speechSynthesis' in window) {
    cockpitVoice.refreshVoice();
    if (typeof window.speechSynthesis.addEventListener === 'function') {
      window.speechSynthesis.addEventListener('voiceschanged', () => cockpitVoice.refreshVoice());
    }
  }

  AstroType.cockpitVoice = cockpitVoice;
})(window);

