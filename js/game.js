/* ==========================================================================
   AstroType v3.0 — Zero-Framedrop Canvas Engine, Combat Loop & UI Controller
   Created & Developed by YRZQ_WLDN
   ========================================================================== */
(function (global) {
  'use strict';

  const AT = global.AstroType;
  const {
    FINGER_MAP,
    ACADEMY_LESSONS,
    CAMPAIGN_SECTORS,
    WORD_BANKS,
    RANKS,
    SHIPS,
    getRankForXp,
    storage,
    sound,
    cockpitVoice
  } = AT;

  // ==========================================
  // 1. CANVAS & CACHED DOM REFERENCES
  // ==========================================
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
  const container = document.getElementById('canvasContainer');

  // 1:1 DPR-matched static nebula background cache
  const bgCanvas = document.createElement('canvas');
  const bgCtx = bgCanvas.getContext('2d', { alpha: false });

  // Cache ALL DOM elements once (zero repeated getElementById in hot paths)
  const dom = {
    hudLevelBadge: document.getElementById('hudLevelBadge'),
    hudWaveText: document.getElementById('hudWaveText'),
    hudWpm: document.getElementById('hudWpm'),
    hudCpm: document.getElementById('hudCpm'),
    hudAccuracy: document.getElementById('hudAccuracy'),
    hudCombo: document.getElementById('hudCombo'),
    hudMultiplier: document.getElementById('hudMultiplier'),
    hudScore: document.getElementById('hudScore'),
    hudEmpCount: document.getElementById('hudEmpCount'),
    btnEmpNova: document.getElementById('btnEmpNova'),
    empReadyDot: document.getElementById('empReadyDot'),
    hudShieldBar: document.getElementById('hudShieldBar'),
    hudShieldText: document.getElementById('hudShieldText'),
    hudProgressBar: document.getElementById('hudProgressBar'),
    hudProgressText: document.getElementById('hudProgressText'),
    hudActiveWord: document.getElementById('hudActiveWord'),
    wordTyped: document.getElementById('wordTyped'),
    wordNext: document.getElementById('wordNext'),
    wordRest: document.getElementById('wordRest'),
    wordEmpty: document.getElementById('wordEmpty'),
    hudFingerCoach: document.getElementById('hudFingerCoach'),
    coachFingerText: document.getElementById('coachFingerText'),
    wpmGaugeBar: document.getElementById('wpmGaugeBar'),
    speedCategoryBadge: document.getElementById('speedCategoryBadge'),
    hudBestWpm: document.getElementById('hudBestWpm'),
    hudPeakWpm: document.getElementById('hudPeakWpm'),
    hudGhostDelta: document.getElementById('hudGhostDelta'),
    empChargeBar: document.getElementById('empChargeBar'),
    empChargePct: document.getElementById('empChargePct'),
    hudActivePowerups: document.getElementById('hudActivePowerups'),
    fpsBadge: document.getElementById('fpsBadge'),
    fpsText: document.getElementById('fpsText'),
    hudProfileName: document.getElementById('hudProfileName'),
    hudProfileIcon: document.getElementById('hudProfileIcon'),
    mobileHiddenInput: document.getElementById('mobileHiddenInput'),
    virtualKeyboardSection: document.getElementById('virtualKeyboardSection'),
    virtualKeyboardRows: document.getElementById('virtualKeyboardRows'),
    nativeKbActiveIndicator: document.getElementById('nativeKbActiveIndicator'),
    btnToggleNumRow: document.getElementById('btnToggleNumRow'),
    iconSoundOn: document.getElementById('iconSoundOn'),
    iconSoundOff: document.getElementById('iconSoundOff'),
    // Modals
    modalStartMenu: document.getElementById('modalStartMenu'),
    modalPause: document.getElementById('modalPause'),
    modalResult: document.getElementById('modalResult'),
    modalProfile: document.getElementById('modalProfile'),
    modalCertView: document.getElementById('modalCertView'),
    modalSettings: document.getElementById('modalSettings'),
    // Pause modal info
    pauseModeLabel: document.getElementById('pauseModeLabel'),
    pauseStatsLabel: document.getElementById('pauseStatsLabel'),
    // Result modal elements
    resultBadge: document.getElementById('resultBadge'),
    resultTitle: document.getElementById('resultTitle'),
    resultRank: document.getElementById('resultRank'),
    resWpm: document.getElementById('resWpm'),
    resPeakWpm: document.getElementById('resPeakWpm'),
    resAccuracy: document.getElementById('resAccuracy'),
    resCpm: document.getElementById('resCpm'),
    resKills: document.getElementById('resKills'),
    resXpGained: document.getElementById('resXpGained'),
    resultFeedback: document.getElementById('resultFeedback'),
    resultWeakSection: document.getElementById('resultWeakSection'),
    resultWeakKeys: document.getElementById('resultWeakKeys'),
    btnResultNext: document.getElementById('btnResultNext'),
    btnResultRetry: document.getElementById('btnResultRetry')
  };

  // ==========================================
  // 2. PRE-RENDERED SPRITE ATLAS (ZERO SHADOWBLUR!)
  // ==========================================
  const glowSprites = {};
  const powerupSprites = {};

  function buildGlowSprite(hexColor) {
    const size = 48;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const g = c.getContext('2d');
    const half = size / 2;
    const grad = g.createRadialGradient(half, half, 1, half, half, half);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.24, hexColor);
    grad.addColorStop(0.55, hexColor + '55');
    grad.addColorStop(1, hexColor + '00');
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    return c;
  }

  function buildPowerupSprite(type) {
    const size = 44;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const g = c.getContext('2d');
    const cx = size / 2;
    const cy = size / 2;

    const palette = {
      shield: { bg: '#064e3b', border: '#10b981', glow: '#34d399' },
      cryo: { bg: '#0c4a6e', border: '#38bdf8', glow: '#7dd3fc' },
      emp: { bg: '#3b0764', border: '#a855f7', glow: '#d8b4fe' },
      double: { bg: '#78350f', border: '#f59e0b', glow: '#fde047' }
    }[type];

    // Outer glow
    const grad = g.createRadialGradient(cx, cy, 8, cx, cy, 22);
    grad.addColorStop(0, palette.border + '66');
    grad.addColorStop(1, palette.border + '00');
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);

    // Badge circle
    g.fillStyle = palette.bg;
    g.strokeStyle = palette.border;
    g.lineWidth = 2;
    g.beginPath();
    g.arc(cx, cy, 13, 0, Math.PI * 2);
    g.fill();
    g.stroke();

    // Crisp vector symbol
    g.fillStyle = palette.glow;
    g.strokeStyle = palette.glow;
    g.lineWidth = 2;
    g.lineCap = 'round';
    g.lineJoin = 'round';

    if (type === 'shield') {
      g.beginPath();
      g.moveTo(cx, cy - 7);
      g.lineTo(cx + 6, cy - 4);
      g.lineTo(cx + 5, cy + 2);
      g.lineTo(cx, cy + 7);
      g.lineTo(cx - 5, cy + 2);
      g.lineTo(cx - 6, cy - 4);
      g.closePath();
      g.fill();
    } else if (type === 'cryo') {
      for (let i = 0; i < 3; i++) {
        const a = (i * Math.PI) / 3;
        g.beginPath();
        g.moveTo(cx - Math.cos(a) * 7, cy - Math.sin(a) * 7);
        g.lineTo(cx + Math.cos(a) * 7, cy + Math.sin(a) * 7);
        g.stroke();
      }
      g.beginPath();
      g.arc(cx, cy, 2.5, 0, Math.PI * 2);
      g.fill();
    } else if (type === 'emp') {
      g.beginPath();
      g.moveTo(cx + 2, cy - 8);
      g.lineTo(cx - 5, cy + 1);
      g.lineTo(cx, cy + 1);
      g.lineTo(cx - 2, cy + 8);
      g.lineTo(cx + 5, cy - 1);
      g.lineTo(cx, cy - 1);
      g.closePath();
      g.fill();
    } else {
      g.font = '900 11px "JetBrains Mono", monospace';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText('2X', cx, cy + 0.5);
    }
    return c;
  }

  function initSprites() {
    glowSprites.cyan = buildGlowSprite('#22d3ee');
    glowSprites.orange = buildGlowSprite('#f97316');
    glowSprites.purple = buildGlowSprite('#a855f7');
    glowSprites.emerald = buildGlowSprite('#10b981');
    glowSprites.rose = buildGlowSprite('#fb7185');
    glowSprites.amber = buildGlowSprite('#fbbf24');
    glowSprites.white = buildGlowSprite('#f8fafc');

    powerupSprites.shield = buildPowerupSprite('shield');
    powerupSprites.cryo = buildPowerupSprite('cryo');
    powerupSprites.emp = buildPowerupSprite('emp');
    powerupSprites.double = buildPowerupSprite('double');
  }

  function getGlowForColor(hex) {
    if (hex === '#f97316' || hex === '#fb923c') return glowSprites.orange;
    if (hex === '#a855f7' || hex === '#c084fc') return glowSprites.purple;
    if (hex === '#10b981' || hex === '#34d399') return glowSprites.emerald;
    if (hex === '#f43f5e' || hex === '#fb7185') return glowSprites.rose;
    if (hex === '#fbbf24' || hex === '#f59e0b') return glowSprites.amber;
    return glowSprites.cyan;
  }

  // ==========================================
  // 3. OBJECT POOLS (ZERO GC PAUSES IN COMBAT)
  // ==========================================
  const MAX_PARTICLES = 180;
  const MAX_LASERS = 36;
  const MAX_SHOCKWAVES = 16;
  const MAX_FLOATING_TEXTS = 18;

  const particlePool = Array.from({ length: MAX_PARTICLES }, () => ({
    active: false, x: 0, y: 0, vx: 0, vy: 0, size: 2, color: '#22d3ee', alpha: 0, decay: 1, glow: null
  }));
  let particleCursor = 0;

  const laserPool = Array.from({ length: MAX_LASERS }, () => ({
    active: false, x1: 0, y1: 0, x2: 0, y2: 0, color: '#06b6d4', width: 6, alpha: 0
  }));
  let laserCursor = 0;

  const shockwavePool = Array.from({ length: MAX_SHOCKWAVES }, () => ({
    active: false, x: 0, y: 0, radius: 0, maxRadius: 50, color: '#38bdf8', alpha: 0, lineWidth: 2.5
  }));
  let shockwaveCursor = 0;

  const textPool = Array.from({ length: MAX_FLOATING_TEXTS }, () => ({
    active: false, text: '', x: 0, y: 0, vy: -50, alpha: 0, color: '#22d3ee', size: 13
  }));
  let textCursor = 0;

  function clearPools() {
    for (let i = 0; i < MAX_PARTICLES; i++) particlePool[i].active = false;
    for (let i = 0; i < MAX_LASERS; i++) laserPool[i].active = false;
    for (let i = 0; i < MAX_SHOCKWAVES; i++) shockwavePool[i].active = false;
    for (let i = 0; i < MAX_FLOATING_TEXTS; i++) textPool[i].active = false;
  }

  // ==========================================
  // 4. CORE GAME STATE
  // ==========================================
  const state = {
    status: 'MENU', // 'MENU' | 'PLAYING' | 'PAUSED' | 'RESULT'
    gameMode: 'ACADEMY', // 'ACADEMY' | 'CAMPAIGN' | 'ENDLESS' | 'BLITZ' | 'CUSTOM' | 'WEAK_DRILL'
    activeLessonIdx: storage.get('lastAcademyIdx', 0),
    activeSectorIdx: storage.get('lastSectorIdx', 0),
    customWordList: [],
    customLabel: 'Latihan Kustom',

    // Combat & Stats
    score: 0,
    shield: 100,
    combo: 0,
    maxCombo: 0,
    multiplier: 1,
    empBombs: 1,
    empCharge: 0,
    kills: 0,
    bossSpawned: false,
    bossDefeated: false,

    // Powerup Timers (Delta-time driven, pause-safe!)
    cryoTimerMs: 0,
    doubleTimerMs: 0,
    waveBannerText: '',
    waveBannerTimerMs: 0,
    dangerFlash: 0,

    // Blitz Mode Timer (Delta-time driven, pause-safe!)
    blitzTimeLeftMs: 60000,

    // Endless Wave
    endlessWave: 1,
    endlessTargetKills: 15,

    // Accurate Typing Speed Diagnostics
    typingStarted: false,
    activeTypingMs: 0,
    correctChars: 0,
    totalKeystrokes: 0,
    recentHits: [], // timestamps in activeTypingMs for rolling burst WPM
    sessionWeakKeys: {},
    currentWpm: 0,
    currentCpm: 0,
    peakWpm: 0,
    bestWpm: storage.get('bestWpm', 0),
    highScore: storage.get('highScore', 0),

    // Persistent Profile & Hangar
    profileName: storage.get('profileName', 'Kadet Antariksa'),
    profileXp: storage.get('profileXp', 0),
    selectedShipId: storage.get('selectedShipId', 'vanguard'),
    totalCharsLifetime: storage.get('totalCharsLifetime', 0),
    totalKillsLifetime: storage.get('totalKillsLifetime', 0),
    totalKeystrokesLifetime: storage.get('totalKeystrokesLifetime', 0),
    totalCorrectLifetime: storage.get('totalCorrectLifetime', 0),
    weakKeys: storage.get('weakKeys', {}),
    academyCompleted: storage.get('academyCompleted', {}),
    campaignCompleted: storage.get('campaignCompleted', {}),
    endlessBestWave: storage.get('endlessBestWave', 0),
    endlessBestScore: storage.get('endlessBestScore', 0),
    blitzBestWpm: storage.get('blitzBestWpm', 0),
    blitzBestAcc: storage.get('blitzBestAcc', 100),

    // Daily Streak & Missions
    dailyStreakDays: storage.get('dailyStreakDays', 1),
    dailyLastDate: storage.get('dailyLastDate', ''),
    dailyKills: storage.get('dailyKills', 0),
    dailyBestWpm: storage.get('dailyBestWpm', 0),
    dailyEmpCount: storage.get('dailyEmpCount', 0),
    dailyRewardClaimed: storage.get('dailyRewardClaimed', false),

    // Preferences & Performance Quality
    hapticEnabled: storage.get('hapticEnabled', true),
    fingerCoachEnabled: storage.get('fingerCoachEnabled', true),
    qualityMode: storage.get('qualityMode', storage.get('turboMode', true) ? 'auto' : 'ultra'), // 'auto' | 'turbo' | 'ultra'
    autoReducedTier: false,
    showFps: storage.get('showFps', true),
    showNumRow: storage.get('showNumRow', false),
    nativeKbActive: false,

    // Viewport & Cached Font Metrics
    vw: 800,
    vh: 600,
    dpr: 1,
    isMobile: false,
    charWNormal: 7.8,
    charWLocked: 9.0,
    fontNormal: '800 13px "JetBrains Mono", monospace',
    fontLocked: '800 15px "JetBrains Mono", monospace',

    // Entities
    enemies: [],
    powerupDrops: [],
    starsFar: [],
    starsMid: [],
    starsNear: [],
    lockedEnemyId: null,
    nextEnemyId: 1,
    spawnTimerMs: 0,
    playerAngle: 0,
    targetPlayerAngle: 0,
    muzzleFlash: 0,
    wingToggle: 1,
    screenShake: 0,
    shipRecoil: 0,
    elapsedTimeSec: 0,
    hudTickAccumMs: 0,
    lastFrameMs: 0
  };

  // Cached Ship lookup
  function getCurrentShip() {
    for (let i = 0; i < SHIPS.length; i++) {
      if (SHIPS[i].id === state.selectedShipId) return SHIPS[i];
    }
    return SHIPS[0];
  }

  function isTurboEffective() {
    return state.qualityMode === 'turbo' || (state.qualityMode === 'auto' && state.autoReducedTier);
  }

  function triggerHaptic(type) {
    if (!state.hapticEnabled || !('vibrate' in navigator)) return;
    try {
      if (type === 'hit') navigator.vibrate(8);
      else if (type === 'miss') navigator.vibrate(35);
      else if (type === 'emp') navigator.vibrate([22, 30, 22]);
      else if (type === 'boss') navigator.vibrate([35, 45, 65]);
    } catch (e) {}
  }

  // ==========================================
  // 5. FONT METRIC CACHE & 1:1 STATIC BACKGROUND
  // ==========================================
  function measureFontMetrics() {
    const sizeN = state.isMobile ? 11 : 13;
    const sizeL = state.isMobile ? 13 : 15;
    state.fontNormal = `800 ${sizeN}px "JetBrains Mono", monospace`;
    state.fontLocked = `800 ${sizeL}px "JetBrains Mono", monospace`;

    ctx.font = state.fontNormal;
    state.charWNormal = ctx.measureText('MMMMMMMMMM').width / 10 || sizeN * 0.61;
    ctx.font = state.fontLocked;
    state.charWLocked = ctx.measureText('MMMMMMMMMM').width / 10 || sizeL * 0.61;
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      measureFontMetrics();
    });
  }

  function renderStaticBackground() {
    const w = state.vw;
    const h = state.vh;
    const dpr = state.dpr;

    bgCanvas.width = canvas.width;
    bgCanvas.height = canvas.height;
    bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Deep cosmos gradient
    const grad = bgCtx.createRadialGradient(
      w * 0.5, h * 0.34, 12,
      w * 0.5, h * 0.5, Math.max(w, h) * 0.88
    );
    grad.addColorStop(0, '#0b1630');
    grad.addColorStop(0.5, '#050a18');
    grad.addColorStop(1, '#02050d');
    bgCtx.fillStyle = grad;
    bgCtx.fillRect(0, 0, w, h);

    // Cyber Nebula Clouds (pre-baked once on resize!)
    const neb1 = bgCtx.createRadialGradient(w * 0.22, h * 0.24, 6, w * 0.22, h * 0.24, Math.min(w, h) * 0.48);
    neb1.addColorStop(0, 'rgba(6, 182, 212, 0.10)');
    neb1.addColorStop(1, 'rgba(6, 182, 212, 0)');
    bgCtx.fillStyle = neb1;
    bgCtx.fillRect(0, 0, w, h);

    const neb2 = bgCtx.createRadialGradient(w * 0.78, h * 0.46, 6, w * 0.78, h * 0.46, Math.min(w, h) * 0.44);
    neb2.addColorStop(0, 'rgba(168, 85, 247, 0.09)');
    neb2.addColorStop(1, 'rgba(168, 85, 247, 0)');
    bgCtx.fillStyle = neb2;
    bgCtx.fillRect(0, 0, w, h);

    // Subtle tactical radar grid
    bgCtx.strokeStyle = 'rgba(30, 41, 59, 0.22)';
    bgCtx.lineWidth = 1;
    const step = state.isMobile ? 48 : 64;
    bgCtx.beginPath();
    for (let x = step; x < w; x += step) {
      bgCtx.moveTo(x + 0.5, 0);
      bgCtx.lineTo(x + 0.5, h);
    }
    for (let y = step; y < h; y += step) {
      bgCtx.moveTo(0, y + 0.5);
      bgCtx.lineTo(w, y + 0.5);
    }
    bgCtx.stroke();

    // Subtle defense line pre-baked into background
    const shipY = h - (state.isMobile ? 34 : 44);
    bgCtx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
    bgCtx.lineWidth = 1;
    bgCtx.setLineDash([6, 6]);
    bgCtx.beginPath();
    bgCtx.moveTo(0, shipY - 18);
    bgCtx.lineTo(w, shipY - 18);
    bgCtx.stroke();
    bgCtx.setLineDash([]);
  }

  function initStars() {
    state.starsFar = [];
    state.starsMid = [];
    state.starsNear = [];
    const turbo = isTurboEffective();
    const total = turbo ? (state.isMobile ? 42 : 66) : (state.isMobile ? 64 : 108);
    const nFar = Math.floor(total * 0.5);
    const nMid = Math.floor(total * 0.34);
    const nNear = total - nFar - nMid;

    for (let i = 0; i < nFar; i++) {
      state.starsFar.push({ x: Math.random() * state.vw, y: Math.random() * state.vh, speed: 14 + Math.random() * 14 });
    }
    for (let i = 0; i < nMid; i++) {
      state.starsMid.push({ x: Math.random() * state.vw, y: Math.random() * state.vh, speed: 32 + Math.random() * 24 });
    }
    for (let i = 0; i < nNear; i++) {
      state.starsNear.push({ x: Math.random() * state.vw, y: Math.random() * state.vh, speed: 62 + Math.random() * 34 });
    }
  }

  function computeTargetDpr() {
    const raw = window.devicePixelRatio || 1;
    if (state.qualityMode === 'turbo') return Math.min(raw, state.isMobile ? 1.15 : 1.25);
    if (state.qualityMode === 'auto' && state.autoReducedTier) return Math.min(raw, 1.25);
    if (state.qualityMode === 'ultra') return Math.min(raw, 2);
    // Default auto: crisp 1.5 cap on dense screens saves 44% GPU fill-rate while staying razor sharp
    return Math.min(raw, 1.5);
  }

  let resizeRaf = 0;
  function resizeCanvas() {
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const w = Math.max(280, Math.floor(rect.width));
    const h = Math.max(160, Math.floor(rect.height));
    state.isMobile = window.innerWidth < 640;
    const dpr = computeTargetDpr();

    const needsResize = w !== state.vw || h !== state.vh || dpr !== state.dpr;
    state.vw = w;
    state.vh = h;
    state.dpr = dpr;

    if (needsResize || canvas.width !== Math.floor(w * dpr)) {
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      measureFontMetrics();
      renderStaticBackground();
      if (state.starsFar.length === 0) initStars();
    }
  }

  function scheduleResize() {
    if (resizeRaf) return;
    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = 0;
      resizeCanvas();
    });
  }

  window.addEventListener('resize', scheduleResize, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', scheduleResize, { passive: true });
  }

  // ==========================================
  // 6. ERGONOMIC VIRTUAL KEYBOARD (ZERO REFLOW!)
  // ==========================================
  const keyBtnMap = new Map();
  let lastHintedKeyBtn = null;

  const KEY_LAYOUT_NUMS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-'];
  const KEY_LAYOUT_LETTERS = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
    ['LEPAS', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '-', 'HAPUS']
  ];

  function shouldAutoShowNumRow() {
    if (state.showNumRow) return true;
    if (state.gameMode === 'ACADEMY' && ACADEMY_LESSONS[state.activeLessonIdx]?.needsNumRow) return true;
    if (state.gameMode === 'CAMPAIGN' && CAMPAIGN_SECTORS[state.activeSectorIdx]?.needsNumRow) return true;
    return false;
  }

  function renderVirtualKeyboard() {
    const rowsEl = dom.virtualKeyboardRows;
    if (!rowsEl) return;
    rowsEl.innerHTML = '';
    keyBtnMap.clear();
    lastHintedKeyBtn = null;

    const showNums = shouldAutoShowNumRow();

    if (dom.btnToggleNumRow) {
      dom.btnToggleNumRow.className = showNums
        ? 'px-2 py-0.5 rounded bg-amber-500/25 border border-amber-400 text-[10px] text-amber-300 font-mono-game font-bold flex items-center gap-1 transition active:scale-95'
        : 'px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] text-slate-400 font-mono-game font-bold flex items-center gap-1 transition active:scale-95';
    }

    const rowsToRender = [];
    if (showNums) {
      rowsToRender.push({ type: 'nums', keys: KEY_LAYOUT_NUMS });
    }
    KEY_LAYOUT_LETTERS.forEach((row) => {
      rowsToRender.push({ type: 'letters', keys: row });
    });

    const frag = document.createDocumentFragment();

    rowsToRender.forEach((rObj) => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'flex justify-center gap-1 w-full';

      rObj.keys.forEach((char) => {
        // Avoid duplicating '-' when number row is shown
        if (rObj.type === 'letters' && char === '-' && showNums) return;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.dataset.key = char.toLowerCase();

        if (char === 'LEPAS') {
          btn.className = 'key-btn px-2 sm:px-3 h-8 sm:h-9 rounded-md bg-slate-800/95 border border-amber-500/60 text-amber-300 font-mono-game font-bold text-[10px] sm:text-xs shrink-0 flex items-center justify-center';
          btn.textContent = 'ESC';
          btn.title = 'Lepas Target (Esc)';
          btn.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            flashVirtualKey('lepas', 'normal');
            clearLockedTarget();
          });
          keyBtnMap.set('lepas', btn);
          keyBtnMap.set('escape', btn);
        } else if (char === 'HAPUS') {
          btn.className = 'key-btn px-2 sm:px-3 h-8 sm:h-9 rounded-md bg-slate-800/95 border border-rose-500/60 text-rose-300 font-mono-game font-bold text-[11px] sm:text-xs shrink-0 flex items-center justify-center';
          btn.textContent = '⌫';
          btn.title = 'Lepas Target';
          btn.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            flashVirtualKey('hapus', 'normal');
            clearLockedTarget();
          });
          keyBtnMap.set('hapus', btn);
          keyBtnMap.set('backspace', btn);
        } else {
          const info = FINGER_MAP[char.toLowerCase()];
          const isNum = rObj.type === 'nums';
          const borderClass = info ? info.css : 'border-slate-700';

          btn.className = `key-btn flex-1 max-w-[46px] ${isNum ? 'h-6 sm:h-7 text-[10px] sm:text-xs' : 'h-8 sm:h-9 text-xs sm:text-sm'} rounded-md bg-slate-900/95 border ${borderClass} font-mono-game font-bold uppercase text-slate-100 flex items-center justify-center`;
          btn.textContent = char;

          btn.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            if (state.status === 'PLAYING') {
              // handleCharacterInput triggers hit/miss flash once (no duplicate reflow!)
              handleCharacterInput(char);
            } else {
              flashVirtualKey(char, 'normal');
            }
          });
          keyBtnMap.set(char.toLowerCase(), btn);
        }
        rowDiv.appendChild(btn);
      });
      frag.appendChild(rowDiv);
    });

    // Ergonomic Bottom Thumb Bar (EMP + SPACE/EMP + Native HP Keyboard)
    const bottomRow = document.createElement('div');
    bottomRow.className = 'flex items-center justify-between gap-1.5 w-full mt-0.5';

    const empBtn = document.createElement('button');
    empBtn.type = 'button';
    empBtn.dataset.key = 'emp';
    empBtn.className = 'key-btn px-2.5 sm:px-4 h-8 sm:h-9 rounded-md bg-indigo-950/95 border border-cyan-400/60 text-cyan-300 font-mono-game font-bold text-[11px] sm:text-xs shrink-0 flex items-center gap-1';
    empBtn.innerHTML = `<span>⚡ EMP</span> <span id="kbEmpBadge" class="px-1 rounded bg-cyan-500/30 text-[10px] text-cyan-200">${state.empBombs}</span>`;
    empBtn.title = 'Ledakkan Gelombang Nova EMP (Spasi)';
    empBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      flashVirtualKey('emp', 'normal');
      triggerEmpNova();
    });
    keyBtnMap.set('emp', empBtn);
    bottomRow.appendChild(empBtn);

    const spaceBtn = document.createElement('button');
    spaceBtn.type = 'button';
    spaceBtn.dataset.key = ' ';
    spaceBtn.className = 'key-btn flex-1 h-8 sm:h-9 rounded-md bg-slate-900/95 border border-cyan-500/50 text-cyan-300 font-mono-game font-bold text-xs sm:text-sm flex items-center justify-center tracking-widest';
    spaceBtn.innerHTML = '<span class="text-slate-400 text-[10px] sm:text-xs uppercase font-semibold tracking-wider">⚡ SPASI • LEDAKKAN EMP</span>';
    spaceBtn.title = 'Tekan Spasi untuk Ledakkan EMP Nova';
    spaceBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      flashVirtualKey(' ', 'normal');
      if (state.status === 'PLAYING') {
        triggerEmpNova();
      }
    });
    keyBtnMap.set(' ', spaceBtn);
    bottomRow.appendChild(spaceBtn);

    const hpBtn = document.createElement('button');
    hpBtn.type = 'button';
    hpBtn.className = 'key-btn btn-trigger-native-kb px-2.5 sm:px-3 h-8 sm:h-9 rounded-md bg-emerald-950/90 border border-emerald-400/50 text-emerald-300 font-mono-game font-bold text-[11px] sm:text-xs shrink-0 flex items-center gap-1 active:scale-95';
    hpBtn.innerHTML = '<span>📱</span> <span class="hidden xs:inline">HP</span>';
    hpBtn.title = 'Gunakan Keyboard Bawaan Ponsel (Gboard / iOS)';
    hpBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      enableNativeKeyboardMode();
    });
    bottomRow.appendChild(hpBtn);

    frag.appendChild(bottomRow);
    rowsEl.appendChild(frag);
    dom.kbEmpBadge = document.getElementById('kbEmpBadge');
    updateNextKeyHint();
  }

  // ZERO-REFLOW, ZERO-DOM-ALLOCATION virtual key feedback!
  function flashVirtualKey(rawChar, type) {
    if (!rawChar) return;
    if (dom.virtualKeyboardSection && dom.virtualKeyboardSection.classList.contains('hidden')) return;

    const char = rawChar.toLowerCase();
    let targetKey = char;
    if (char === 'escape' || char === 'tab') targetKey = 'lepas';
    else if (char === 'backspace' || char === 'hapus') targetKey = 'hapus';
    else if (char === ' ' || char === 'space' || char === 'spacebar') targetKey = ' ';

    const btn = keyBtnMap.get(targetKey) || keyBtnMap.get(char);
    if (!btn) return;

    const cls = type === 'hit' ? 'key-hit' : type === 'miss' ? 'key-miss' : 'key-pressed';
    btn.classList.remove('key-pressed', 'key-hit', 'key-miss');
    btn.classList.add(cls);

    // Compositor-only transform pop via WAAPI (zero layout reflow!)
    if (btn.animate) {
      if (btn._popAnim) btn._popAnim.cancel();
      const kf =
        type === 'miss'
          ? [{ transform: 'translateY(2px) scale(0.94)' }, { transform: 'translateY(0) scale(1)' }]
          : [{ transform: 'translateY(-3px) scale(1.10)' }, { transform: 'translateY(0) scale(1)' }];
      btn._popAnim = btn.animate(kf, { duration: 150, easing: 'cubic-bezier(0.2, 0.9, 0.3, 1)' });
    }

    clearTimeout(btn._flashTimer);
    btn._flashTimer = setTimeout(() => {
      btn.classList.remove('key-pressed', 'key-hit', 'key-miss');
    }, 150);
  }

  let lastCoachKey = '';
  function updateNextKeyHint() {
    if (dom.hudFingerCoach) {
      dom.hudFingerCoach.style.display = state.fingerCoachEnabled ? '' : 'none';
    }

    if (state.status !== 'PLAYING') {
      if (lastHintedKeyBtn) {
        lastHintedKeyBtn.classList.remove('key-hint');
        lastHintedKeyBtn = null;
      }
      if (dom.coachFingerText && lastCoachKey !== 'IDLE') {
        lastCoachKey = 'IDLE';
        dom.coachFingerText.textContent = 'Siaga Tempur';
      }
      return;
    }

    const locked = getLockedEnemy();
    let nextChar = '';
    if (locked && locked.typedIndex < locked.word.length) {
      nextChar = locked.word[locked.typedIndex].toLowerCase();
    }

    const nextBtn = nextChar ? keyBtnMap.get(nextChar) || null : null;
    if (lastHintedKeyBtn !== nextBtn) {
      if (lastHintedKeyBtn) lastHintedKeyBtn.classList.remove('key-hint');
      if (nextBtn) nextBtn.classList.add('key-hint');
      lastHintedKeyBtn = nextBtn;
    }

    const coachKey = nextChar || 'SELECT';
    if (dom.coachFingerText && coachKey !== lastCoachKey) {
      lastCoachKey = coachKey;
      if (nextChar) {
        const fInfo = FINGER_MAP[nextChar];
        if (fInfo) {
          dom.coachFingerText.innerHTML = `<span style="color:${fInfo.color}">${fInfo.hand}: ${fInfo.finger}</span> → <strong class="text-white bg-slate-800 px-1 rounded">${nextChar.toUpperCase()}</strong>`;
        } else {
          dom.coachFingerText.textContent = `Huruf: ${nextChar.toUpperCase()}`;
        }
      } else {
        dom.coachFingerText.textContent = 'Pilih musuh target';
      }
    }
  }

  // ==========================================
  // 7. MENU & MODAL RENDERING
  // ==========================================
  function renderAcademyCards() {
    const box = document.getElementById('academyCardsContainer');
    if (!box) return;
    box.innerHTML = '';

    let completedCount = 0;
    const frag = document.createDocumentFragment();

    ACADEMY_LESSONS.forEach((lesson, idx) => {
      const isSelected = state.gameMode === 'ACADEMY' && state.activeLessonIdx === idx;
      const saveInfo = state.academyCompleted[lesson.id];
      if (saveInfo) completedCount++;

      const card = document.createElement('div');
      card.className = `cursor-pointer rounded-xl p-3 border transition-colors flex flex-col justify-between ${
        isSelected
          ? 'bg-slate-800/95 border-cyan-400 ring-2 ring-cyan-400/40 shadow-lg'
          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
      }`;

      const stars = saveInfo ? saveInfo.stars || 0 : 0;
      const starsHtml = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
      const bestWpmTag = saveInfo && saveInfo.wpm ? ` • ${saveInfo.wpm} WPM` : '';

      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between gap-1 mb-1">
            <span class="text-[10px] font-mono-game font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">${lesson.code}</span>
            <span class="text-xs text-amber-300">${starsHtml}</span>
          </div>
          <h4 class="font-bold text-sm text-white">${lesson.title}</h4>
          <p class="text-[11px] font-medium text-cyan-300 mt-0.5">${lesson.subtitle}</p>
          <p class="text-[10px] text-slate-400 mt-1 leading-snug">${lesson.desc}</p>
        </div>
        <div class="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
          <span class="text-slate-400">${lesson.targetKills} Target${bestWpmTag}</span>
          <span class="font-bold ${isSelected ? 'text-cyan-300' : 'text-slate-400'}">${isSelected ? 'Dipilih ✓' : 'Pilih'}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        state.gameMode = 'ACADEMY';
        state.activeLessonIdx = idx;
        storage.set('lastAcademyIdx', idx);
        renderAcademyCards();
        updateLaunchButtonLabel();
      });
      card.addEventListener('dblclick', () => {
        state.gameMode = 'ACADEMY';
        state.activeLessonIdx = idx;
        storage.set('lastAcademyIdx', idx);
        startGame();
      });
      frag.appendChild(card);
    });

    box.appendChild(frag);
    const badge = document.getElementById('academyProgressBadge');
    if (badge) badge.textContent = `${completedCount}/12 Modul Selesai`;
  }

  function renderCampaignCards() {
    const box = document.getElementById('campaignCardsContainer');
    if (!box) return;
    box.innerHTML = '';

    let clearedCount = 0;
    const frag = document.createDocumentFragment();

    CAMPAIGN_SECTORS.forEach((sec, idx) => {
      const isSelected = state.gameMode === 'CAMPAIGN' && state.activeSectorIdx === idx;
      const saveInfo = state.campaignCompleted[sec.id];
      if (saveInfo) clearedCount++;
      const stars = saveInfo ? saveInfo.stars || 0 : 0;
      const starsHtml = stars > 0 ? '⭐'.repeat(stars) + '☆'.repeat(3 - stars) : `${sec.targetKills} Musuh`;

      const card = document.createElement('div');
      card.className = `cursor-pointer rounded-xl p-3 border transition-colors flex flex-col justify-between ${
        isSelected
          ? 'bg-slate-800/95 border-purple-400 ring-2 ring-purple-400/40 shadow-lg'
          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
      }`;

      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between gap-1 mb-1">
            <span class="text-[10px] font-mono-game font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">SEKTOR ${idx + 1}</span>
            <span class="text-[10px] font-mono-game ${stars > 0 ? 'text-amber-300' : 'text-slate-400'}">${starsHtml}</span>
          </div>
          <h4 class="font-bold text-sm text-white">${sec.name}</h4>
          <p class="text-[11px] font-medium text-purple-300 mt-0.5">${sec.subtitle}</p>
        </div>
        <div class="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
          <span class="text-slate-400">Boss: <code class="text-rose-300 font-mono-game">${sec.bossWord}</code></span>
          <span class="font-bold ${isSelected ? 'text-purple-300' : 'text-slate-400'}">${isSelected ? 'Dipilih ✓' : 'Pilih'}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        state.gameMode = 'CAMPAIGN';
        state.activeSectorIdx = idx;
        storage.set('lastSectorIdx', idx);
        renderCampaignCards();
        updateLaunchButtonLabel();
      });
      card.addEventListener('dblclick', () => {
        state.gameMode = 'CAMPAIGN';
        state.activeSectorIdx = idx;
        storage.set('lastSectorIdx', idx);
        startGame();
      });
      frag.appendChild(card);
    });

    box.appendChild(frag);
    const campBadge = document.getElementById('campaignProgressBadge');
    if (campBadge) campBadge.textContent = `${clearedCount}/${CAMPAIGN_SECTORS.length} Sektor Aman`;
  }

  function renderHangarCards() {
    const box = document.getElementById('hangarShipsList');
    if (!box) return;
    box.innerHTML = '';
    const playerRank = getRankForXp(state.profileXp);
    const playerLvl = playerRank.level;

    SHIPS.forEach((ship) => {
      const unlocked = playerLvl >= ship.unlockLevel;
      const isEquipped = state.selectedShipId === ship.id;

      const card = document.createElement('div');
      card.className = `p-3 rounded-xl border transition-colors flex flex-col justify-between ${
        isEquipped
          ? 'bg-slate-900/95 border-cyan-400 ring-1 ring-cyan-400/50 glow-cyan'
          : unlocked
          ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
          : 'bg-slate-950/70 border-slate-900 opacity-65'
      }`;

      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between gap-2 mb-1.5">
            <div class="flex items-center gap-2">
              <span class="w-3.5 h-3.5 rounded-full" style="background:${ship.laserColor}; box-shadow: 0 0 8px ${ship.laserColor}"></span>
              <h5 class="font-sci-fi font-bold text-xs sm:text-sm text-white">${ship.name}</h5>
            </div>
            <span class="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
              isEquipped
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                : unlocked
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }">
              ${isEquipped ? 'DIPAKAI' : unlocked ? 'TERBUKA' : 'LV ' + ship.unlockLevel}
            </span>
          </div>
          <p class="text-[11px] text-slate-400 mb-2 leading-relaxed">${ship.desc}</p>
          <div class="flex items-center gap-2 text-[10px] text-slate-400">
            <span>Senjata: <strong style="color:${ship.laserColor}">${ship.weaponLabel}</strong></span>
            <span>• Lambung: <strong style="color:${ship.hullColor}">Baja Mk.${ship.unlockLevel}</strong></span>
          </div>
        </div>
        <div class="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-end">
          ${
            isEquipped
              ? '<span class="text-xs font-bold text-cyan-400">✓ Sedang Dipakai</span>'
              : unlocked
              ? `<button type="button" class="btn-equip-ship px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition" data-ship-id="${ship.id}">Pakai Kapal</button>`
              : `<span class="text-[10px] text-rose-400 font-mono">Buka di Level ${ship.unlockLevel} (Saat ini LV ${playerLvl})</span>`
          }
        </div>
      `;
      box.appendChild(card);
    });

    box.querySelectorAll('.btn-equip-ship').forEach((btn) => {
      btn.addEventListener('click', () => {
        equipShip(btn.getAttribute('data-ship-id'));
      });
    });
  }

  function equipShip(shipId) {
    state.selectedShipId = shipId;
    storage.set('selectedShipId', shipId, true);
    renderHangarCards();
    const ship = getCurrentShip();
    addFloatingText(`Kapal Terpasang: ${ship.name}`, state.vw / 2, 70, ship.laserColor, 13);
    cockpitVoice.speak(`Kapal ${ship.name} siap tempur!`);
  }

  function checkDailyReset() {
    const today = new Date().toISOString().slice(0, 10);
    if (state.dailyLastDate !== today) {
      if (state.dailyLastDate) {
        const last = new Date(state.dailyLastDate);
        const curr = new Date(today);
        const diffDays = Math.round((curr - last) / 86400000);
        if (diffDays === 1) state.dailyStreakDays += 1;
        else if (diffDays > 1) state.dailyStreakDays = 1;
      } else {
        state.dailyStreakDays = 1;
      }
      state.dailyLastDate = today;
      state.dailyKills = 0;
      state.dailyBestWpm = 0;
      state.dailyEmpCount = 0;
      state.dailyRewardClaimed = false;

      storage.set('dailyStreakDays', state.dailyStreakDays);
      storage.set('dailyLastDate', state.dailyLastDate);
      storage.set('dailyKills', 0);
      storage.set('dailyBestWpm', 0);
      storage.set('dailyEmpCount', 0);
      storage.set('dailyRewardClaimed', false, true);
    }
  }

  function renderDailyMissions() {
    checkDailyReset();
    const box = document.getElementById('dailyMissionsContainer');
    const streakBadge = document.getElementById('missionsStreakBadge');
    if (streakBadge) streakBadge.textContent = `${state.dailyStreakDays} HARI`;
    if (!box) return;

    const missions = [
      { title: 'Hancurkan 25 Kapal Musuh', current: state.dailyKills, goal: 25, icon: '🎯' },
      { title: 'Capai Kecepatan 35+ WPM', current: state.dailyBestWpm, goal: 35, icon: '⚡' },
      { title: 'Gunakan 2 Bom EMP Nova', current: state.dailyEmpCount, goal: 2, icon: '💥' }
    ];

    let allDone = true;
    box.innerHTML = '';
    missions.forEach((m) => {
      const isDone = m.current >= m.goal;
      if (!isDone) allDone = false;
      const pct = Math.min(100, Math.round((m.current / m.goal) * 100));

      const row = document.createElement('div');
      row.className = 'bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between gap-3';
      row.innerHTML = `
        <div class="flex items-center gap-2.5 flex-1 min-w-0">
          <span class="text-base">${m.icon}</span>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between text-xs font-semibold text-slate-200 mb-1">
              <span class="truncate">${m.title}</span>
              <span class="font-mono text-[11px] ${isDone ? 'text-emerald-400 font-bold' : 'text-slate-400'}">${Math.min(m.current, m.goal)}/${m.goal}</span>
            </div>
            <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r ${isDone ? 'from-emerald-400 to-teal-400' : 'from-cyan-400 to-blue-500'}" style="width:${pct}%"></div>
            </div>
          </div>
        </div>
        <span class="text-xs shrink-0 ${isDone ? 'text-emerald-400 font-black' : 'text-slate-500'}">
          ${isDone ? '✓ SELESAI' : 'AKTIF'}
        </span>
      `;
      box.appendChild(row);
    });

    if (allDone && !state.dailyRewardClaimed) {
      state.dailyRewardClaimed = true;
      state.profileXp += 300;
      storage.set('dailyRewardClaimed', true);
      storage.set('profileXp', state.profileXp, true);
      updateMenuHeaderStats();
      addFloatingText('🔥 Misi Harian Selesai! +300 XP', state.vw / 2, 80, '#f59e0b', 14);
      cockpitVoice.speak('Selamat! Seluruh misi harian berhasil diselesaikan.');
    }
  }

  function renderWeakKeysDrillUI() {
    const pillsBox = document.getElementById('menuWeakKeysPills');
    if (!pillsBox) return;
    pillsBox.innerHTML = '';
    const sorted = Object.entries(state.weakKeys).sort((a, b) => b[1] - a[1]).slice(0, 6);
    if (sorted.length === 0) {
      pillsBox.innerHTML = '<span class="text-xs text-slate-400 italic">Belum ada kesalahan ketik terdeteksi. Mulai bermain untuk merekam diagnostik huruf!</span>';
    } else {
      sorted.forEach(([k, count]) => {
        const pill = document.createElement('span');
        pill.className = 'px-2 py-0.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono-game text-xs font-bold';
        pill.textContent = `${k.toUpperCase()} (${count}x)`;
        pillsBox.appendChild(pill);
      });
    }
  }

  function startWeakKeysDrill(customKeysSource) {
    const sourceObj = customKeysSource && Object.keys(customKeysSource).length > 0 ? customKeysSource : state.weakKeys;
    const sorted = Object.entries(sourceObj)
      .sort((a, b) => b[1] - a[1])
      .map(([k]) => k.toLowerCase())
      .filter((k) => /^[a-z0-9\-;]$/.test(k));
    const targetKeys = sorted.length > 0 ? sorted.slice(0, 5) : ['a', 's', 'd', 'f', 'j', 'k', 'l'];

    const allPool = [...WORD_BANKS.indo, ...WORD_BANKS.eng, ...WORD_BANKS.coder];
    let drillWords = allPool.filter((w) => targetKeys.some((k) => w.includes(k)));
    if (drillWords.length < 10) {
      drillWords = drillWords.concat(
        targetKeys.flatMap((k) => [k + k + 'a', k + 'al', 'se' + k, k + 'or', k + 'it', 'de' + k])
      );
    }

    state.customWordList = drillWords;
    state.customLabel = `Lab Huruf Lemah [${targetKeys.join(',').toUpperCase()}]`;
    state.gameMode = 'WEAK_DRILL';
    dom.modalStartMenu.classList.add('hidden');
    dom.modalProfile.classList.add('hidden');
    dom.modalResult.classList.add('hidden');
    startGame();
    addFloatingText(`🎯 Latihan Fokus: [${targetKeys.join(', ').toUpperCase()}]`, state.vw / 2, 76, '#f43f5e', 13);
    cockpitVoice.speak('Laboratorium huruf lemah aktif. Fokus pada huruf target.');
  }

  function updateLaunchButtonLabel() {
    const btnLaunch = document.getElementById('btnLaunchActive');
    if (!btnLaunch) return;
    if (state.gameMode === 'ACADEMY') {
      const l = ACADEMY_LESSONS[state.activeLessonIdx];
      btnLaunch.textContent = `Mulai ${l.code}: ${l.title} ▶`;
    } else if (state.gameMode === 'CAMPAIGN') {
      const s = CAMPAIGN_SECTORS[state.activeSectorIdx];
      btnLaunch.textContent = `Mulai ${s.name} ▶`;
    } else if (state.gameMode === 'ENDLESS') {
      btnLaunch.textContent = 'Mulai Serbuan Tanpa Batas ▶';
    } else if (state.gameMode === 'BLITZ') {
      btnLaunch.textContent = 'Mulai Uji Kecepatan 60 Detik ▶';
    } else {
      btnLaunch.textContent = 'Mulai Sesi Latihan Kustom ▶';
    }
  }

  function switchTab(tabKey) {
    const tabs = ['Academy', 'Campaign', 'Endless', 'Blitz', 'Hangar', 'Missions', 'Custom'];
    tabs.forEach((t) => {
      const btn = document.getElementById(`tabBtn${t}`);
      const content = document.getElementById(`tabContent${t}`);
      const active = t.toUpperCase() === tabKey.toUpperCase();

      if (btn) {
        btn.className = `shrink-0 whitespace-nowrap py-2 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
          active
            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
            : 'text-slate-400 hover:text-slate-200 border border-transparent'
        }`;
      }
      if (content) content.classList.toggle('hidden', !active);
    });

    if (tabKey === 'Academy') state.gameMode = 'ACADEMY';
    else if (tabKey === 'Campaign') state.gameMode = 'CAMPAIGN';
    else if (tabKey === 'Endless') state.gameMode = 'ENDLESS';
    else if (tabKey === 'Blitz') state.gameMode = 'BLITZ';
    else if (tabKey === 'Custom') state.gameMode = 'CUSTOM';
    else if (tabKey === 'Hangar') renderHangarCards();
    else if (tabKey === 'Missions') {
      renderDailyMissions();
      renderWeakKeysDrillUI();
    }
    updateLaunchButtonLabel();
  }

  function updateMenuHeaderStats() {
    const rank = getRankForXp(state.profileXp);
    const elBest = document.getElementById('menuBestWpm');
    const elHigh = document.getElementById('menuHighScore');
    const elLvl = document.getElementById('menuCadetLevel');
    if (elBest) elBest.textContent = state.bestWpm;
    if (elHigh) elHigh.textContent = state.highScore.toLocaleString('id-ID');
    if (elLvl) elLvl.textContent = `LV ${rank.level}`;
    if (dom.hudProfileName) dom.hudProfileName.textContent = state.profileName;
    if (dom.hudProfileIcon) dom.hudProfileIcon.textContent = rank.avatar;
    const elEW = document.getElementById('endlessBestWave');
    const elES = document.getElementById('endlessBestScore');
    const elBW = document.getElementById('blitzBestWpm');
    const elBA = document.getElementById('blitzBestAcc');
    if (elEW) elEW.textContent = `${state.endlessBestWave} Wave`;
    if (elES) elES.textContent = state.endlessBestScore.toLocaleString('id-ID');
    if (elBW) elBW.textContent = `${state.blitzBestWpm} WPM`;
    if (elBA) elBA.textContent = `${state.blitzBestAcc}%`;
  }

  // ==========================================
  // 8. GAME LIFECYCLE (START / PAUSE / RESUME / FINISH)
  // ==========================================
  function getModeDisplayTitle() {
    if (state.gameMode === 'ACADEMY') {
      const l = ACADEMY_LESSONS[state.activeLessonIdx];
      return `${l.code} • ${l.title}`;
    }
    if (state.gameMode === 'CAMPAIGN') {
      return CAMPAIGN_SECTORS[state.activeSectorIdx].name;
    }
    if (state.gameMode === 'ENDLESS') return `SERBUAN • GELOMBANG ${state.endlessWave}`;
    if (state.gameMode === 'BLITZ') return 'SPEED BLITZ • 60 DETIK';
    if (state.gameMode === 'WEAK_DRILL') return state.customLabel;
    return state.customLabel || 'MODE KUSTOM';
  }

  function getModeBadgeText() {
    if (state.gameMode === 'ACADEMY') return ACADEMY_LESSONS[state.activeLessonIdx].code;
    if (state.gameMode === 'CAMPAIGN') return `SEKTOR ${state.activeSectorIdx + 1}`;
    if (state.gameMode === 'ENDLESS') return `ENDLESS W${state.endlessWave}`;
    if (state.gameMode === 'BLITZ') return `BLITZ ${Math.ceil(state.blitzTimeLeftMs / 1000)}S`;
    if (state.gameMode === 'WEAK_DRILL') return 'LAB LEMAH';
    return 'MODE KUSTOM';
  }

  function startGame() {
    sound.init();
    if (sound.bgmEnabled && !sound.muted) sound.startBGM();
    renderVirtualKeyboard();
    resizeCanvas();
    clearPools();

    state.status = 'PLAYING';
    state.score = 0;
    state.shield = 100;
    state.combo = 0;
    state.maxCombo = 0;
    state.multiplier = 1;
    state.empBombs = 1;
    state.empCharge = 0;
    state.kills = 0;
    state.bossSpawned = false;
    state.bossDefeated = false;
    state.cryoTimerMs = 0;
    state.doubleTimerMs = 0;
    state.dangerFlash = 0;

    state.blitzTimeLeftMs = 60000;
    if (state.gameMode === 'ENDLESS') {
      state.endlessWave = 1;
      state.endlessTargetKills = 15;
    }

    state.typingStarted = false;
    state.activeTypingMs = 0;
    state.correctChars = 0;
    state.totalKeystrokes = 0;
    state.recentHits = [];
    state.sessionWeakKeys = {};
    state.currentWpm = 0;
    state.currentCpm = 0;
    state.peakWpm = 0;

    state.enemies = [];
    state.powerupDrops = [];
    state.lockedEnemyId = null;
    state.spawnTimerMs = 450; // Smooth 0.9s intro before 2nd enemy
    state.playerAngle = 0;
    state.targetPlayerAngle = 0;
    state.muzzleFlash = 0;
    state.screenShake = 0;
    state.shipRecoil = 0;
    state.lastFrameMs = performance.now();

    state.waveBannerText = getModeDisplayTitle();
    state.waveBannerTimerMs = 1500;

    dom.modalStartMenu.classList.add('hidden');
    dom.modalPause.classList.add('hidden');
    dom.modalResult.classList.add('hidden');
    dom.modalProfile.classList.add('hidden');
    dom.modalCertView.classList.add('hidden');
    dom.modalSettings.classList.add('hidden');

    resetHudCache();
    updateHud(true);
    spawnEnemy();
    updateNextKeyHint();
  }

  function pauseGame() {
    if (state.status !== 'PLAYING') return;
    state.status = 'PAUSED';
    storage.flush();
    if (dom.pauseModeLabel) dom.pauseModeLabel.textContent = getModeDisplayTitle();
    if (dom.pauseStatsLabel) {
      const acc = state.totalKeystrokes > 0 ? Math.round((state.correctChars / state.totalKeystrokes) * 100) : 100;
      dom.pauseStatsLabel.textContent = `${state.currentWpm} WPM • Akurasi ${acc}% • Skor ${state.score.toLocaleString('id-ID')}`;
    }
    dom.modalPause.classList.remove('hidden');
    updateNextKeyHint();
  }

  function resumeGame() {
    if (state.status !== 'PAUSED') return;
    dom.modalPause.classList.add('hidden');
    dom.modalSettings.classList.add('hidden');
    state.status = 'PLAYING';
    state.lastFrameMs = performance.now();
    updateNextKeyHint();
    updateHud(true);
  }

  function openModeMenu() {
    if (state.status === 'PLAYING') {
      state.status = 'PAUSED';
    } else if (state.status !== 'PAUSED') {
      state.status = 'MENU';
    }
    storage.flush();
    updateMenuHeaderStats();
    renderAcademyCards();
    renderCampaignCards();
    renderHangarCards();
    renderDailyMissions();
    renderWeakKeysDrillUI();
    updateLaunchButtonLabel();
    dom.modalPause.classList.add('hidden');
    dom.modalResult.classList.add('hidden');
    dom.modalProfile.classList.add('hidden');
    dom.modalCertView.classList.add('hidden');
    dom.modalSettings.classList.add('hidden');
    dom.modalStartMenu.classList.remove('hidden');
    updateNextKeyHint();
  }

  function closeModeMenu() {
    dom.modalStartMenu.classList.add('hidden');
    // If the user opened Mode Menu mid-game and hits X, smoothly return to Pause modal instead of soft-locking!
    if (state.status === 'PAUSED') {
      dom.modalPause.classList.remove('hidden');
    }
  }

  // ==========================================
  // 9. SMART ENEMY SPAWNING & ANTI-OVERLAP
  // ==========================================
  function getActiveWordPool() {
    if (state.gameMode === 'ACADEMY') return ACADEMY_LESSONS[state.activeLessonIdx].words;
    if (state.gameMode === 'CAMPAIGN') return CAMPAIGN_SECTORS[state.activeSectorIdx].words;
    if (state.gameMode === 'CUSTOM' || state.gameMode === 'WEAK_DRILL') {
      return state.customWordList.length > 0 ? state.customWordList : WORD_BANKS.indo;
    }
    if (state.gameMode === 'BLITZ') return WORD_BANKS.indo.concat(WORD_BANKS.eng);
    // Endless
    if (state.endlessWave <= 2) return WORD_BANKS.indo.slice(0, 35);
    return WORD_BANKS.indo.concat(WORD_BANKS.eng);
  }

  function getTargetKillsGoal() {
    if (state.gameMode === 'ACADEMY') return ACADEMY_LESSONS[state.activeLessonIdx].targetKills;
    if (state.gameMode === 'CAMPAIGN') return CAMPAIGN_SECTORS[state.activeSectorIdx].targetKills;
    if (state.gameMode === 'ENDLESS') return state.endlessTargetKills;
    if (state.gameMode === 'BLITZ') return 999;
    return 20;
  }

  function getLockedEnemy() {
    if (state.lockedEnemyId === null) return null;
    for (let i = 0; i < state.enemies.length; i++) {
      if (state.enemies[i].id === state.lockedEnemyId) return state.enemies[i];
    }
    return null;
  }

  function pickClearLaneX(margin) {
    const usable = Math.max(80, state.vw - margin * 2);
    const laneCount = state.isMobile ? 4 : 6;
    const laneW = usable / laneCount;

    let bestLane = Math.floor(Math.random() * laneCount);
    let bestScore = -1e9;

    for (let l = 0; l < laneCount; l++) {
      const cx = margin + (l + 0.5) * laneW;
      let nearestTopY = 9999;
      for (let i = 0; i < state.enemies.length; i++) {
        const e = state.enemies[i];
        if (Math.abs(e.x - cx) < laneW * 0.75) {
          if (e.y < nearestTopY) nearestTopY = e.y;
        }
      }
      // Prefer lanes whose topmost enemy is farthest down (or empty) + small jitter
      const laneScore = nearestTopY + Math.random() * 45;
      if (laneScore > bestScore) {
        bestScore = laneScore;
        bestLane = l;
      }
    }
    return margin + (bestLane + 0.25 + Math.random() * 0.5) * laneW;
  }

  function spawnEnemy(customOpts) {
    const pool = getActiveWordPool();
    const targetGoal = getTargetKillsGoal();
    const maxOnScreen = state.isMobile ? 5 : 7;
    if (!customOpts && state.enemies.length >= maxOnScreen) return;

    // Campaign Boss Trigger (guaranteed, cannot be skipped by EMP!)
    if (
      state.gameMode === 'CAMPAIGN' &&
      !customOpts &&
      !state.bossSpawned &&
      state.kills >= targetGoal - 1
    ) {
      state.bossSpawned = true;
      const sec = CAMPAIGN_SECTORS[state.activeSectorIdx];
      const phaseList = sec.bossPhases ? sec.bossPhases.slice() : [pool[0], pool[1] || pool[0]];
      state.enemies.push({
        id: state.nextEnemyId++,
        word: sec.bossWord,
        typedIndex: 0,
        x: state.vw * 0.5,
        y: -46,
        vx: 0,
        vy: sec.baseSpeed * 24, // px/sec
        type: 'boss',
        radius: state.isMobile ? 28 : 35,
        color: '#f43f5e',
        phaseQueue: phaseList,
        maxPhases: phaseList.length + 1,
        hitFlash: 0,
        wobblePhase: Math.random() * Math.PI * 2
      });
      state.waveBannerText = '⚠ BOS INDUK ARMADA TIBA!';
      state.waveBannerTimerMs = 1700;
      addFloatingText('⚠ BOS ARMADA GALAKSI TIBA!', state.vw / 2, 82, '#fb7185', 15);
      cockpitVoice.speak('Peringatan! Kapal induk bos terdeteksi!');
      return;
    }

    // Prefer words with unused starting letters & not currently on screen
    const activeWords = new Set();
    const activeStarts = new Set();
    for (let i = 0; i < state.enemies.length; i++) {
      const e = state.enemies[i];
      activeWords.add(e.word);
      const first = e.word[e.typedIndex];
      if (first) activeStarts.add(first.toLowerCase());
    }

    let word = customOpts && customOpts.word;
    if (!word) {
      let candidates = pool.filter((w) => !activeWords.has(w) && !activeStarts.has(w[0].toLowerCase()));
      if (candidates.length === 0) candidates = pool.filter((w) => !activeWords.has(w));
      if (candidates.length === 0) candidates = pool;
      word = candidates[Math.floor(Math.random() * candidates.length)];
    }

    const margin = state.isMobile ? 48 : 80;
    const x = customOpts && customOpts.x !== undefined ? customOpts.x : pickClearLaneX(margin);
    const y = customOpts && customOpts.y !== undefined ? customOpts.y : -26;

    // Base vertical speed in px/sec (calibrated to match smooth 60fps feel)
    let speedFactor = 0.45;
    if (state.gameMode === 'ACADEMY') speedFactor = ACADEMY_LESSONS[state.activeLessonIdx].speed;
    else if (state.gameMode === 'CAMPAIGN') speedFactor = CAMPAIGN_SECTORS[state.activeSectorIdx].baseSpeed;
    else if (state.gameMode === 'ENDLESS') speedFactor = Math.min(1.15, 0.46 + state.endlessWave * 0.055);
    else if (state.gameMode === 'BLITZ') speedFactor = 0.56;

    let type = (customOpts && customOpts.type) || 'scout';
    if (!customOpts && state.gameMode !== 'ACADEMY') {
      const r = Math.random();
      if (r < 0.19) type = 'splitter';
      else if (r < 0.34 && word.length >= 7) type = 'cruiser';
      else if (r < 0.47) type = 'asteroid';
    }

    const colorMap = {
      scout: '#22d3ee',
      cruiser: '#c084fc',
      splitter: '#fbbf24',
      asteroid: '#f97316',
      mini: '#34d399'
    };
    const radiusMap = {
      scout: 16,
      cruiser: 22,
      splitter: 19,
      asteroid: 18,
      mini: 13
    };

    const baseRad = radiusMap[type] || 16;
    const rad = state.isMobile ? Math.round(baseRad * 0.85) : baseRad;
    const vyPxSec =
      customOpts && customOpts.vy !== undefined
        ? customOpts.vy
        : speedFactor * 60 * (0.86 + Math.random() * 0.26) * (type === 'asteroid' ? 1.24 : 1);

    state.enemies.push({
      id: state.nextEnemyId++,
      word,
      typedIndex: 0,
      x,
      y,
      vx: customOpts && customOpts.vx !== undefined ? customOpts.vx : (Math.random() - 0.5) * 18,
      vy: vyPxSec,
      type,
      radius: rad,
      color: colorMap[type] || '#22d3ee',
      hitFlash: 0,
      wobblePhase: Math.random() * Math.PI * 2,
      spin: 0
    });
  }

  // ==========================================
  // 10. POOLED FX SPAWNERS
  // ==========================================
  function spawnExplosion(x, y, color, count) {
    const turbo = isTurboEffective();
    const actualCount = turbo ? Math.max(4, Math.floor(count * 0.55)) : count;
    const glow = getGlowForColor(color);

    for (let i = 0; i < actualCount; i++) {
      const p = particlePool[particleCursor];
      particleCursor = (particleCursor + 1) % MAX_PARTICLES;

      const angle = Math.random() * Math.PI * 2;
      const speed = 55 + Math.random() * 195; // px/sec
      p.active = true;
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.size = 2.0 + Math.random() * 2.8;
      p.color = color;
      p.glow = glow;
      p.alpha = 1;
      p.decay = 1.45 + Math.random() * 1.4; // per sec
    }
  }

  function spawnLaser(x1, y1, x2, y2, color, width) {
    const l = laserPool[laserCursor];
    laserCursor = (laserCursor + 1) % MAX_LASERS;
    l.active = true;
    l.x1 = x1;
    l.y1 = y1;
    l.x2 = x2;
    l.y2 = y2;
    l.color = color;
    l.width = width || 6;
    l.alpha = 1;
  }

  function spawnShockwave(x, y, maxRadius, color, lineWidth) {
    const sw = shockwavePool[shockwaveCursor];
    shockwaveCursor = (shockwaveCursor + 1) % MAX_SHOCKWAVES;
    sw.active = true;
    sw.x = x;
    sw.y = y;
    sw.radius = 6;
    sw.maxRadius = maxRadius;
    sw.color = color;
    sw.alpha = 0.95;
    sw.lineWidth = lineWidth || 2.5;
  }

  function addFloatingText(text, x, y, color, size) {
    const ft = textPool[textCursor];
    textCursor = (textCursor + 1) % MAX_FLOATING_TEXTS;
    ft.active = true;
    ft.text = text;
    ft.x = Math.max(55, Math.min(state.vw - 55, x));
    ft.y = y;
    ft.vy = -48; // px/sec
    ft.alpha = 1;
    ft.color = color || '#22d3ee';
    ft.size = size || 13;
  }

  // ==========================================
  // 11. COMBAT RESOLUTION & POWER-UPS
  // ==========================================
  function getEffectiveMultiplier() {
    const base = Math.min(5, 1 + Math.floor(state.combo / 8));
    return state.doubleTimerMs > 0 ? base * 2 : base;
  }

  function clearLockedTarget() {
    if (state.lockedEnemyId === null) return;
    state.lockedEnemyId = null;
    updateNextKeyHint();
    updateHud();
  }

  function triggerEmpNova() {
    if (state.status !== 'PLAYING' || state.empBombs <= 0) return;
    state.empBombs--;
    state.dailyEmpCount++;
    storage.set('dailyEmpCount', state.dailyEmpCount);
    cockpitVoice.speak('Bom EMP Nova dilepaskan!');
    sound.playEmp();
    triggerHaptic('emp');
    state.screenShake = 14;

    const shipX = state.vw / 2;
    const shipY = state.vh - (state.isMobile ? 34 : 44);
    spawnShockwave(shipX, shipY, Math.max(state.vw, state.vh) * 1.05, '#38bdf8', 4);
    spawnShockwave(shipX, shipY, Math.max(state.vw, state.vh) * 0.65, '#a855f7', 2.5);

    const remaining = [];
    const targetGoal = getTargetKillsGoal();
    const mult = getEffectiveMultiplier();

    for (let i = 0; i < state.enemies.length; i++) {
      const enemy = state.enemies[i];
      spawnExplosion(enemy.x, enemy.y, enemy.color, 14);
      if (enemy.type === 'boss') {
        enemy.y = Math.max(40, enemy.y - 95);
        enemy.hitFlash = 1;
        remaining.push(enemy);
        addFloatingText('BOS TERDORONG!', enemy.x, enemy.y - 36, '#38bdf8', 13);
      } else {
        // In Campaign, cap non-boss EMP kills at targetGoal - 1 so Boss ALWAYS spawns!
        if (state.gameMode === 'CAMPAIGN' && !state.bossSpawned) {
          state.kills = Math.min(targetGoal - 1, state.kills + 1);
        } else {
          state.kills++;
        }
        state.totalKillsLifetime++;
        state.score += 120 * mult;
        addFloatingText(`+${120 * mult} EMP!`, enemy.x, enemy.y, '#38bdf8', 12);
      }
    }
    state.enemies = remaining;
    state.lockedEnemyId = null;

    // Immediately trigger boss if Campaign quota met
    if (state.gameMode === 'CAMPAIGN' && !state.bossSpawned && state.kills >= targetGoal - 1) {
      spawnEnemy();
    }

    checkCompletion();
    updateNextKeyHint();
    updateHud(true);
  }

  function spawnPowerupDrop(x, y) {
    if (state.gameMode === 'ACADEMY') return; // Keep Academy pure focus
    if (Math.random() > 0.34) return;
    const types = ['shield', 'cryo', 'emp', 'double'];
    const type = types[Math.floor(Math.random() * types.length)];
    state.powerupDrops.push({
      x,
      y,
      vy: 42, // px/sec
      type,
      phase: Math.random() * Math.PI * 2
    });
  }

  function applyPowerup(type) {
    sound.playPowerup();
    triggerHaptic('emp');
    const cx = state.vw / 2;
    const cy = state.vh - 82;

    if (type === 'shield') {
      state.shield = Math.min(100, state.shield + 30);
      addFloatingText('🛡️ PERISAI +30%!', cx, cy, '#10b981', 14);
    } else if (type === 'cryo') {
      state.cryoTimerMs = 6500; // Pause-safe, stackable/refreshable!
      addFloatingText('❄️ CRYO FREEZE (6.5s)!', cx, cy, '#38bdf8', 14);
    } else if (type === 'emp') {
      state.empBombs++;
      addFloatingText('⚡ +1 BOM NOVA EMP!', cx, cy, '#a855f7', 14);
    } else if (type === 'double') {
      state.doubleTimerMs = 10000; // True 10s 2x multiplier!
      state.multiplier = getEffectiveMultiplier();
      addFloatingText('⭐ 2X SKOR (10 DETIK)!', cx, cy, '#f59e0b', 14);
    }
    updateHud(true);
  }

  function handleCharacterInput(rawChar) {
    if (state.status !== 'PLAYING') return;
    const char = rawChar.toLowerCase();
    sound.init();

    if (!state.typingStarted) {
      state.typingStarted = true;
    }

    state.totalKeystrokes++;
    state.totalKeystrokesLifetime++;

    let target = getLockedEnemy();

    // Auto-lock lowest (closest to station) enemy whose next char matches
    if (!target) {
      let bestCandidate = null;
      let maxY = -9999;
      for (let i = 0; i < state.enemies.length; i++) {
        const e = state.enemies[i];
        const next = e.word[e.typedIndex];
        if (next && next.toLowerCase() === char && e.y > maxY) {
          maxY = e.y;
          bestCandidate = e;
        }
      }
      if (bestCandidate) {
        target = bestCandidate;
        state.lockedEnemyId = target.id;
      }
    }

    const shipX = state.vw / 2;
    const shipY = state.vh - (state.isMobile ? 34 : 44);

    if (target && target.word[target.typedIndex] && target.word[target.typedIndex].toLowerCase() === char) {
      // === HIT ===
      flashVirtualKey(char, 'hit');
      triggerHaptic('hit');
      target.typedIndex++;
      target.hitFlash = 1.0;

      state.correctChars++;
      state.totalCorrectLifetime++;
      state.recentHits.push(state.activeTypingMs);
      state.combo++;
      if (state.combo > state.maxCombo) state.maxCombo = state.combo;
      state.multiplier = getEffectiveMultiplier();

      // EMP Charge
      state.empCharge = Math.min(100, state.empCharge + 5);
      if (state.empCharge >= 100) {
        state.empBombs++;
        state.empCharge = 0;
        addFloatingText('⚡ EMP NOVA SIAP!', shipX, shipY - 62, '#38bdf8', 13);
        cockpitVoice.speak('Reaktor EMP penuh!');
      }

      // Aim turret & compute exact barrel origin!
      const aimRad = Math.atan2(target.y - shipY, target.x - shipX);
      state.targetPlayerAngle = aimRad + Math.PI / 2;
      state.muzzleFlash = 1;
      state.shipRecoil = 4.5;

      const ship = getCurrentShip();
      const laserColor = target.type === 'boss' ? '#fb7185' : ship.laserColor;
      const cosA = Math.cos(aimRad);
      const sinA = Math.sin(aimRad);
      const perpX = -sinA;
      const perpY = cosA;

      if (ship.style === 'twin' || ship.style === 'quantum') {
        state.wingToggle = -state.wingToggle;
        const wingOffset = state.wingToggle * (state.isMobile ? 9 : 12);
        const bx = shipX + cosA * 14 + perpX * wingOffset;
        const by = shipY + sinA * 14 + perpY * wingOffset;
        spawnLaser(bx, by, target.x, target.y, laserColor, ship.style === 'quantum' ? 7 : 5.5);
      } else if (ship.style === 'heavy') {
        const bx = shipX + cosA * 22;
        const by = shipY + sinA * 22;
        spawnLaser(bx, by, target.x, target.y, laserColor, 9);
      } else {
        const bx = shipX + cosA * 20;
        const by = shipY + sinA * 20;
        spawnLaser(bx, by, target.x, target.y, laserColor, 7);
      }

      // Subtle knockback & hit spark
      target.y = Math.max(-14, target.y - 3.2);
      spawnExplosion(target.x, target.y, laserColor, 5);
      sound.playKeySound(state.combo);

      // Voice milestones
      if (state.combo === 10) cockpitVoice.speak('Combo sepuluh!');
      else if (state.combo === 25) cockpitVoice.speak('Luar biasa!');
      else if (state.combo === 50) cockpitVoice.speak('Kecepatan dewa!');

      // Check word completion
      if (target.typedIndex >= target.word.length) {
        if (target.type === 'boss' && target.phaseQueue && target.phaseQueue.length > 0) {
          target.word = target.phaseQueue.shift();
          target.typedIndex = 0;
          target.y = Math.max(28, target.y - 38);
          target.hitFlash = 1.0;
          const phasePts = 250 * state.multiplier;
          state.score += phasePts;
          sound.playExplosion(false);
          triggerHaptic('boss');
          state.screenShake = 8;
          spawnExplosion(target.x, target.y, '#fb7185', 20);
          spawnShockwave(target.x, target.y, 75, '#fbbf24', 3);
          addFloatingText(`PERISAI BOS PECAH! +${phasePts}`, target.x, target.y, '#fbbf24', 13);
        } else {
          destroyEnemy(target);
        }
      }
    } else {
      // === MISS / TYPO ===
      flashVirtualKey(char, 'miss');
      triggerHaptic('miss');
      state.combo = 0;
      state.multiplier = getEffectiveMultiplier();
      sound.playError();
      addFloatingText('MELESET!', shipX, shipY - 34, '#fb7185', 11);

      // Record EXPECTED key when locked on an enemy so Weak Keys Lab actually trains missed keys!
      const expectedChar =
        target && target.word[target.typedIndex]
          ? target.word[target.typedIndex].toLowerCase()
          : char;
      state.weakKeys[expectedChar] = (state.weakKeys[expectedChar] || 0) + 1;
      state.sessionWeakKeys[expectedChar] = (state.sessionWeakKeys[expectedChar] || 0) + 1;
      storage.set('weakKeys', state.weakKeys);
    }

    recalculateTypingSpeed(false);
    updateNextKeyHint();
    updateHud();
  }

  function destroyEnemy(enemy) {
    const isBoss = enemy.type === 'boss';
    sound.playExplosion(isBoss);
    triggerHaptic(isBoss ? 'boss' : 'hit');
    spawnExplosion(enemy.x, enemy.y, enemy.color, isBoss ? 36 : 16);
    spawnShockwave(enemy.x, enemy.y, isBoss ? 140 : 48, enemy.color, isBoss ? 3.5 : 2.2);

    const pts = (enemy.word.length * 25 + (isBoss ? 600 : 50)) * state.multiplier;
    state.score += pts;
    state.kills++;
    state.totalKillsLifetime++;

    if (isBoss) {
      state.bossDefeated = true;
      state.screenShake = 15;
      cockpitVoice.speak('Induk musuh hancur!');
    }

    addFloatingText(`+${pts}`, enemy.x, enemy.y, '#34d399', isBoss ? 16 : 13);
    spawnPowerupDrop(enemy.x, enemy.y);

    // Splitter Drone spawns 2 fast mini-drones
    if (enemy.type === 'splitter') {
      const miniWords = ['ion', 'gas', 'bit', 'sel', 'es', 'api', 'nol', 'dua', 'ray', 'orb'];
      for (let dir = -1; dir <= 1; dir += 2) {
        const w = miniWords[Math.floor(Math.random() * miniWords.length)];
        spawnEnemy({
          word: w,
          x: Math.min(state.vw - 44, Math.max(44, enemy.x + dir * 34)),
          y: enemy.y,
          vx: dir * 24,
          vy: enemy.vy * 1.12,
          type: 'mini'
        });
      }
    }

    // Remove enemy without reallocating array unnecessarily
    const idx = state.enemies.indexOf(enemy);
    if (idx !== -1) state.enemies.splice(idx, 1);
    if (state.lockedEnemyId === enemy.id) state.lockedEnemyId = null;

    // In Campaign, spawn Boss immediately once regular quota reached
    const goal = getTargetKillsGoal();
    if (state.gameMode === 'CAMPAIGN' && !state.bossSpawned && state.kills >= goal - 1) {
      spawnEnemy();
    }

    checkCompletion();
  }

  function checkCompletion() {
    const goal = getTargetKillsGoal();

    if (state.gameMode === 'ENDLESS') {
      if (state.kills >= state.endlessTargetKills) {
        state.endlessWave++;
        state.endlessTargetKills += 12;
        state.shield = Math.min(100, state.shield + 20);
        state.waveBannerText = `GELOMBANG ${state.endlessWave} • PERISAI +20%`;
        state.waveBannerTimerMs = 1500;
        addFloatingText(`🎉 GELOMBANG ${state.endlessWave}!`, state.vw / 2, 76, '#f59e0b', 16);
        if (state.endlessWave > state.endlessBestWave) {
          state.endlessBestWave = state.endlessWave;
          storage.set('endlessBestWave', state.endlessWave);
        }
      }
      return;
    }

    if (state.gameMode === 'BLITZ') return;

    if (state.gameMode === 'CAMPAIGN') {
      if (state.bossDefeated) {
        // Clear any stray splitter mini-drones cinematically on boss kill
        for (let i = 0; i < state.enemies.length; i++) {
          spawnExplosion(state.enemies[i].x, state.enemies[i].y, state.enemies[i].color, 10);
        }
        state.enemies.length = 0;
        finishLevel(true);
      }
      return;
    }

    // Academy / Custom / Weak Drill
    if (state.kills >= goal && state.enemies.length === 0) {
      finishLevel(true);
    }
  }

  function recalculateTypingSpeed(isFinal) {
    if (!state.typingStarted || state.correctChars === 0) {
      state.currentWpm = 0;
      state.currentCpm = 0;
      return;
    }

    const elapsedMin = Math.max(0.05, state.activeTypingMs / 60000);
    const netWpm = Math.round((state.correctChars / 5) / elapsedMin);
    const netCpm = Math.round(state.correctChars / elapsedMin);

    // Prune rolling 6-second hit window for responsive burst speedometer
    const cutoff = state.activeTypingMs - 6000;
    while (state.recentHits.length > 0 && state.recentHits[0] < cutoff) {
      state.recentHits.shift();
    }

    state.currentWpm = netWpm;
    state.currentCpm = netCpm;

    // Sustained peak / best WPM guards prevent unrealistic 2-second burst spikes
    const validPeakSample = state.correctChars >= 12 && state.activeTypingMs >= 4500;
    const validRecordSample = (state.correctChars >= 20 && state.activeTypingMs >= 8000) || (isFinal && state.correctChars >= 15);

    if (validPeakSample && netWpm > state.peakWpm) {
      state.peakWpm = netWpm;
    }
    if (validRecordSample && netWpm > state.bestWpm) {
      state.bestWpm = netWpm;
      storage.set('bestWpm', state.bestWpm);
    }
    if (state.score > state.highScore) {
      state.highScore = state.score;
      storage.set('highScore', state.highScore);
    }
  }

  function finishLevel(victory) {
    state.status = 'RESULT';
    recalculateTypingSpeed(true);

    if (victory) sound.playLevelClear();
    else sound.playExplosion(true);

    const acc =
      state.totalKeystrokes > 0
        ? Math.round((state.correctChars / state.totalKeystrokes) * 100)
        : 100;

    let rank = 'B';
    if (victory && acc >= 96 && state.currentWpm >= 50) rank = 'S+';
    else if (victory && acc >= 92 && state.currentWpm >= 35) rank = 'S';
    else if (victory && acc >= 85) rank = 'A';
    else if (!victory) rank = 'C';

    let xpGained = Math.round(state.kills * 12 + state.currentWpm * 1.8 + (acc >= 90 ? 55 : 15));
    if (!victory) xpGained = Math.round(xpGained * 0.45);
    state.profileXp += xpGained;
    state.totalCharsLifetime += state.correctChars;

    // Save lifetime & daily progress in one flush
    state.dailyKills += state.kills;
    if (state.currentWpm > state.dailyBestWpm) state.dailyBestWpm = state.currentWpm;

    storage.set('profileXp', state.profileXp);
    storage.set('totalCharsLifetime', state.totalCharsLifetime);
    storage.set('totalKillsLifetime', state.totalKillsLifetime);
    storage.set('totalKeystrokesLifetime', state.totalKeystrokesLifetime);
    storage.set('totalCorrectLifetime', state.totalCorrectLifetime);
    storage.set('dailyKills', state.dailyKills);
    storage.set('dailyBestWpm', state.dailyBestWpm);

    // Preserve highest stars for Academy & Campaign!
    if (state.gameMode === 'ACADEMY' && victory) {
      const lesson = ACADEMY_LESSONS[state.activeLessonIdx];
      let stars = 1;
      if (acc >= 95 && state.currentWpm >= 28) stars = 3;
      else if (acc >= 88) stars = 2;

      const prev = state.academyCompleted[lesson.id] || { stars: 0, wpm: 0 };
      state.academyCompleted[lesson.id] = {
        stars: Math.max(prev.stars || 0, stars),
        wpm: Math.max(prev.wpm || 0, state.currentWpm)
      };
      storage.set('academyCompleted', state.academyCompleted);
    }

    if (state.gameMode === 'CAMPAIGN' && victory) {
      const sec = CAMPAIGN_SECTORS[state.activeSectorIdx];
      let stars = 1;
      if (acc >= 94 && state.shield >= 70) stars = 3;
      else if (acc >= 85) stars = 2;

      const prev = state.campaignCompleted[sec.id] || { stars: 0, wpm: 0, score: 0 };
      state.campaignCompleted[sec.id] = {
        stars: Math.max(prev.stars || 0, stars),
        wpm: Math.max(prev.wpm || 0, state.currentWpm),
        score: Math.max(prev.score || 0, state.score)
      };
      storage.set('campaignCompleted', state.campaignCompleted);
    }

    if (state.gameMode === 'BLITZ' && state.currentWpm > state.blitzBestWpm) {
      state.blitzBestWpm = state.currentWpm;
      state.blitzBestAcc = acc;
      storage.set('blitzBestWpm', state.blitzBestWpm);
      storage.set('blitzBestAcc', state.blitzBestAcc);
    }

    if (state.gameMode === 'ENDLESS' && state.score > state.endlessBestScore) {
      state.endlessBestScore = state.score;
      storage.set('endlessBestScore', state.endlessBestScore);
    }

    storage.flush();

    if (victory) cockpitVoice.speak(`Misi berhasil! Pangkat Rank ${rank}.`);
    else cockpitVoice.speak('Perisai stasiun hancur!');

    // Populate Result Modal cleanly
    dom.resultBadge.textContent = victory ? 'MISI BERHASIL' : 'PERISAI TEMBUS';
    dom.resultBadge.className = victory
      ? 'text-[10px] sm:text-[11px] font-mono-game font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
      : 'text-[10px] sm:text-[11px] font-mono-game font-bold uppercase px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40';

    dom.resultTitle.textContent = victory ? 'Sektor Berhasil Diamankan!' : 'Pertahanan Stasiun Jebol!';
    dom.resultRank.textContent = rank;
    dom.resWpm.textContent = state.currentWpm;
    dom.resPeakWpm.textContent = Math.max(state.peakWpm, state.currentWpm);
    dom.resAccuracy.textContent = `${acc}%`;
    dom.resCpm.textContent = state.currentCpm;
    dom.resKills.textContent = state.kills;
    dom.resXpGained.textContent = `+${xpGained} XP`;

    if (victory) {
      dom.resultFeedback.textContent = `Hebat! Kecepatan pengetikanmu mencapai ${state.currentWpm} WPM dengan akurasi ${acc}% (Max Combo ${state.maxCombo}). Pangkatmu semakin dekat ke tingkat berikutnya!`;
    } else {
      dom.resultFeedback.textContent = `Perisai hancur setelah menumbangkan ${state.kills} musuh (${state.currentWpm} WPM, akurasi ${acc}%). Manfaatkan ESC untuk ganti target dan SPACE untuk bom EMP!`;
    }

    // Show weakest keys from THIS session if any mistakes happened
    const weakEntries = Object.entries(state.sessionWeakKeys).sort((a, b) => b[1] - a[1]).slice(0, 5);
    if (dom.resultWeakSection && dom.resultWeakKeys) {
      if (weakEntries.length > 0) {
        dom.resultWeakSection.classList.remove('hidden');
        dom.resultWeakKeys.innerHTML = weakEntries
          .map(
            ([k, cnt]) =>
              `<span class="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono-game text-[11px] font-bold">${k.toUpperCase()} (${cnt}x)</span>`
          )
          .join('');
      } else {
        dom.resultWeakSection.classList.add('hidden');
      }
    }

    // Contextual primary CTA button (never offer "Next Module" on defeat or Endless/Blitz/Custom!)
    const hasNext =
      victory &&
      ((state.gameMode === 'ACADEMY' && state.activeLessonIdx < ACADEMY_LESSONS.length - 1) ||
        (state.gameMode === 'CAMPAIGN' && state.activeSectorIdx < CAMPAIGN_SECTORS.length - 1));

    if (hasNext) {
      dom.btnResultNext.classList.remove('hidden');
      dom.btnResultNext.innerHTML =
        state.gameMode === 'ACADEMY'
          ? '<span>Lanjut Modul Berikutnya</span> <span>▶</span>'
          : '<span>Lanjut Sektor Berikutnya</span> <span>▶</span>';
    } else {
      dom.btnResultNext.classList.add('hidden');
    }

    dom.modalResult.classList.remove('hidden');
    updateMenuHeaderStats();
    renderAcademyCards();
    renderCampaignCards();
    updateNextKeyHint();
  }

  // ==========================================
  // 12. DIRTY-CHECKED ZERO-JANK HUD UPDATER
  // ==========================================
  const hudCache = {};
  function resetHudCache() {
    for (const k in hudCache) delete hudCache[k];
  }

  function setTextCached(key, el, val) {
    if (el && hudCache[key] !== val) {
      hudCache[key] = val;
      el.textContent = val;
    }
  }

  function updateHud(force) {
    if (force) resetHudCache();

    setTextCached('wpm', dom.hudWpm, String(state.currentWpm));
    setTextCached('cpm', dom.hudCpm, String(state.currentCpm));

    const acc =
      state.totalKeystrokes > 0
        ? Math.round((state.correctChars / state.totalKeystrokes) * 100)
        : 100;
    setTextCached('acc', dom.hudAccuracy, String(acc));
    setTextCached('combo', dom.hudCombo, String(state.combo));
    setTextCached('mult', dom.hudMultiplier, 'x' + state.multiplier);
    setTextCached('score', dom.hudScore, state.score.toLocaleString('id-ID'));
    setTextCached('emp', dom.hudEmpCount, String(state.empBombs));
    if (dom.kbEmpBadge) setTextCached('kbEmp', dom.kbEmpBadge, String(state.empBombs));

    const empDisabled = state.empBombs <= 0 || state.status !== 'PLAYING';
    if (dom.btnEmpNova && hudCache.empDis !== empDisabled) {
      hudCache.empDis = empDisabled;
      dom.btnEmpNova.disabled = empDisabled;
    }
    if (dom.empReadyDot && hudCache.empDot !== (state.empBombs > 0)) {
      hudCache.empDot = state.empBombs > 0;
      dom.empReadyDot.style.display = state.empBombs > 0 ? 'inline-block' : 'none';
    }

    const shieldClamped = Math.max(0, Math.round(state.shield));
    if (hudCache.shield !== shieldClamped) {
      hudCache.shield = shieldClamped;
      if (dom.hudShieldBar) dom.hudShieldBar.style.width = `${shieldClamped}%`;
      if (dom.hudShieldText) dom.hudShieldText.textContent = `${shieldClamped}%`;
    }

    const goal = getTargetKillsGoal();
    const progKey = `${state.kills}/${goal}`;
    if (hudCache.prog !== progKey) {
      hudCache.prog = progKey;
      const pct = Math.min(100, Math.round((state.kills / goal) * 100));
      if (dom.hudProgressBar) dom.hudProgressBar.style.width = `${pct}%`;
      if (dom.hudProgressText) dom.hudProgressText.textContent = state.gameMode === 'BLITZ' ? `${state.kills} Kill` : progKey;
    }

    setTextCached('badge', dom.hudLevelBadge, getModeBadgeText());

    let waveDesc = '';
    if (state.gameMode === 'BLITZ') {
      waveDesc = `Uji 60 Detik • Sisa Waktu: ${Math.ceil(state.blitzTimeLeftMs / 1000)}s`;
    } else if (state.gameMode === 'ENDLESS') {
      waveDesc = `Gelombang ${state.endlessWave} • Musuh: ${state.kills}/${goal}`;
    } else if (state.gameMode === 'ACADEMY') {
      waveDesc = ACADEMY_LESSONS[state.activeLessonIdx].title;
    } else if (state.gameMode === 'CAMPAIGN') {
      waveDesc = CAMPAIGN_SECTORS[state.activeSectorIdx].name;
    } else {
      waveDesc = state.customLabel;
    }
    setTextCached('wave', dom.hudWaveText, waveDesc);

    // Live Speedometer Gauge
    const wpmPct = Math.min(100, Math.round((state.currentWpm / 90) * 100));
    if (hudCache.wpmPct !== wpmPct) {
      hudCache.wpmPct = wpmPct;
      if (dom.wpmGaugeBar) dom.wpmGaugeBar.style.width = `${wpmPct}%`;
    }

    const speedTier =
      state.currentWpm >= 70 ? 3 : state.currentWpm >= 45 ? 2 : state.currentWpm >= 25 ? 1 : 0;
    if (dom.speedCategoryBadge && hudCache.speedTier !== speedTier) {
      hudCache.speedTier = speedTier;
      const tiers = [
        ['SIAGA', 'px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300'],
        ['STABIL', 'px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300'],
        ['SUPERSONIK', 'px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300'],
        ['WARP PRO', 'px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300']
      ];
      dom.speedCategoryBadge.textContent = tiers[speedTier][0];
      dom.speedCategoryBadge.className = tiers[speedTier][1];
    }

    setTextCached('bestWpm', dom.hudBestWpm, String(state.bestWpm));
    setTextCached('peakWpm', dom.hudPeakWpm, String(state.peakWpm));

    // Ghost Typist Delta
    if (dom.hudGhostDelta) {
      const showGhost = state.bestWpm > 0 && state.status === 'PLAYING' && state.typingStarted;
      const delta = state.currentWpm - state.bestWpm;
      const ghostKey = showGhost ? `${delta >= 0 ? '+' : ''}${delta}` : 'HIDDEN';
      if (hudCache.ghost !== ghostKey) {
        hudCache.ghost = ghostKey;
        if (showGhost) {
          dom.hudGhostDelta.classList.remove('hidden');
          dom.hudGhostDelta.textContent = `👻 ${ghostKey} WPM vs Rekor`;
          dom.hudGhostDelta.className = `text-[9px] font-mono-game font-bold border-t border-slate-800/80 pt-1 text-center ${
            delta >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`;
        } else {
          dom.hudGhostDelta.classList.add('hidden');
        }
      }
    }

    // EMP Charge & Active Powerup Timers
    if (hudCache.empCharge !== state.empCharge) {
      hudCache.empCharge = state.empCharge;
      if (dom.empChargeBar) dom.empChargeBar.style.width = `${state.empCharge}%`;
      if (dom.empChargePct) dom.empChargePct.textContent = `${state.empCharge}%`;
    }

    if (dom.hudActivePowerups) {
      const cryoS = state.cryoTimerMs > 0 ? Math.ceil(state.cryoTimerMs / 1000) : 0;
      const dblS = state.doubleTimerMs > 0 ? Math.ceil(state.doubleTimerMs / 1000) : 0;
      const pwrKey = `${cryoS}_${dblS}`;
      if (hudCache.pwrKey !== pwrKey) {
        hudCache.pwrKey = pwrKey;
        if (cryoS > 0 || dblS > 0) {
          const parts = [];
          if (cryoS > 0) parts.push(`<span class="text-sky-300 font-bold">❄️ Cryo ${cryoS}s</span>`);
          if (dblS > 0) parts.push(`<span class="text-amber-300 font-bold">⭐ 2X ${dblS}s</span>`);
          dom.hudActivePowerups.innerHTML = parts.join(' • ');
        } else {
          dom.hudActivePowerups.innerHTML = '<span>Tekan <kbd class="px-1 bg-slate-800 rounded text-cyan-300">SPACE</kbd> untuk EMP</span>';
        }
      }
    }

    // Active Target Word — ZERO innerHTML recreation! Just textContent on 3 persistent spans!
    const locked = getLockedEnemy();
    const wordKey = locked ? `${locked.id}:${locked.word}:${locked.typedIndex}` : 'NONE';
    if (hudCache.wordKey !== wordKey) {
      hudCache.wordKey = wordKey;
      if (locked) {
        dom.wordEmpty.classList.add('hidden');
        dom.wordTyped.classList.remove('hidden');
        dom.wordNext.classList.remove('hidden');
        dom.wordRest.classList.remove('hidden');
        dom.wordTyped.textContent = locked.word.slice(0, locked.typedIndex);
        dom.wordNext.textContent = locked.word[locked.typedIndex] || '';
        dom.wordRest.textContent = locked.word.slice(locked.typedIndex + 1);
      } else {
        dom.wordEmpty.classList.remove('hidden');
        dom.wordTyped.classList.add('hidden');
        dom.wordNext.classList.add('hidden');
        dom.wordRest.classList.add('hidden');
      }
    }
  }

  // ==========================================
  // 13. HIGH-SPEED CANVAS 2D RENDERER
  // ==========================================
  function drawEnemyShip(e, isLocked, nowSec, dangerY) {
    ctx.save();
    ctx.translate(e.x, e.y);

    // Pre-rendered glow orb halo (5x faster than arc+alpha or shadowBlur!)
    const haloSize = (e.radius + (isLocked ? 14 : 8)) * 2;
    ctx.globalAlpha = isLocked ? 0.55 : 0.25;
    ctx.drawImage(getGlowForColor(e.color), -haloSize / 2, -haloSize / 2, haloSize, haloSize);
    ctx.globalAlpha = 1;

    // Rotating lock-on reticle
    if (isLocked) {
      ctx.save();
      ctx.rotate(nowSec * 3.2);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      const r = e.radius + 9;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 0.35);
      ctx.moveTo(0, r);
      ctx.arc(0, 0, r, Math.PI * 0.5, Math.PI * 0.85);
      ctx.moveTo(-r, 0);
      ctx.arc(0, 0, r, Math.PI, Math.PI * 1.35);
      ctx.moveTo(0, -r);
      ctx.arc(0, 0, r, Math.PI * 1.5, Math.PI * 1.85);
      ctx.stroke();
      ctx.restore();
    }

    const bodyFill = e.hitFlash > 0.25 ? '#ffffff' : e.color;
    ctx.fillStyle = bodyFill;
    ctx.strokeStyle = e.hitFlash > 0.25 ? '#fde047' : '#f8fafc';
    ctx.lineWidth = 1.4;

    if (e.type === 'boss') {
      // Massive Mothership with flanking wings & pulsing core
      ctx.beginPath();
      ctx.moveTo(0, e.radius);
      ctx.lineTo(e.radius * 0.55, e.radius * 0.45);
      ctx.lineTo(e.radius * 1.25, -e.radius * 0.22);
      ctx.lineTo(e.radius * 0.72, -e.radius * 0.95);
      ctx.lineTo(e.radius * 0.28, -e.radius * 0.55);
      ctx.lineTo(-e.radius * 0.28, -e.radius * 0.55);
      ctx.lineTo(-e.radius * 0.72, -e.radius * 0.95);
      ctx.lineTo(-e.radius * 1.25, -e.radius * 0.22);
      ctx.lineTo(-e.radius * 0.55, e.radius * 0.45);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Glowing reactor core
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(0, -2, e.radius * (0.24 + Math.sin(nowSec * 8) * 0.04), 0, Math.PI * 2);
      ctx.fill();
    } else if (e.type === 'cruiser') {
      // Heavy Armored Hexagon + Shield Arcs
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const ang = (Math.PI / 3) * i + Math.PI / 6;
        const rx = Math.cos(ang) * e.radius;
        const ry = Math.sin(ang) * e.radius;
        if (i === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = 'rgba(216, 180, 254, 0.75)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, e.radius + 4, 0.25, Math.PI - 0.25);
      ctx.stroke();
    } else if (e.type === 'asteroid') {
      ctx.rotate(e.spin || 0);
      ctx.beginPath();
      for (let i = 0; i < 7; i++) {
        const ang = ((Math.PI * 2) / 7) * i;
        const dist = e.radius * (0.8 + Math.sin(i * 3 + e.wobblePhase) * 0.22);
        const rx = Math.cos(ang) * dist;
        const ry = Math.sin(ang) * dist;
        if (i === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (e.type === 'splitter') {
      // Amber twin-prong splitter drone
      ctx.beginPath();
      ctx.moveTo(0, e.radius);
      ctx.lineTo(e.radius * 0.95, -e.radius * 0.45);
      ctx.lineTo(e.radius * 0.45, -e.radius * 0.9);
      ctx.lineTo(0, -e.radius * 0.2);
      ctx.lineTo(-e.radius * 0.45, -e.radius * 0.9);
      ctx.lineTo(-e.radius * 0.95, -e.radius * 0.45);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      // Sleek Scout / Mini Interceptor
      ctx.beginPath();
      ctx.moveTo(0, e.radius);
      ctx.lineTo(e.radius * 0.85, -e.radius * 0.8);
      ctx.lineTo(0, -e.radius * 0.32);
      ctx.lineTo(-e.radius * 0.85, -e.radius * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();

    // Boss Multi-Segment Shield Bar
    if (e.type === 'boss') {
      const segs = e.maxPhases || 3;
      const rem = (e.phaseQueue ? e.phaseQueue.length : 0) + 1;
      const barW = 76;
      const segW = (barW - (segs - 1) * 4) / segs;
      const bx0 = e.x - barW / 2;
      const by0 = e.y - e.radius - 16;

      for (let s = 0; s < segs; s++) {
        ctx.fillStyle = s < rem ? '#fb7185' : 'rgba(51, 65, 85, 0.7)';
        ctx.fillRect(bx0 + s * (segW + 4), by0, segW, 5);
      }
      ctx.font = '700 10px "Inter", sans-serif';
      ctx.fillStyle = '#fda4af';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`BOS • FASE ${segs - rem + 1}/${segs}`, e.x, by0 - 3);
    }

    // Word Label Pill — ZERO ctx.measureText()! Pure O(1) monospaced width math!
    const charW = isLocked ? state.charWLocked : state.charWNormal;
    const fullWidth = e.word.length * charW;
    const typedWidth = e.typedIndex * charW;
    const padX = state.isMobile ? 7 : 9;
    const boxW = fullWidth + padX * 2;
    const boxH = state.isMobile ? (isLocked ? 22 : 19) : isLocked ? 26 : 22;

    const boxX = Math.max(6, Math.min(state.vw - boxW - 6, e.x - boxW / 2));
    const boxY = e.labelY !== undefined ? e.labelY : e.y + e.radius + 6;
    const inDanger = e.y >= dangerY;

    ctx.fillStyle = isLocked ? 'rgba(2, 6, 23, 0.96)' : 'rgba(12, 20, 38, 0.92)';
    ctx.strokeStyle = isLocked ? '#fbbf24' : inDanger ? '#fb7185' : e.color;
    ctx.lineWidth = isLocked ? 2 : inDanger ? 1.8 : 1.2;

    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(boxX, boxY, boxW, boxH, 5);
    else ctx.rect(boxX, boxY, boxW, boxH);
    ctx.fill();
    ctx.stroke();

    // Word progress bar
    if (e.typedIndex > 0) {
      const progW = Math.min(boxW - 4, (e.typedIndex / e.word.length) * (boxW - 4));
      ctx.fillStyle = '#10b981';
      ctx.fillRect(boxX + 2, boxY + boxH - 2.5, progW, 2);
    }

    ctx.font = isLocked ? state.fontLocked : state.fontNormal;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const textY = boxY + boxH / 2 + 0.5;
    const startX = boxX + padX;

    if (e.typedIndex > 0) {
      ctx.fillStyle = '#34d399';
      ctx.fillText(e.word.slice(0, e.typedIndex), startX, textY);
    }

    if (isLocked && e.typedIndex < e.word.length) {
      ctx.fillStyle = '#facc15';
      ctx.fillText(e.word[e.typedIndex], startX + typedWidth, textY);
      if (e.typedIndex + 1 < e.word.length) {
        ctx.fillStyle = '#ffffff';
        ctx.fillText(e.word.slice(e.typedIndex + 1), startX + typedWidth + charW, textY);
      }
    } else if (e.typedIndex < e.word.length) {
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(e.word.slice(e.typedIndex), startX + typedWidth, textY);
    }
  }

  function resolveLabelOverlaps() {
    const n = state.enemies.length;
    for (let i = 0; i < n; i++) {
      state.enemies[i].labelY = state.enemies[i].y + state.enemies[i].radius + 6;
    }
    if (n < 2) return;
    const minYGap = state.isMobile ? 21 : 25;
    for (let i = 0; i < n; i++) {
      const a = state.enemies[i];
      for (let j = i + 1; j < n; j++) {
        const b = state.enemies[j];
        if (Math.abs(a.x - b.x) < 95 && Math.abs(a.labelY - b.labelY) < minYGap) {
          if (a.labelY <= b.labelY) b.labelY = a.labelY + minYGap;
          else a.labelY = b.labelY + minYGap;
        }
      }
    }
  }

  function drawPlayerShip(nowSec) {
    const shipX = state.vw / 2;
    const shipY = state.vh - (state.isMobile ? 34 : 44);
    const ship = getCurrentShip();

    // Laser targeting guide line
    const locked = getLockedEnemy();
    if (locked) {
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.24)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(shipX, shipY);
      ctx.lineTo(locked.x, locked.y);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(shipX, shipY + state.shipRecoil);

    // Combo Fever Aura (Combo >= 15)
    if (state.combo >= 15) {
      const auraR = (state.isMobile ? 54 : 68) + Math.sin(nowSec * 9) * 5;
      ctx.globalAlpha = Math.min(0.45, 0.16 + (state.combo - 15) * 0.008);
      ctx.drawImage(glowSprites[ship.glowKey] || glowSprites.cyan, -auraR / 2, -auraR / 2, auraR, auraR);
      ctx.globalAlpha = 1;
    }

    // Shield Aura Ring
    ctx.strokeStyle = state.shield > 35 ? 'rgba(34, 211, 238, 0.34)' : 'rgba(244, 63, 94, 0.65)';
    ctx.lineWidth = state.shield <= 35 ? 2.2 : 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, state.isMobile ? 22 : 27, 0, Math.PI * 2);
    ctx.stroke();

    ctx.rotate(state.playerAngle);
    const scale = state.isMobile ? 0.84 : 1;
    ctx.scale(scale, scale);

    // Thruster flame
    const flameLen = 22 + Math.sin(nowSec * 45) * 4;
    ctx.fillStyle = ship.laserColor;
    ctx.beginPath();
    ctx.moveTo(-6, 14);
    ctx.lineTo(0, flameLen);
    ctx.lineTo(6, 14);
    ctx.closePath();
    ctx.fill();

    // Muzzle flash sprite
    if (state.muzzleFlash > 0.05) {
      const mf = 26 * state.muzzleFlash;
      ctx.globalAlpha = state.muzzleFlash * 0.85;
      ctx.drawImage(glowSprites[ship.glowKey] || glowSprites.cyan, -mf / 2, -24 - mf / 2, mf, mf);
      ctx.globalAlpha = 1;
    }

    // 4 DISTINCT HANGAR STARFIGHTER DESIGNS!
    ctx.fillStyle = ship.hullColor;
    ctx.strokeStyle = '#f0f9ff';
    ctx.lineWidth = 1.5;

    if (ship.id === 'phoenix') {
      // Solar Phoenix: swept-forward predator wings
      ctx.beginPath();
      ctx.moveTo(0, -25);
      ctx.lineTo(7, -6);
      ctx.lineTo(22, -12);
      ctx.lineTo(17, 13);
      ctx.lineTo(7, 8);
      ctx.lineTo(0, 15);
      ctx.lineTo(-7, 8);
      ctx.lineTo(-17, 13);
      ctx.lineTo(-22, -12);
      ctx.lineTo(-7, -6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (ship.id === 'phantom') {
      // Void Phantom: twin-prong quantum stealth blade
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.lineTo(9, -25);
      ctx.lineTo(19, 8);
      ctx.lineTo(11, 15);
      ctx.lineTo(0, 9);
      ctx.lineTo(-11, 15);
      ctx.lineTo(-19, 8);
      ctx.lineTo(-9, -25);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (ship.id === 'dreadnought') {
      // Titan Dreadnought: armored triple-hull heavy cruiser
      ctx.beginPath();
      ctx.moveTo(0, -24);
      ctx.lineTo(8, -16);
      ctx.lineTo(10, -4);
      ctx.lineTo(22, 2);
      ctx.lineTo(22, 14);
      ctx.lineTo(11, 12);
      ctx.lineTo(7, 17);
      ctx.lineTo(-7, 17);
      ctx.lineTo(-11, 12);
      ctx.lineTo(-22, 14);
      ctx.lineTo(-22, 2);
      ctx.lineTo(-10, -4);
      ctx.lineTo(-8, -16);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      // Vanguard Falcon: sleek delta interceptor
      ctx.beginPath();
      ctx.moveTo(0, -24);
      ctx.lineTo(19, 13);
      ctx.lineTo(7, 9);
      ctx.lineTo(0, 15);
      ctx.lineTo(-7, 9);
      ctx.lineTo(-19, 13);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Cockpit canopy
    ctx.fillStyle = ship.accentColor;
    ctx.beginPath();
    ctx.ellipse(0, -4, 3.8, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawGame() {
    const w = state.vw;
    const h = state.vh;
    const dpr = state.dpr;
    const nowSec = state.elapsedTimeSec;

    // 1. 1:1 Hardware Blit of pre-baked static background (zero resampling!)
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(bgCanvas, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const shaking = state.screenShake > 0.2;
    if (shaking) {
      ctx.save();
      ctx.translate(
        (Math.random() - 0.5) * state.screenShake,
        (Math.random() - 0.5) * state.screenShake
      );
    }

    // 2. Batched 3-Layer Parallax Starfield (only 3 fillStyle switches total!)
    const warpLen = state.status === 'PLAYING' && state.combo >= 20 ? Math.min(14, (state.combo - 15) * 0.35) : 0;

    ctx.fillStyle = '#334155';
    for (let i = 0; i < state.starsFar.length; i++) {
      const s = state.starsFar[i];
      ctx.fillRect(s.x, s.y, 1.2, 1.2);
    }
    ctx.fillStyle = '#64748b';
    for (let i = 0; i < state.starsMid.length; i++) {
      const s = state.starsMid[i];
      ctx.fillRect(s.x, s.y, 1.6, 1.6 + warpLen * 0.4);
    }
    ctx.fillStyle = '#bae6fd';
    for (let i = 0; i < state.starsNear.length; i++) {
      const s = state.starsNear[i];
      ctx.fillRect(s.x, s.y, 2.1, 2.1 + warpLen);
    }

    // Cryo Freeze subtle atmospheric edge tint
    if (state.cryoTimerMs > 0) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.06)';
      ctx.fillRect(0, 0, w, h);
    }

    // Low shield / danger pulse along bottom defense line
    if (state.dangerFlash > 0.02 || (state.status === 'PLAYING' && state.shield <= 30)) {
      const shipY = h - (state.isMobile ? 34 : 44);
      const pulse = Math.max(state.dangerFlash, state.shield <= 30 ? 0.14 + Math.sin(nowSec * 7) * 0.08 : 0);
      ctx.fillStyle = `rgba(244, 63, 94, ${pulse.toFixed(3)})`;
      ctx.fillRect(0, shipY - 22, w, h - (shipY - 22));
    }

    // 3. Pooled Shockwaves
    for (let i = 0; i < MAX_SHOCKWAVES; i++) {
      const sw = shockwavePool[i];
      if (!sw.active) continue;
      ctx.strokeStyle = sw.color;
      ctx.globalAlpha = Math.max(0, sw.alpha);
      ctx.lineWidth = sw.lineWidth;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // 4. Pre-rendered Powerup Drop Sprites (zero emoji fillText!)
    for (let i = 0; i < state.powerupDrops.length; i++) {
      const p = state.powerupDrops[i];
      const bobY = p.y + Math.sin(nowSec * 5 + p.phase) * 3;
      const sprite = powerupSprites[p.type] || powerupSprites.shield;
      ctx.drawImage(sprite, p.x - 22, bobY - 22);
    }

    // 5. Pooled Lasers
    ctx.lineCap = 'round';
    for (let i = 0; i < MAX_LASERS; i++) {
      const l = laserPool[i];
      if (!l.active) continue;
      ctx.globalAlpha = Math.max(0, l.alpha * 0.42);
      ctx.strokeStyle = l.color;
      ctx.lineWidth = l.width;
      ctx.beginPath();
      ctx.moveTo(l.x1, l.y1);
      ctx.lineTo(l.x2, l.y2);
      ctx.stroke();

      ctx.globalAlpha = Math.max(0, l.alpha);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(1.8, l.width * 0.35);
      ctx.beginPath();
      ctx.moveTo(l.x1, l.y1);
      ctx.lineTo(l.x2, l.y2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // 6. Player Starfighter
    drawPlayerShip(nowSec);

    // 7. Enemies (non-locked first, locked on top so always crisp & readable)
    resolveLabelOverlaps();
    const dangerY = h * 0.72;
    const lockedId = state.lockedEnemyId;
    let lockedEnemy = null;
    for (let i = 0; i < state.enemies.length; i++) {
      const e = state.enemies[i];
      if (e.id === lockedId) lockedEnemy = e;
      else drawEnemyShip(e, false, nowSec, dangerY);
    }
    if (lockedEnemy) drawEnemyShip(lockedEnemy, true, nowSec, dangerY);

    // 8. Pooled Glowing Particles (using pre-baked glow sprites in normal/ultra or crisp rects in turbo!)
    const useGlowParticles = !isTurboEffective();
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = particlePool[i];
      if (!p.active) continue;
      ctx.globalAlpha = Math.max(0, p.alpha);
      if (useGlowParticles && p.glow) {
        const d = p.size * 4.5;
        ctx.drawImage(p.glow, p.x - d / 2, p.y - d / 2, d, d);
      } else {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.size * 0.5, p.y - p.size * 0.5, p.size * 1.4, p.size * 1.4);
      }
    }
    ctx.globalAlpha = 1;

    // 9. Pooled Floating Combat Text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < MAX_FLOATING_TEXTS; i++) {
      const ft = textPool[i];
      if (!ft.active) continue;
      ctx.font = `800 ${ft.size}px "Inter", sans-serif`;
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.globalAlpha = 1;

    // 10. Mobile compact canvas status pill (Blitz countdown / Cryo / 2x)
    if (state.isMobile && state.status === 'PLAYING') {
      const badges = [];
      if (state.gameMode === 'BLITZ') badges.push(`⏱ ${Math.ceil(state.blitzTimeLeftMs / 1000)}s`);
      if (state.cryoTimerMs > 0) badges.push(`❄️ ${Math.ceil(state.cryoTimerMs / 1000)}s`);
      if (state.doubleTimerMs > 0) badges.push(`⭐ 2X ${Math.ceil(state.doubleTimerMs / 1000)}s`);
      if (badges.length > 0) {
        const txt = badges.join('  •  ');
        ctx.font = '700 11px "JetBrains Mono", monospace';
        const bw = txt.length * 7.2 + 20;
        ctx.fillStyle = 'rgba(2, 6, 23, 0.84)';
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(w / 2 - bw / 2, 8, bw, 22, 11);
        else ctx.rect(w / 2 - bw / 2, 8, bw, 22);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(txt, w / 2, 19.5);
      }
    }

    // 11. Tactical Wave Launch / Boss Intro Banner
    if (state.waveBannerTimerMs > 0 && state.waveBannerText) {
      const alpha = Math.min(1, state.waveBannerTimerMs / 400);
      ctx.globalAlpha = alpha;
      ctx.font = state.isMobile ? '800 13px "Orbitron", "Inter", sans-serif' : '800 18px "Orbitron", "Inter", sans-serif';
      ctx.fillStyle = '#e0f2fe';
      ctx.fillText(state.waveBannerText, w / 2, h * 0.24);
      ctx.globalAlpha = 1;
    } else if (state.status === 'MENU' && dom.modalStartMenu && dom.modalStartMenu.classList.contains('hidden')) {
      ctx.font = state.isMobile ? '700 12px "JetBrains Mono", monospace' : '700 14px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(148, 163, 184, 0.85)';
      ctx.fillText('Tekan ENTER atau klik "🚀 Mode" untuk memulai misi', w / 2, h * 0.45);
    }

    if (shaking) ctx.restore();
  }

  // ==========================================
  // 14. 100% DELTA-TIME NORMALIZED SIMULATION
  // ==========================================
  function updateStars(stars, dtSec, mult) {
    const h = state.vh;
    const w = state.vw;
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      s.y += s.speed * mult * dtSec;
      if (s.y > h) {
        s.y -= h;
        s.x = Math.random() * w;
      }
    }
  }

  function updateGame(dtMs) {
    const dtSec = dtMs * 0.001;
    state.elapsedTimeSec += dtSec;

    // Smooth starfield parallax (runs gently in menu too!)
    const starMult =
      state.status === 'PLAYING'
        ? (state.cryoTimerMs > 0 ? 0.5 : 1.0 + Math.min(2.2, state.combo * 0.035))
        : 0.32;
    updateStars(state.starsFar, dtSec, starMult);
    updateStars(state.starsMid, dtSec, starMult);
    updateStars(state.starsNear, dtSec, starMult);

    if (state.screenShake > 0) state.screenShake = Math.max(0, state.screenShake - 48 * dtSec);
    if (state.muzzleFlash > 0) state.muzzleFlash = Math.max(0, state.muzzleFlash - 9 * dtSec);
    if (state.shipRecoil > 0) state.shipRecoil = Math.max(0, state.shipRecoil - 28 * dtSec);
    if (state.dangerFlash > 0) state.dangerFlash = Math.max(0, state.dangerFlash - 1.8 * dtSec);

    // Frame-rate independent smooth turret rotation
    let angleDiff = state.targetPlayerAngle - state.playerAngle;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    state.playerAngle += angleDiff * (1 - Math.exp(-16 * dtSec));

    // Update pooled FX even briefly on victory/defeat so explosions finish smoothly!
    for (let i = 0; i < MAX_LASERS; i++) {
      const l = laserPool[i];
      if (!l.active) continue;
      l.alpha -= 7.8 * dtSec;
      if (l.alpha <= 0) l.active = false;
    }
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = particlePool[i];
      if (!p.active) continue;
      p.x += p.vx * dtSec;
      p.y += p.vy * dtSec;
      p.vx *= 1 - Math.min(0.9, 1.8 * dtSec);
      p.vy *= 1 - Math.min(0.9, 1.8 * dtSec);
      p.alpha -= p.decay * dtSec;
      if (p.alpha <= 0) p.active = false;
    }
    for (let i = 0; i < MAX_SHOCKWAVES; i++) {
      const sw = shockwavePool[i];
      if (!sw.active) continue;
      sw.radius += (sw.maxRadius - sw.radius) * (1 - Math.exp(-7 * dtSec)) + 140 * dtSec;
      sw.alpha -= 2.4 * dtSec;
      if (sw.alpha <= 0) sw.active = false;
    }
    for (let i = 0; i < MAX_FLOATING_TEXTS; i++) {
      const ft = textPool[i];
      if (!ft.active) continue;
      ft.y += ft.vy * dtSec;
      ft.alpha -= 1.3 * dtSec;
      if (ft.alpha <= 0) ft.active = false;
    }

    if (state.status !== 'PLAYING') return;

    // Advance accurate active typing clock
    if (state.typingStarted) {
      state.activeTypingMs += dtMs;
    }

    // Powerup & Banner Timers (pause-safe!)
    if (state.waveBannerTimerMs > 0) state.waveBannerTimerMs = Math.max(0, state.waveBannerTimerMs - dtMs);
    if (state.cryoTimerMs > 0) state.cryoTimerMs = Math.max(0, state.cryoTimerMs - dtMs);
    if (state.doubleTimerMs > 0) {
      state.doubleTimerMs = Math.max(0, state.doubleTimerMs - dtMs);
      if (state.doubleTimerMs === 0) {
        state.multiplier = getEffectiveMultiplier();
      }
    }

    // Blitz 60-Second Countdown (delta-time exact!)
    if (state.gameMode === 'BLITZ') {
      state.blitzTimeLeftMs = Math.max(0, state.blitzTimeLeftMs - dtMs);
      if (state.blitzTimeLeftMs <= 0) {
        finishLevel(true);
        return;
      }
    }

    // Enemy Spawner
    state.spawnTimerMs += dtMs;
    const interval =
      state.gameMode === 'ACADEMY'
        ? 2300
        : state.gameMode === 'CAMPAIGN'
        ? CAMPAIGN_SECTORS[state.activeSectorIdx].spawnIntervalMs
        : state.gameMode === 'BLITZ'
        ? 1350
        : state.gameMode === 'ENDLESS'
        ? Math.max(950, 1900 - state.endlessWave * 90)
        : 1750;

    if (state.spawnTimerMs >= interval || state.enemies.length === 0) {
      state.spawnTimerMs = 0;
      const goal = getTargetKillsGoal();
      if (state.gameMode === 'BLITZ' || state.gameMode === 'ENDLESS') {
        spawnEnemy();
      } else if (state.gameMode === 'CAMPAIGN') {
        if (!state.bossSpawned && state.kills + state.enemies.length < goal) {
          spawnEnemy();
        }
      } else {
        if (state.kills + state.enemies.length < goal) {
          spawnEnemy();
        }
      }
    }

    const shipX = state.vw / 2;
    const shipY = state.vh - (state.isMobile ? 34 : 44);
    const heightScale = Math.min(1.06, Math.max(0.62, state.vh / 520));
    const cryoScale = state.cryoTimerMs > 0 ? 0.42 : 1.0;
    const edgePad = state.isMobile ? 36 : 58;

    // Move Enemies
    for (let i = state.enemies.length - 1; i >= 0; i--) {
      const e = state.enemies[i];
      e.wobblePhase += 2.2 * dtSec;
      if (e.type === 'asteroid') e.spin = (e.spin || 0) + 1.4 * dtSec;
      if (e.hitFlash > 0) e.hitFlash = Math.max(0, e.hitFlash - 11 * dtSec);

      const dx = shipX - e.x;
      const dy = shipY - e.y;
      const dist = Math.hypot(dx, dy) || 1;

      e.x += ((dx / dist) * (e.vy * 0.22) + Math.sin(e.wobblePhase) * 16) * dtSec * cryoScale;
      e.y += e.vy * heightScale * dtSec * cryoScale;
      e.x = Math.max(edgePad, Math.min(state.vw - edgePad, e.x));

      // Defense Breach
      if (e.y >= shipY - 18) {
        const dmg = e.type === 'boss' ? 45 : e.type === 'cruiser' ? 24 : 16;
        state.shield = Math.max(0, state.shield - dmg);
        state.combo = 0;
        state.multiplier = getEffectiveMultiplier();
        state.screenShake = 11;
        state.dangerFlash = 0.38;
        sound.playError();
        triggerHaptic('miss');
        spawnExplosion(e.x, e.y, '#fb7185', 16);
        addFloatingText(`-${dmg}% PERISAI!`, e.x, shipY - 34, '#fb7185', 12);

        if (state.shield <= 30 && state.shield > 0) {
          cockpitVoice.speak('Peringatan! Perisai kritis!');
        }

        if (state.lockedEnemyId === e.id) {
          state.lockedEnemyId = null;
          updateNextKeyHint();
        }
        state.enemies.splice(i, 1);

        // If boss breached and player survived, respawn boss cleanly at top!
        if (e.type === 'boss' && state.shield > 0) {
          e.y = -40;
          state.enemies.push(e);
        }

        updateHud(true);

        if (state.shield <= 0) {
          finishLevel(false);
          return;
        }
        checkCompletion();
        if (state.status !== 'PLAYING') return;
        if (state.enemies.length === 0 && state.kills < getTargetKillsGoal()) {
          spawnEnemy();
        }
      }
    }

    // Powerup Drops with smooth magnetic pull near ship!
    for (let i = state.powerupDrops.length - 1; i >= 0; i--) {
      const p = state.powerupDrops[i];
      p.y += p.vy * dtSec;
      const dx = shipX - p.x;
      const dy = shipY - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 140) {
        p.x += (dx / (dist || 1)) * 180 * dtSec;
        p.y += (dy / (dist || 1)) * 140 * dtSec;
      }
      if (dist < 30 || p.y >= shipY - 18) {
        applyPowerup(p.type);
        state.powerupDrops.splice(i, 1);
      } else if (p.y > state.vh + 20) {
        state.powerupDrops.splice(i, 1);
      }
    }

    // Periodic 250ms HUD sync (smooth live WPM, Blitz seconds, Cryo/2x timers)
    state.hudTickAccumMs += dtMs;
    if (state.hudTickAccumMs >= 250) {
      state.hudTickAccumMs = 0;
      recalculateTypingSpeed(false);
      updateHud();
    }
  }

  // ==========================================
  // 15. ADAPTIVE RAF LOOP + FPS TELEMETRY
  // ==========================================
  let animId = null;
  let fpsFrameCount = 0;
  let fpsAccumMs = 0;
  let emaFrameMs = 16.6;
  let slowFrameStreak = 0;
  let menuSkipToggle = false;

  function gameLoop(nowMs) {
    if (document.hidden) {
      animId = null;
      return;
    }

    const rawDt = state.lastFrameMs ? nowMs - state.lastFrameMs : 16.67;
    state.lastFrameMs = nowMs;
    const dtMs = Math.min(50, Math.max(0.5, rawDt));

    // When modal covers screen (MENU/RESULT/PAUSED), render background at 30fps to save GPU/battery!
    if (state.status !== 'PLAYING') {
      menuSkipToggle = !menuSkipToggle;
      if (menuSkipToggle) {
        animId = requestAnimationFrame(gameLoop);
        return;
      }
      updateGame(dtMs * 2);
      drawGame();
      animId = requestAnimationFrame(gameLoop);
      return;
    }

    const t0 = performance.now();
    updateGame(dtMs);
    drawGame();
    const renderCostMs = performance.now() - t0;

    // Rolling FPS & Auto-Quality Guard
    fpsFrameCount++;
    fpsAccumMs += rawDt;
    emaFrameMs = emaFrameMs * 0.92 + rawDt * 0.08;

    if (fpsAccumMs >= 500) {
      const fps = Math.round((fpsFrameCount * 1000) / fpsAccumMs);
      if (dom.fpsBadge && dom.fpsText && state.showFps) {
        dom.fpsText.textContent = `${fps} FPS • ${renderCostMs.toFixed(1)}ms`;
        dom.fpsText.className =
          fps >= 55 ? 'text-emerald-300' : fps >= 40 ? 'text-amber-300' : 'text-rose-400';
      }

      // Auto-step-down quality if sustained frame drop detected (< 46 FPS)
      if (state.qualityMode === 'auto' && !state.autoReducedTier) {
        if (fps < 46) {
          slowFrameStreak++;
          if (slowFrameStreak >= 3) {
            state.autoReducedTier = true;
            resizeCanvas();
            initStars();
          }
        } else {
          slowFrameStreak = 0;
        }
      }

      fpsFrameCount = 0;
      fpsAccumMs = 0;
    }

    animId = requestAnimationFrame(gameLoop);
  }

  function ensureLoopRunning() {
    if (!animId && !document.hidden) {
      state.lastFrameMs = performance.now();
      animId = requestAnimationFrame(gameLoop);
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (state.status === 'PLAYING') pauseGame();
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    } else {
      ensureLoopRunning();
    }
  });

  // ==========================================
  // 16. PROFILE & OFFICIAL CERTIFICATE GENERATOR
  // ==========================================
  function renderProfileModal() {
    const rankInfo = getRankForXp(state.profileXp);
    document.getElementById('inputProfileName').value = state.profileName;
    document.getElementById('profileAvatar').textContent = rankInfo.avatar;
    document.getElementById('profileRankBadge').textContent = rankInfo.badge;
    document.getElementById('profileXpText').textContent = `Total XP: ${state.profileXp.toLocaleString('id-ID')} • ${rankInfo.title}`;

    const nextMin = RANKS[Math.min(RANKS.length - 1, rankInfo.index + 1)].minXp;
    const curMin = rankInfo.minXp;
    const pct =
      rankInfo.index >= RANKS.length - 1
        ? 100
        : Math.min(100, Math.round(((state.profileXp - curMin) / Math.max(1, nextMin - curMin)) * 100));
    document.getElementById('profileXpBar').style.width = `${pct}%`;

    document.getElementById('statTotalChars').textContent = state.totalCharsLifetime.toLocaleString('id-ID');
    document.getElementById('statTotalKills').textContent = state.totalKillsLifetime.toLocaleString('id-ID');

    const overallAcc =
      state.totalKeystrokesLifetime > 0
        ? Math.round((state.totalCorrectLifetime / state.totalKeystrokesLifetime) * 100)
        : 100;
    document.getElementById('statAvgAccuracy').textContent = `${overallAcc}%`;
    document.getElementById('statBestWpm').textContent = state.bestWpm;

    const weakBox = document.getElementById('weakKeysContainer');
    weakBox.innerHTML = '';
    const sortedKeys = Object.entries(state.weakKeys).sort((a, b) => b[1] - a[1]).slice(0, 7);

    if (sortedKeys.length === 0) {
      weakBox.innerHTML = '<span class="text-xs text-slate-400 italic">Belum ada kesalahan terdeteksi. Teruslah berlatih!</span>';
    } else {
      sortedKeys.forEach(([k, count]) => {
        const badge = document.createElement('span');
        badge.className = 'px-2 py-0.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono-game text-xs flex items-center gap-1';
        badge.innerHTML = `<strong>${k.toUpperCase()}</strong>: <small>${count}x salah</small>`;
        weakBox.appendChild(badge);
      });
    }

    dom.modalProfile.classList.remove('hidden');
  }

  function drawOfficialCertificate() {
    const c = document.getElementById('certCanvas');
    const cx = c.getContext('2d');
    const w = c.width;
    const h = c.height;

    const grad = cx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, w * 0.75);
    grad.addColorStop(0, '#0c1a38');
    grad.addColorStop(0.6, '#050c1e');
    grad.addColorStop(1, '#02050c');
    cx.fillStyle = grad;
    cx.fillRect(0, 0, w, h);

    cx.strokeStyle = '#f59e0b';
    cx.lineWidth = 6;
    cx.strokeRect(20, 20, w - 40, h - 40);

    cx.strokeStyle = '#06b6d4';
    cx.lineWidth = 2;
    cx.strokeRect(32, 32, w - 64, h - 64);

    [
      [20, 20],
      [w - 20, 20],
      [20, h - 20],
      [w - 20, h - 20]
    ].forEach(([x, y]) => {
      cx.fillStyle = '#f59e0b';
      cx.beginPath();
      cx.arc(x, y, 9, 0, Math.PI * 2);
      cx.fill();
    });

    cx.fillStyle = '#38bdf8';
    cx.font = '800 14px "JetBrains Mono", monospace';
    cx.textAlign = 'center';
    cx.fillText('✦ AKADEMI PERTAHANAN MENGETIK ANTARIKSA ✦', w / 2, 75);

    cx.fillStyle = '#fef08a';
    cx.font = '900 34px "Orbitron", "Inter", sans-serif';
    cx.fillText('SERTIFIKAT KELULUSAN MENGETIK 10 JARI', w / 2, 125);

    cx.fillStyle = '#94a3b8';
    cx.font = '500 15px "Inter", sans-serif';
    cx.fillText('Dengan bangga dinyatakan bahwa kadet antariksa di bawah ini:', w / 2, 170);

    cx.fillStyle = '#ffffff';
    cx.font = '900 38px "Orbitron", sans-serif';
    cx.fillText(state.profileName.toUpperCase(), w / 2, 230);

    cx.strokeStyle = '#f59e0b';
    cx.lineWidth = 2;
    cx.beginPath();
    cx.moveTo(w / 2 - 220, 248);
    cx.lineTo(w / 2 + 220, 248);
    cx.stroke();

    const rank = getRankForXp(state.profileXp);
    cx.fillStyle = '#cbd5e1';
    cx.font = '500 16px "Inter", sans-serif';
    cx.fillText('Telah berhasil menyelesaikan rangkaian simulasi tempur dan pelatihan mengetik 10 jari', w / 2, 290);
    cx.fillText('dengan kehormatan pangkat militer kosmik:', w / 2, 318);

    cx.fillStyle = '#38bdf8';
    cx.font = '800 24px "Orbitron", sans-serif';
    cx.fillText(`★ ${rank.title.toUpperCase()} ★`, w / 2, 360);

    const overallAcc =
      state.totalKeystrokesLifetime > 0
        ? Math.round((state.totalCorrectLifetime / state.totalKeystrokesLifetime) * 100)
        : 100;

    const badgeY = 430;
    const badgeData = [
      { label: 'KECEPATAN PUNCAK', val: `${state.bestWpm} WPM`, color: '#06b6d4' },
      { label: 'RATA-RATA AKURASI', val: `${overallAcc}%`, color: '#10b981' },
      { label: 'TOTAL DIKETIK', val: `${state.totalCharsLifetime} Karakter`, color: '#f59e0b' }
    ];

    badgeData.forEach((b, i) => {
      const bx = w / 2 + (i - 1) * 260;
      cx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      cx.strokeStyle = b.color;
      cx.lineWidth = 1.6;
      cx.fillRect(bx - 110, badgeY - 26, 220, 68);
      cx.strokeRect(bx - 110, badgeY - 26, 220, 68);

      cx.fillStyle = '#94a3b8';
      cx.font = '600 11px "Inter", sans-serif';
      cx.fillText(b.label, bx, badgeY - 5);

      cx.fillStyle = b.color;
      cx.font = '800 20px "JetBrains Mono", monospace';
      cx.fillText(b.val, bx, badgeY + 24);
    });

    const dateStr = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    cx.fillStyle = '#94a3b8';
    cx.font = '12px "Inter", sans-serif';
    cx.textAlign = 'left';
    cx.fillText(`Tanggal Terbit: ${dateStr}`, 60, h - 60);
    cx.fillText('Kode Validasi: ASTRO-TYPE-' + Math.abs(state.totalCharsLifetime * 7919).toString(16).toUpperCase(), 60, h - 42);

    cx.textAlign = 'right';
    cx.fillStyle = '#f59e0b';
    cx.font = '800 13px "Orbitron", sans-serif';
    cx.fillText('Laksamana Utama: YRZQ_WLDN', w - 60, h - 60);
    cx.fillStyle = '#38bdf8';
    cx.font = '600 11px "Inter", sans-serif';
    cx.fillText('Pencipta & Komandan Armada Pusat AstroType', w - 60, h - 42);

    cx.textAlign = 'center';
    cx.fillStyle = 'rgba(6, 182, 212, 0.45)';
    cx.font = '700 11px "JetBrains Mono", monospace';
    cx.fillText('✦ RESMI • CREATED BY YRZQ_WLDN • VERIFIED GALACTIC DIPLOMA ✦', w / 2, h - 50);

    dom.modalCertView.classList.remove('hidden');
  }

  function downloadCertificatePng() {
    const c = document.getElementById('certCanvas');
    const filename = `Sertifikat_AstroType_${state.profileName.replace(/\s+/g, '_')}.png`;
    if (c.toBlob) {
      c.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = filename;
          link.href = url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(url), 4000);
          return;
        }
        fallbackDownload();
      }, 'image/png');
    } else {
      fallbackDownload();
    }
    function fallbackDownload() {
      const link = document.createElement('a');
      link.download = filename;
      link.href = c.toDataURL('image/png');
      link.click();
    }
  }

  // ==========================================
  // 17. SETTINGS, BACKUP & SOCIAL SHARE
  // ==========================================
  function updateBgmUI() {
    const btnHeader = document.getElementById('btnToggleBgm');
    if (btnHeader) {
      btnHeader.innerHTML = sound.bgmEnabled
        ? '<span class="text-cyan-300 font-bold">🎵 BGM ON</span>'
        : '<span class="text-slate-400">🎵 BGM OFF</span>';
      btnHeader.className =
        'px-2 py-1 rounded-lg text-xs font-mono font-bold transition-colors hidden md:inline-flex items-center gap-1 border ' +
        (sound.bgmEnabled
          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50'
          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200');
    }
    const btnSettings = document.getElementById('btnToggleBgmSettings');
    if (btnSettings) {
      btnSettings.textContent = sound.bgmEnabled ? 'ON' : 'OFF';
      btnSettings.className =
        'px-2.5 py-1 rounded-lg text-xs font-mono-game font-bold border transition-colors ' +
        (sound.bgmEnabled
          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
          : 'bg-slate-800 text-slate-500 border-slate-700');
    }
  }

  function updateSettingsUI() {
    const sType = sound.soundType;
    [
      { id: 'btnSoundLaser', type: 'laser' },
      { id: 'btnSoundClack', type: 'clack' },
      { id: 'btnSoundRetro', type: 'retro' }
    ].forEach(({ id, type }) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.className =
        sType === type
          ? 'p-2 rounded-lg border text-center font-mono-game transition-colors text-xs bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold'
          : 'p-2 rounded-lg border text-center font-mono-game transition-colors text-xs bg-slate-800 text-slate-400 border-slate-700 hover:text-white';
    });

    updateBgmUI();

    const btnVoice = document.getElementById('btnToggleVoice');
    if (btnVoice) {
      btnVoice.textContent = cockpitVoice.enabled ? 'ON' : 'OFF';
      btnVoice.className =
        'px-2.5 py-1 rounded-lg text-xs font-mono-game font-bold border transition-colors ' +
        (cockpitVoice.enabled
          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
          : 'bg-slate-800 text-slate-500 border-slate-700');
    }

    const btnHaptic = document.getElementById('btnToggleHaptic');
    if (btnHaptic) {
      btnHaptic.textContent = state.hapticEnabled ? 'ON' : 'OFF';
      btnHaptic.className =
        'px-2.5 py-1 rounded-lg text-xs font-mono-game font-bold border transition-colors ' +
        (state.hapticEnabled
          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          : 'bg-slate-800 text-slate-500 border-slate-700');
    }

    const btnCoach = document.getElementById('btnToggleCoach');
    if (btnCoach) {
      btnCoach.textContent = state.fingerCoachEnabled ? 'ON' : 'OFF';
      btnCoach.className =
        'px-2.5 py-1 rounded-lg text-xs font-mono-game font-bold border transition-colors ' +
        (state.fingerCoachEnabled
          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
          : 'bg-slate-800 text-slate-500 border-slate-700');
      if (dom.hudFingerCoach) dom.hudFingerCoach.style.display = state.fingerCoachEnabled ? '' : 'none';
    }

    // 3-Tier Graphics Quality (AUTO / TURBO / ULTRA)
    const btnQuality = document.getElementById('btnToggleTurbo');
    if (btnQuality) {
      const label = state.qualityMode === 'turbo' ? 'TURBO' : state.qualityMode === 'ultra' ? 'ULTRA' : 'AUTO';
      const style =
        state.qualityMode === 'turbo'
          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
          : state.qualityMode === 'ultra'
          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      btnQuality.textContent = label;
      btnQuality.className = `px-2.5 py-1 rounded-lg text-xs font-mono-game font-bold border transition-colors ${style}`;
    }

    // FPS Monitor toggle
    const btnFps = document.getElementById('btnToggleFps');
    if (btnFps) {
      btnFps.textContent = state.showFps ? 'ON' : 'OFF';
      btnFps.className =
        'px-2.5 py-1 rounded-lg text-xs font-mono-game font-bold border transition-colors ' +
        (state.showFps
          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          : 'bg-slate-800 text-slate-500 border-slate-700');
    }
    if (dom.fpsBadge) dom.fpsBadge.classList.toggle('hidden', !state.showFps);

    const btnFs = document.getElementById('btnSettingsFullscreen');
    if (btnFs) btnFs.textContent = document.fullscreenElement ? 'KELUAR' : 'AKTIFKAN';
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      const req = document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen;
      if (req) Promise.resolve(req.call(document.documentElement)).catch(() => {});
    } else {
      const exit = document.exitFullscreen || document.webkitExitFullscreen;
      if (exit) Promise.resolve(exit.call(document)).catch(() => {});
    }
  }

  function exportBackupData() {
    try {
      storage.flush();
      const backup = {
        version: 3,
        profileName: state.profileName,
        profileXp: state.profileXp,
        selectedShipId: state.selectedShipId,
        highScore: state.highScore,
        bestWpm: state.bestWpm,
        totalCharsLifetime: state.totalCharsLifetime,
        totalKillsLifetime: state.totalKillsLifetime,
        totalKeystrokesLifetime: state.totalKeystrokesLifetime,
        totalCorrectLifetime: state.totalCorrectLifetime,
        weakKeys: state.weakKeys,
        academyCompleted: state.academyCompleted,
        campaignCompleted: state.campaignCompleted,
        endlessBestWave: state.endlessBestWave,
        endlessBestScore: state.endlessBestScore,
        blitzBestWpm: state.blitzBestWpm,
        blitzBestAcc: state.blitzBestAcc,
        dailyStreakDays: state.dailyStreakDays,
        dailyLastDate: state.dailyLastDate,
        dailyKills: state.dailyKills,
        dailyBestWpm: state.dailyBestWpm,
        dailyEmpCount: state.dailyEmpCount,
        dailyRewardClaimed: state.dailyRewardClaimed,
        soundType: sound.soundType,
        muted: sound.muted,
        bgmEnabled: sound.bgmEnabled,
        voiceAnnouncerEnabled: cockpitVoice.enabled,
        hapticEnabled: state.hapticEnabled,
        fingerCoachEnabled: state.fingerCoachEnabled,
        qualityMode: state.qualityMode,
        showFps: state.showFps,
        creator: 'YRZQ_WLDN',
        exportedAt: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const cleanName = (state.profileName || 'kadet').replace(/[^a-zA-Z0-9_-]/g, '_');
      a.href = url;
      a.download = `astrotype_backup_${cleanName}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      addFloatingText('Cadangan Berhasil Diekspor!', state.vw / 2, 80, '#22d3ee', 14);
    } catch (e) {
      alert('Gagal mengekspor data: ' + e.message);
    }
  }

  function importBackupData(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data || typeof data !== 'object') throw new Error('Format file tidak valid');

        const assign = (k, val) => {
          state[k] = val;
          storage.set(k, val);
        };

        if (typeof data.profileName === 'string' && data.profileName.trim()) assign('profileName', data.profileName.trim());
        if (typeof data.profileXp === 'number') assign('profileXp', data.profileXp);
        if (typeof data.selectedShipId === 'string') assign('selectedShipId', data.selectedShipId);
        if (typeof data.highScore === 'number') assign('highScore', data.highScore);
        if (typeof data.bestWpm === 'number') assign('bestWpm', data.bestWpm);
        if (typeof data.totalCharsLifetime === 'number') assign('totalCharsLifetime', data.totalCharsLifetime);
        if (typeof data.totalKillsLifetime === 'number') assign('totalKillsLifetime', data.totalKillsLifetime);
        if (typeof data.totalKeystrokesLifetime === 'number') assign('totalKeystrokesLifetime', data.totalKeystrokesLifetime);
        if (typeof data.totalCorrectLifetime === 'number') assign('totalCorrectLifetime', data.totalCorrectLifetime);
        if (data.weakKeys && typeof data.weakKeys === 'object') assign('weakKeys', data.weakKeys);
        if (data.academyCompleted && typeof data.academyCompleted === 'object') assign('academyCompleted', data.academyCompleted);
        if (data.campaignCompleted && typeof data.campaignCompleted === 'object') assign('campaignCompleted', data.campaignCompleted);
        if (typeof data.endlessBestWave === 'number') assign('endlessBestWave', data.endlessBestWave);
        if (typeof data.endlessBestScore === 'number') assign('endlessBestScore', data.endlessBestScore);
        if (typeof data.blitzBestWpm === 'number') assign('blitzBestWpm', data.blitzBestWpm);
        if (typeof data.blitzBestAcc === 'number') assign('blitzBestAcc', data.blitzBestAcc);
        if (typeof data.dailyStreakDays === 'number') assign('dailyStreakDays', data.dailyStreakDays);
        if (typeof data.dailyKills === 'number') assign('dailyKills', data.dailyKills);
        if (typeof data.dailyBestWpm === 'number') assign('dailyBestWpm', data.dailyBestWpm);
        if (typeof data.dailyEmpCount === 'number') assign('dailyEmpCount', data.dailyEmpCount);
        if (typeof data.dailyRewardClaimed === 'boolean') assign('dailyRewardClaimed', data.dailyRewardClaimed);
        if (typeof data.soundType === 'string') {
          sound.soundType = data.soundType;
          storage.set('soundType', data.soundType);
        }
        if (typeof data.muted === 'boolean') sound.setMuted(data.muted);
        if (typeof data.bgmEnabled === 'boolean') {
          sound.bgmEnabled = data.bgmEnabled;
          storage.set('bgmEnabled', data.bgmEnabled);
        }
        if (typeof data.voiceAnnouncerEnabled === 'boolean') {
          cockpitVoice.enabled = data.voiceAnnouncerEnabled;
          storage.set('voiceAnnouncerEnabled', data.voiceAnnouncerEnabled);
        }
        if (typeof data.hapticEnabled === 'boolean') assign('hapticEnabled', data.hapticEnabled);
        if (typeof data.fingerCoachEnabled === 'boolean') assign('fingerCoachEnabled', data.fingerCoachEnabled);
        if (typeof data.qualityMode === 'string') assign('qualityMode', data.qualityMode);
        if (typeof data.showFps === 'boolean') assign('showFps', data.showFps);

        storage.flush();
        updateSettingsUI();
        updateMenuHeaderStats();
        updateHud(true);
        renderAcademyCards();
        renderCampaignCards();
        renderHangarCards();
        renderDailyMissions();
        renderWeakKeysDrillUI();
        addFloatingText('Data Berhasil Dipulihkan!', state.vw / 2, 80, '#4ade80', 14);
        alert('Pemulihan akun dan progres berhasil!');
      } catch (err) {
        alert('Gagal memulihkan file cadangan: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  function resetAllProgress() {
    if (!confirm('Peringatan: Reset seluruh progres Akademi, Kampanye, Hangar, dan Rekor Skor ke setelan awal?')) return;
    storage.removeKeys([
      'profileName', 'profileXp', 'selectedShipId', 'highScore', 'bestWpm',
      'totalCharsLifetime', 'totalKillsLifetime', 'totalKeystrokesLifetime', 'totalCorrectLifetime',
      'weakKeys', 'academyCompleted', 'campaignCompleted',
      'endlessBestWave', 'endlessBestScore', 'blitzBestWpm', 'blitzBestAcc',
      'dailyStreakDays', 'dailyLastDate', 'dailyKills', 'dailyBestWpm', 'dailyEmpCount', 'dailyRewardClaimed',
      'lastAcademyIdx', 'lastSectorIdx'
    ]);
    location.reload();
  }

  function shareToWhatsApp() {
    const rank = dom.resultRank.textContent || 'A';
    const wpm = dom.resWpm.textContent || '0';
    const acc = dom.resAccuracy.textContent || '100%';
    const text = `🚀 Rekor Baru di AstroType!\n🎖️ Pangkat: Rank ${rank}\n⚡ Kecepatan: ${wpm} WPM\n🎯 Akurasi: ${acc}\n\nGame simulator mengetik 10 jari & pertahanan antariksa.\nCreated by YRZQ_WLDN.\nMainkan langsung: ${window.location.href}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  }

  function shareViaWebShare() {
    const rank = dom.resultRank.textContent || 'A';
    const wpm = dom.resWpm.textContent || '0';
    const acc = dom.resAccuracy.textContent || '100%';
    const text = `Saya meraih ${wpm} WPM (Rank ${rank}, Akurasi ${acc}) di AstroType! Created by YRZQ_WLDN.`;
    if (navigator.share) {
      navigator.share({ title: 'AstroType: Pertahanan Galaksi', text, url: window.location.href }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(`${text}\n${window.location.href}`).then(() => {
        addFloatingText('📋 Tautan & Skor Berhasil Disalin!', state.vw / 2, 80, '#22d3ee', 13);
      });
    }
  }

  // ==========================================
  // 18. MOBILE NATIVE KEYBOARD MODE
  // ==========================================
  function enableNativeKeyboardMode() {
    state.nativeKbActive = true;
    if (dom.mobileHiddenInput) dom.mobileHiddenInput.focus();
    if (dom.virtualKeyboardSection) dom.virtualKeyboardSection.classList.add('hidden');
    if (dom.nativeKbActiveIndicator) dom.nativeKbActiveIndicator.classList.remove('hidden');
    resizeCanvas();
    addFloatingText('📱 Keyboard HP Aktif', state.vw / 2, 70, '#22d3ee', 12);
  }

  function disableNativeKeyboardMode() {
    state.nativeKbActive = false;
    if (dom.mobileHiddenInput) dom.mobileHiddenInput.blur();
    if (dom.virtualKeyboardSection) dom.virtualKeyboardSection.classList.remove('hidden');
    if (dom.nativeKbActiveIndicator) dom.nativeKbActiveIndicator.classList.add('hidden');
    resizeCanvas();
    addFloatingText('⌨️ Keyboard Layar Aktif', state.vw / 2, 70, '#38bdf8', 12);
  }

  // ==========================================
  // 19. INPUT & EVENT LISTENERS
  // ==========================================
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    if ((e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') && e.target.id !== 'mobileHiddenInput') return;

    // ESC dismisses open secondary modals, toggles pause, or unlocks target
    if (e.key === 'Escape') {
      if (!dom.modalSettings.classList.contains('hidden')) {
        dom.modalSettings.classList.add('hidden');
        return;
      }
      if (!dom.modalCertView.classList.contains('hidden')) {
        dom.modalCertView.classList.add('hidden');
        return;
      }
      if (!dom.modalProfile.classList.contains('hidden')) {
        dom.modalProfile.classList.add('hidden');
        return;
      }
      if (!dom.modalStartMenu.classList.contains('hidden')) {
        closeModeMenu();
        return;
      }
      if (state.status === 'PAUSED') {
        resumeGame();
        return;
      }
      if (state.status === 'PLAYING') {
        e.preventDefault();
        flashVirtualKey('lepas', 'normal');
        if (state.lockedEnemyId !== null) clearLockedTarget();
        else pauseGame();
        return;
      }
    }

    if (state.status !== 'PLAYING') {
      if (state.status === 'MENU' && e.key === 'Enter') {
        e.preventDefault();
        startGame();
        return;
      }
      if (/^[a-zA-Z0-9\-\;\,\.]$/.test(e.key) || e.key === ' ' || e.key === 'Backspace') {
        flashVirtualKey(e.key, 'normal');
      }
      return;
    }

    if (e.key === 'Backspace' || e.key === 'Tab') {
      e.preventDefault();
      flashVirtualKey('hapus', 'normal');
      clearLockedTarget();
      return;
    }

    if (e.key === ' ') {
      e.preventDefault();
      flashVirtualKey(' ', 'normal');
      triggerEmpNova();
      return;
    }

    if (/^[a-zA-Z0-9\-\;\,\.]$/.test(e.key)) {
      e.preventDefault();
      handleCharacterInput(e.key);
    }
  });

  // Canvas tap to lock onto closest enemy (does NOT force popup native keyboard unless already active!)
  canvas.addEventListener('pointerdown', (e) => {
    if (state.status !== 'PLAYING') return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    let closest = null;
    let minDist = 78;
    for (let i = 0; i < state.enemies.length; i++) {
      const enemy = state.enemies[i];
      const d = Math.hypot(enemy.x - clickX, enemy.y - clickY);
      if (d < minDist) {
        minDist = d;
        closest = enemy;
      }
    }
    if (closest) {
      state.lockedEnemyId = closest.id;
      updateNextKeyHint();
      updateHud();
    }

    if (state.nativeKbActive && dom.mobileHiddenInput) {
      dom.mobileHiddenInput.focus();
    }
  });

  // Hidden Mobile Native Keyboard input capture
  if (dom.mobileHiddenInput) {
    dom.mobileHiddenInput.addEventListener('input', () => {
      const val = dom.mobileHiddenInput.value;
      if (val) {
        for (let i = 0; i < val.length; i++) {
          const ch = val[i];
          if (state.status === 'PLAYING') {
            if (ch === ' ') triggerEmpNova();
            else if (/^[a-zA-Z0-9\-\;\,\.]$/.test(ch)) handleCharacterInput(ch);
          } else {
            flashVirtualKey(ch, 'normal');
          }
        }
      }
      dom.mobileHiddenInput.value = '';
    });
    dom.mobileHiddenInput.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' || e.key === 'Escape') {
        if (state.status === 'PLAYING') clearLockedTarget();
      } else if (e.key === ' ') {
        e.preventDefault();
        if (state.status === 'PLAYING') triggerEmpNova();
      }
    });
  }

  // Bind UI Buttons cleanly
  document.getElementById('btnBrandHome')?.addEventListener('click', openModeMenu);
  document.getElementById('btnOpenModes')?.addEventListener('click', openModeMenu);
  document.getElementById('btnCloseStartMenu')?.addEventListener('click', closeModeMenu);
  document.getElementById('btnPauseGame')?.addEventListener('click', () => {
    if (state.status === 'PLAYING') pauseGame();
    else if (state.status === 'PAUSED') resumeGame();
    else openModeMenu();
  });

  // Pause Modal Buttons
  document.getElementById('btnPauseResume')?.addEventListener('click', resumeGame);
  document.getElementById('btnPauseRestart')?.addEventListener('click', startGame);
  document.getElementById('btnPauseSettings')?.addEventListener('click', () => {
    updateSettingsUI();
    dom.modalSettings.classList.remove('hidden');
  });
  document.getElementById('btnPauseMenu')?.addEventListener('click', openModeMenu);

  // Profile & Cert
  document.getElementById('btnOpenProfile')?.addEventListener('click', renderProfileModal);
  document.getElementById('btnCloseProfile')?.addEventListener('click', () => dom.modalProfile.classList.add('hidden'));
  document.getElementById('inputProfileName')?.addEventListener('change', (e) => {
    state.profileName = e.target.value.trim() || 'Kadet Antariksa';
    storage.set('profileName', state.profileName, true);
    if (dom.hudProfileName) dom.hudProfileName.textContent = state.profileName;
  });
  document.getElementById('btnGenerateCert')?.addEventListener('click', drawOfficialCertificate);
  document.getElementById('btnCloseCert')?.addEventListener('click', () => dom.modalCertView.classList.add('hidden'));
  document.getElementById('btnCertBack')?.addEventListener('click', () => dom.modalCertView.classList.add('hidden'));
  document.getElementById('btnDownloadCertPng')?.addEventListener('click', downloadCertificatePng);

  // Settings Modal
  document.getElementById('btnOpenSettings')?.addEventListener('click', () => {
    updateSettingsUI();
    dom.modalSettings.classList.remove('hidden');
  });
  document.getElementById('btnCloseSettings')?.addEventListener('click', () => dom.modalSettings.classList.add('hidden'));
  document.getElementById('btnSettingsDone')?.addEventListener('click', () => dom.modalSettings.classList.add('hidden'));

  document.getElementById('btnSoundLaser')?.addEventListener('click', () => {
    sound.soundType = 'laser';
    storage.set('soundType', 'laser', true);
    updateSettingsUI();
    sound.playKeySound(0);
  });
  document.getElementById('btnSoundClack')?.addEventListener('click', () => {
    sound.soundType = 'clack';
    storage.set('soundType', 'clack', true);
    updateSettingsUI();
    sound.playKeySound(0);
  });
  document.getElementById('btnSoundRetro')?.addEventListener('click', () => {
    sound.soundType = 'retro';
    storage.set('soundType', 'retro', true);
    updateSettingsUI();
    sound.playKeySound(0);
  });

  document.getElementById('btnToggleSound')?.addEventListener('click', () => {
    sound.setMuted(!sound.muted);
    dom.iconSoundOn.classList.toggle('hidden', sound.muted);
    dom.iconSoundOff.classList.toggle('hidden', !sound.muted);
  });

  const handleToggleBgm = () => {
    sound.toggleBGM();
    updateBgmUI();
  };
  document.getElementById('btnToggleBgm')?.addEventListener('click', handleToggleBgm);
  document.getElementById('btnToggleBgmSettings')?.addEventListener('click', handleToggleBgm);

  document.getElementById('btnToggleVoice')?.addEventListener('click', () => {
    cockpitVoice.enabled = !cockpitVoice.enabled;
    storage.set('voiceAnnouncerEnabled', cockpitVoice.enabled, true);
    updateSettingsUI();
    if (cockpitVoice.enabled) cockpitVoice.speak('Penyiar suara kokpit aktif.');
  });

  document.getElementById('btnToggleHaptic')?.addEventListener('click', () => {
    state.hapticEnabled = !state.hapticEnabled;
    storage.set('hapticEnabled', state.hapticEnabled, true);
    updateSettingsUI();
    if (state.hapticEnabled) triggerHaptic('hit');
  });

  document.getElementById('btnToggleCoach')?.addEventListener('click', () => {
    state.fingerCoachEnabled = !state.fingerCoachEnabled;
    storage.set('fingerCoachEnabled', state.fingerCoachEnabled, true);
    updateSettingsUI();
    updateNextKeyHint();
  });

  // Cycle Quality Mode: AUTO -> TURBO -> ULTRA -> AUTO
  document.getElementById('btnToggleTurbo')?.addEventListener('click', () => {
    const order = ['auto', 'turbo', 'ultra'];
    const nextIdx = (order.indexOf(state.qualityMode) + 1) % order.length;
    state.qualityMode = order[nextIdx];
    state.autoReducedTier = false;
    storage.set('qualityMode', state.qualityMode, true);
    updateSettingsUI();
    resizeCanvas();
    initStars();
    const names = { auto: '⚡ Auto-FPS Adaptif', turbo: '🚀 Mode Turbo Maksimum', ultra: '✨ Visual Ultra HD' };
    addFloatingText(names[state.qualityMode], state.vw / 2, 70, '#fbbf24', 12);
  });

  document.getElementById('btnToggleFps')?.addEventListener('click', () => {
    state.showFps = !state.showFps;
    storage.set('showFps', state.showFps, true);
    updateSettingsUI();
  });

  document.getElementById('btnToggleFullscreen')?.addEventListener('click', toggleFullscreen);
  document.getElementById('btnSettingsFullscreen')?.addEventListener('click', () => {
    toggleFullscreen();
    setTimeout(updateSettingsUI, 280);
  });

  document.getElementById('btnExportData')?.addEventListener('click', exportBackupData);
  document.getElementById('btnImportData')?.addEventListener('click', () => document.getElementById('importFileInput')?.click());
  document.getElementById('importFileInput')?.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      importBackupData(e.target.files[0]);
      e.target.value = '';
    }
  });
  document.getElementById('btnResetProgress')?.addEventListener('click', resetAllProgress);

  // Keyboard & HUD controls
  document.getElementById('btnToggleKeyboard')?.addEventListener('click', () => {
    if (state.nativeKbActive) {
      disableNativeKeyboardMode();
      return;
    }
    dom.virtualKeyboardSection.classList.toggle('hidden');
    resizeCanvas();
  });

  document.querySelectorAll('.btn-trigger-native-kb').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      enableNativeKeyboardMode();
    });
  });
  document.getElementById('btnSwitchToVirtualKb')?.addEventListener('click', (e) => {
    e.preventDefault();
    disableNativeKeyboardMode();
  });

  dom.btnToggleNumRow?.addEventListener('click', (e) => {
    e.preventDefault();
    state.showNumRow = !state.showNumRow;
    storage.set('showNumRow', state.showNumRow, true);
    renderVirtualKeyboard();
    resizeCanvas();
  });

  document.getElementById('btnClearTarget')?.addEventListener('click', clearLockedTarget);
  dom.btnEmpNova?.addEventListener('click', triggerEmpNova);

  // Menu Tabs & Launchers
  ['Academy', 'Campaign', 'Endless', 'Blitz', 'Hangar', 'Missions', 'Custom'].forEach((t) => {
    document.getElementById(`tabBtn${t}`)?.addEventListener('click', () => switchTab(t));
  });

  document.getElementById('btnStartWeakDrill')?.addEventListener('click', () => startWeakKeysDrill());
  document.getElementById('btnDrillWeakKeys')?.addEventListener('click', () => startWeakKeysDrill());
  document.getElementById('btnResultDrillWeak')?.addEventListener('click', () => startWeakKeysDrill(state.sessionWeakKeys));

  document.getElementById('btnStartEndless')?.addEventListener('click', () => {
    state.gameMode = 'ENDLESS';
    startGame();
  });
  document.getElementById('btnStartBlitz')?.addEventListener('click', () => {
    state.gameMode = 'BLITZ';
    startGame();
  });

  const highlightPreset = (activeId) => {
    ['btnPresetIndo', 'btnPresetEng', 'btnPresetCode'].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.className =
        id === activeId
          ? 'p-2.5 rounded-xl border border-cyan-400/60 bg-cyan-950/50 text-left transition-colors'
          : 'p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-left hover:border-slate-700 transition-colors';
    });
  };
  document.getElementById('btnPresetIndo')?.addEventListener('click', () => {
    state.customWordList = WORD_BANKS.indo;
    state.customLabel = 'Kosakata Bahasa Indonesia';
    highlightPreset('btnPresetIndo');
  });
  document.getElementById('btnPresetEng')?.addEventListener('click', () => {
    state.customWordList = WORD_BANKS.eng;
    state.customLabel = 'English Vocabulary';
    highlightPreset('btnPresetEng');
  });
  document.getElementById('btnPresetCode')?.addEventListener('click', () => {
    state.customWordList = WORD_BANKS.coder;
    state.customLabel = 'Coder / Programming';
    highlightPreset('btnPresetCode');
  });
  document.getElementById('btnStartCustom')?.addEventListener('click', () => {
    const txt = (document.getElementById('customWordInput')?.value || '').trim();
    if (txt) {
      const words = txt
        .split(/[\s,]+/)
        .map((w) => w.replace(/[^a-zA-Z0-9\-\;\,\.]/g, '').toLowerCase())
        .filter((w) => w.length >= 2);
      if (words.length > 0) {
        state.customWordList = words;
        state.customLabel = 'Sesi Kata Kustom';
      }
    }
    state.gameMode = 'CUSTOM';
    startGame();
  });

  document.getElementById('btnLaunchActive')?.addEventListener('click', startGame);

  // Result modal actions
  document.getElementById('btnResultMenu')?.addEventListener('click', openModeMenu);
  document.getElementById('btnResultRetry')?.addEventListener('click', startGame);
  document.getElementById('btnResultNext')?.addEventListener('click', () => {
    if (state.gameMode === 'ACADEMY') {
      state.activeLessonIdx = Math.min(ACADEMY_LESSONS.length - 1, state.activeLessonIdx + 1);
      storage.set('lastAcademyIdx', state.activeLessonIdx, true);
    } else if (state.gameMode === 'CAMPAIGN') {
      state.activeSectorIdx = Math.min(CAMPAIGN_SECTORS.length - 1, state.activeSectorIdx + 1);
      storage.set('lastSectorIdx', state.activeSectorIdx, true);
    }
    startGame();
  });
  document.getElementById('btnShareWhatsApp')?.addEventListener('click', shareToWhatsApp);
  document.getElementById('btnWebShare')?.addEventListener('click', shareViaWebShare);

  // Backdrop click dismissal
  ['modalSettings', 'modalProfile', 'modalCertView'].forEach((id) => {
    const m = document.getElementById(id);
    if (m) {
      m.addEventListener('click', (e) => {
        if (e.target === m) m.classList.add('hidden');
      });
    }
  });
  dom.modalStartMenu?.addEventListener('click', (e) => {
    if (e.target === dom.modalStartMenu) closeModeMenu();
  });

  // One-time Audio unlock
  const unlockAudio = () => {
    sound.init();
    if (sound.bgmEnabled && !sound.muted) sound.startBGM();
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('pointerdown', unlockAudio, { passive: true });
  window.addEventListener('touchstart', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });

  // Service Worker registration
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }

  // ==========================================
  // 20. BOOTSTRAP
  // ==========================================
  function boot() {
    initSprites();
    resizeCanvas();
    initStars();
    renderVirtualKeyboard();
    checkDailyReset();
    renderAcademyCards();
    renderCampaignCards();
    renderHangarCards();
    renderDailyMissions();
    renderWeakKeysDrillUI();
    updateMenuHeaderStats();
    updateLaunchButtonLabel();
    updateSettingsUI();
    updateHud(true);

    dom.iconSoundOn.classList.toggle('hidden', sound.muted);
    dom.iconSoundOff.classList.toggle('hidden', !sound.muted);

    ensureLoopRunning();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window);
