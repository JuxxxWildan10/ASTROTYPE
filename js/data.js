/* ==========================================================================
   AstroType v3.0 — Game Data, Curriculum, Sectors, Word Banks, Ranks & Ships
   Created & Developed by YRZQ_WLDN
   ========================================================================== */
(function (global) {
  'use strict';

  const AstroType = (global.AstroType = global.AstroType || {});

  // ==========================================
  // 1. FINGER PLACEMENT MATRIX & COLOR MAP
  // ==========================================
  AstroType.FINGER_MAP = {
    // Left Hand
    '1': { finger: 'Kelingking Kiri', hand: 'Kiri', color: '#f43f5e', css: 'finger-pinky-l' },
    'q': { finger: 'Kelingking Kiri', hand: 'Kiri', color: '#f43f5e', css: 'finger-pinky-l' },
    'a': { finger: 'Kelingking Kiri', hand: 'Kiri', color: '#f43f5e', css: 'finger-pinky-l' },
    'z': { finger: 'Kelingking Kiri', hand: 'Kiri', color: '#f43f5e', css: 'finger-pinky-l' },

    '2': { finger: 'Manis Kiri', hand: 'Kiri', color: '#f97316', css: 'finger-ring-l' },
    'w': { finger: 'Manis Kiri', hand: 'Kiri', color: '#f97316', css: 'finger-ring-l' },
    's': { finger: 'Manis Kiri', hand: 'Kiri', color: '#f97316', css: 'finger-ring-l' },
    'x': { finger: 'Manis Kiri', hand: 'Kiri', color: '#f97316', css: 'finger-ring-l' },

    '3': { finger: 'Tengah Kiri', hand: 'Kiri', color: '#eab308', css: 'finger-mid-l' },
    'e': { finger: 'Tengah Kiri', hand: 'Kiri', color: '#eab308', css: 'finger-mid-l' },
    'd': { finger: 'Tengah Kiri', hand: 'Kiri', color: '#eab308', css: 'finger-mid-l' },
    'c': { finger: 'Tengah Kiri', hand: 'Kiri', color: '#eab308', css: 'finger-mid-l' },

    '4': { finger: 'Telunjuk Kiri', hand: 'Kiri', color: '#22c55e', css: 'finger-idx-l' },
    '5': { finger: 'Telunjuk Kiri', hand: 'Kiri', color: '#22c55e', css: 'finger-idx-l' },
    'r': { finger: 'Telunjuk Kiri', hand: 'Kiri', color: '#22c55e', css: 'finger-idx-l' },
    't': { finger: 'Telunjuk Kiri', hand: 'Kiri', color: '#22c55e', css: 'finger-idx-l' },
    'f': { finger: 'Telunjuk Kiri', hand: 'Kiri', color: '#22c55e', css: 'finger-idx-l' },
    'g': { finger: 'Telunjuk Kiri', hand: 'Kiri', color: '#22c55e', css: 'finger-idx-l' },
    'v': { finger: 'Telunjuk Kiri', hand: 'Kiri', color: '#22c55e', css: 'finger-idx-l' },
    'b': { finger: 'Telunjuk Kiri', hand: 'Kiri', color: '#22c55e', css: 'finger-idx-l' },

    // Right Hand
    '6': { finger: 'Telunjuk Kanan', hand: 'Kanan', color: '#0ea5e9', css: 'finger-idx-r' },
    '7': { finger: 'Telunjuk Kanan', hand: 'Kanan', color: '#0ea5e9', css: 'finger-idx-r' },
    'y': { finger: 'Telunjuk Kanan', hand: 'Kanan', color: '#0ea5e9', css: 'finger-idx-r' },
    'u': { finger: 'Telunjuk Kanan', hand: 'Kanan', color: '#0ea5e9', css: 'finger-idx-r' },
    'h': { finger: 'Telunjuk Kanan', hand: 'Kanan', color: '#0ea5e9', css: 'finger-idx-r' },
    'j': { finger: 'Telunjuk Kanan', hand: 'Kanan', color: '#0ea5e9', css: 'finger-idx-r' },
    'n': { finger: 'Telunjuk Kanan', hand: 'Kanan', color: '#0ea5e9', css: 'finger-idx-r' },
    'm': { finger: 'Telunjuk Kanan', hand: 'Kanan', color: '#0ea5e9', css: 'finger-idx-r' },

    '8': { finger: 'Tengah Kanan', hand: 'Kanan', color: '#6366f1', css: 'finger-mid-r' },
    'i': { finger: 'Tengah Kanan', hand: 'Kanan', color: '#6366f1', css: 'finger-mid-r' },
    'k': { finger: 'Tengah Kanan', hand: 'Kanan', color: '#6366f1', css: 'finger-mid-r' },
    ',': { finger: 'Tengah Kanan', hand: 'Kanan', color: '#6366f1', css: 'finger-mid-r' },

    '9': { finger: 'Manis Kanan', hand: 'Kanan', color: '#a855f7', css: 'finger-ring-r' },
    'o': { finger: 'Manis Kanan', hand: 'Kanan', color: '#a855f7', css: 'finger-ring-r' },
    'l': { finger: 'Manis Kanan', hand: 'Kanan', color: '#a855f7', css: 'finger-ring-r' },
    '.': { finger: 'Manis Kanan', hand: 'Kanan', color: '#a855f7', css: 'finger-ring-r' },

    '0': { finger: 'Kelingking Kanan', hand: 'Kanan', color: '#ec4899', css: 'finger-pinky-r' },
    'p': { finger: 'Kelingking Kanan', hand: 'Kanan', color: '#ec4899', css: 'finger-pinky-r' },
    ';': { finger: 'Kelingking Kanan', hand: 'Kanan', color: '#ec4899', css: 'finger-pinky-r' },
    '-': { finger: 'Kelingking Kanan', hand: 'Kanan', color: '#ec4899', css: 'finger-pinky-r' },
    '/': { finger: 'Kelingking Kanan', hand: 'Kanan', color: '#ec4899', css: 'finger-pinky-r' },

    ' ': { finger: 'Ibu Jari (Spasi / EMP)', hand: 'Bebas', color: '#06b6d4', css: 'finger-thumb' }
  };

  // ==========================================
  // 2. ACADEMY CURRICULUM (12 PROGRESSIVE LESSONS)
  // ==========================================
  AstroType.ACADEMY_LESSONS = [
    {
      id: 'acad_1',
      code: 'MODUL 1',
      title: 'Fondasi Telunjuk (F & J)',
      subtitle: 'Tonjolan Taktil & Posisi Rumah',
      targetKills: 12,
      speed: 0.36,
      keys: ['f', 'j'],
      words: ['f', 'j', 'ff', 'jj', 'fj', 'jf', 'fjf', 'jfj', 'fjj', 'jff', 'ffj', 'jjf'],
      desc: 'Sentuh tonjolan kecil pada tombol F (telunjuk kiri) dan J (telunjuk kanan). Jaga posisi rileks.'
    },
    {
      id: 'acad_2',
      code: 'MODUL 2',
      title: 'Jari Tengah (D & K)',
      subtitle: 'Perluasan Baris Rumah Inti',
      targetKills: 14,
      speed: 0.38,
      keys: ['d', 'k', 'f', 'j'],
      words: ['dk', 'kd', 'fd', 'jk', 'dfj', 'kdf', 'kjk', 'dfk', 'kjd', 'fjd', 'dkf', 'jkd', 'fdk', 'kdj'],
      desc: 'Gunakan jari tengah kiri untuk D dan jari tengah kanan untuk K. Jangan angkat telunjukmu.'
    },
    {
      id: 'acad_3',
      code: 'MODUL 3',
      title: 'Jari Manis (S & L)',
      subtitle: 'Memperkuat Jari Manis',
      targetKills: 15,
      speed: 0.40,
      keys: ['s', 'l', 'd', 'k', 'f', 'j'],
      words: ['sl', 'ls', 'sdl', 'lsk', 'fsl', 'jls', 'sdk', 'kfs', 'sld', 'ksl', 'dsf', 'lks', 'jds', 'fls'],
      desc: 'Jari manis sering terasa kaku. Latih kelenturan mengetik S (kiri) dan L (kanan).'
    },
    {
      id: 'acad_4',
      code: 'MODUL 4',
      title: 'Jari Kelingking (A & ;)',
      subtitle: 'Batas Luar Baris Rumah',
      targetKills: 16,
      speed: 0.42,
      keys: ['a', ';', 's', 'l', 'd', 'k', 'f', 'j'],
      words: ['as', 'la', 'a;', 'as;', 'la;', 'all', 'ask', 'ja;', 'fa;', 'da;', 'fall', 'flask', 'salad', 'ask;', 'alas'],
      desc: 'Kelingking kiri memegang A, kelingking kanan memegang titik koma (;).'
    },
    {
      id: 'acad_5',
      code: 'MODUL 5',
      title: 'Jangkauan Tengah (G & H)',
      subtitle: 'Gerakan Menyamping Telunjuk',
      targetKills: 18,
      speed: 0.45,
      keys: ['g', 'h', 'a', 's', 'd', 'f', 'j', 'k', 'l'],
      words: ['gas', 'hal', 'gajah', 'gala', 'sah', 'khas', 'had', 'glad', 'flash', 'hag', 'jaga', 'lagak', 'saha', 'dag'],
      desc: 'Telunjuk kiri menjangkau G lalu kembali ke F. Telunjuk kanan menjangkau H lalu kembali ke J.'
    },
    {
      id: 'acad_6',
      code: 'MODUL 6',
      title: 'Master Baris Rumah (Home Row)',
      subtitle: 'Kombinasi Lancar Semua Kata Rumah',
      targetKills: 20,
      speed: 0.48,
      keys: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
      words: ['gajah', 'salah', 'kalah', 'galak', 'halal', 'saja', 'lada', 'jala', 'jasa', 'kasa', 'dasa', 'hafa', 'lagak', 'gagah', 'sadar'],
      desc: 'Ujian ketangkasan 100% baris rumah tanpa mengangkat tangan dari keyboard.'
    },
    {
      id: 'acad_7',
      code: 'MODUL 7',
      title: 'Baris Atas: E, I, R, U',
      subtitle: 'Vokal & Konsonan Frekuensi Tinggi',
      targetKills: 22,
      speed: 0.50,
      keys: ['e', 'i', 'r', 'u'],
      words: ['air', 'api', 'ria', 'ide', 'era', 'rusuk', 'iris', 'ruas', 'uji', 'arus', 'jari', 'seri', 'sire', 'rugi', 'riuh', 'eduk'],
      desc: 'Jari tengah naik ke E & I. Jari telunjuk naik ke R & U. Kembalikan jari setelah memencet.'
    },
    {
      id: 'acad_8',
      code: 'MODUL 8',
      title: 'Baris Atas Lengkap (Q, W, T, Y, O, P)',
      subtitle: 'Seluruh Baris QWERTY',
      targetKills: 22,
      speed: 0.54,
      keys: ['q', 'w', 't', 'y', 'o', 'p'],
      words: ['topi', 'waktu', 'putra', 'optik', 'kuota', 'proton', 'rotasi', 'poros', 'pilot', 'orbit', 'pita', 'daya', 'trio', 'karya', 'teori'],
      desc: 'Jangkau Q dan P dengan kelingking. W dan O dengan jari manis.'
    },
    {
      id: 'acad_9',
      code: 'MODUL 9',
      title: 'Baris Bawah (Z, X, C, V, B, N, M)',
      subtitle: 'Menjangkau Baris Bawah dengan Luwes',
      targetKills: 24,
      speed: 0.56,
      keys: ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
      words: ['bumi', 'bulan', 'bintang', 'cahaya', 'nova', 'vakum', 'zenit', 'kabut', 'atom', 'foton', 'mesin', 'awan', 'cakra', 'zona', 'bambu'],
      desc: 'Gerakkan jari ke bawah secara miring tanpa mengubah sudut pergelangan tangan.'
    },
    {
      id: 'acad_10',
      code: 'MODUL 10',
      title: 'Kecepatan Alfabet Penuh (A–Z)',
      subtitle: 'Refleks Gabungan Seluruh Kosakata',
      targetKills: 25,
      speed: 0.62,
      keys: ['all'],
      words: ['galaksi', 'planet', 'satelit', 'komet', 'nebula', 'kompas', 'perisai', 'sinyal', 'sensor', 'modul', 'energi', 'plasma', 'kokpit', 'roket', 'orbit'],
      desc: 'Gabungkan seluruh baris rumah, atas, dan bawah secara ritmis dan harmonis.'
    },
    {
      id: 'acad_11',
      code: 'MODUL 11',
      title: 'Baris Angka (1–0 Antariksa)',
      subtitle: 'Koordinat & Data Sektor',
      targetKills: 25,
      speed: 0.62,
      keys: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-'],
      needsNumRow: true,
      words: ['sektor-1', 'apollo-11', 'voyager-2', 'kepler-22', 'sat-99', 'warp-8', 'fusi-3', 'orbit-0', 'nova-7', 'ion-45', 'beta-6', 'star-80'],
      desc: 'Latih kelingking hingga telunjuk menjangkau baris angka paling atas dan tanda hubung (-).'
    },
    {
      id: 'acad_12',
      code: 'MODUL 12',
      title: 'Wisuda Akademi (Kelulusan Master)',
      subtitle: 'Ujian Kecepatan & Akurasi 10 Jari',
      targetKills: 28,
      speed: 0.70,
      keys: ['all'],
      words: ['astronomi', 'stratosfer', 'teleskop', 'antimateri', 'kecepatan', 'gravitasi', 'supernova', 'frekuensi', 'koordinat', 'akselerasi', 'magnetosfer', 'eksoplanet', 'observasi', 'trajektori'],
      desc: 'Tantangan puncak kelulusan! Pertahankan akurasi di atas 90% untuk meraih gelar Kadet Bintang.'
    }
  ];

  // ==========================================
  // 3. CAMPAIGN SECTORS (8 ARCADIC STAGES)
  // ==========================================
  AstroType.CAMPAIGN_SECTORS = [
    {
      id: 'sec_1',
      name: 'Sektor 1: Stasiun Orbit Alfa',
      subtitle: 'Kata Pendek Dasar (3–5 Huruf)',
      targetKills: 14,
      spawnIntervalMs: 2400,
      baseSpeed: 0.44,
      bossWord: 'stasiun-alfa',
      bossPhases: ['perisai-ion', 'reaktor-alfa'],
      words: ['bumi', 'mars', 'bulan', 'orbit', 'roket', 'laser', 'komet', 'nova', 'atom', 'surya', 'awan', 'ion', 'foton', 'radar', 'alfa', 'sinar', 'langit', 'ruang']
    },
    {
      id: 'sec_2',
      name: 'Sektor 2: Sabuk Asteroid Ceres',
      subtitle: 'Asteroid Cepat & Refleks (5–7 Huruf)',
      targetKills: 16,
      spawnIntervalMs: 2150,
      baseSpeed: 0.52,
      bossWord: 'asteroid-ceres',
      bossPhases: ['batuan-inti', 'hujan-meteor'],
      words: ['meteor', 'planet', 'satelit', 'kapsul', 'wahana', 'kosmos', 'gerhana', 'nebula', 'kompas', 'perisai', 'turbin', 'reaktor', 'kristal', 'graviton', 'kawah', 'sabuk']
    },
    {
      id: 'sec_3',
      name: 'Sektor 3: Nebula Orion',
      subtitle: 'Kemunculan Splitter Drones (5–7 Huruf)',
      targetKills: 18,
      spawnIntervalMs: 2000,
      baseSpeed: 0.58,
      bossWord: 'armada-splitter',
      bossPhases: ['sarang-drone', 'inti-orion'],
      words: ['galaksi', 'angkasa', 'bintang', 'aurora', 'pulsar', 'kluster', 'korona', 'lintas', 'modul', 'sensor', 'plasma', 'kokpit', 'kuasar', 'spektrum', 'cahaya', 'energi']
    },
    {
      id: 'sec_4',
      name: 'Sektor 4: Cincin Saturnus',
      subtitle: 'Cruiser Berperisai Baja (6–9 Huruf)',
      targetKills: 20,
      spawnIntervalMs: 1880,
      baseSpeed: 0.65,
      bossWord: 'benteng-cincin',
      bossPhases: ['baja-saturnus', 'meriam-orbital'],
      words: ['astronomi', 'teleskop', 'kosmonaut', 'supernova', 'kecepatan', 'navigasi', 'atmosfer', 'radiasi', 'frekuensi', 'gravitasi', 'meteorit', 'gelombang', 'saturnus', 'es-kosmik']
    },
    {
      id: 'sec_5',
      name: 'Sektor 5: Supernova Cygnus',
      subtitle: 'Gelombang Kecepatan Tinggi (7–10 Huruf)',
      targetKills: 22,
      spawnIntervalMs: 1740,
      baseSpeed: 0.72,
      bossWord: 'inti-supernova',
      bossPhases: ['ledakan-fusi', 'badai-cygnus'],
      words: ['stratosfer', 'eksoplanet', 'antimateri', 'konstelasi', 'koordinat', 'akselerasi', 'trajektori', 'propulsi', 'telemetri', 'observasi', 'ionosfer', 'heliosfer', 'luminositas']
    },
    {
      id: 'sec_6',
      name: 'Sektor 6: Kuantum Sagitarius',
      subtitle: 'Istilah Teknis & Kode Angka',
      targetKills: 24,
      spawnIntervalMs: 1620,
      baseSpeed: 0.78,
      needsNumRow: true,
      bossWord: 'kuantum-x99',
      bossPhases: ['kode-alfa-07', 'matriks-sagitarius'],
      words: ['spektroskopi', 'magnetosfer', 'termosfer', 'intergalaksi', 'astrofisika', 'sektor-09', 'apollo-11', 'voyager-2', 'singularitas', 'dekompresi', 'kepler-452', 'warp-9']
    },
    {
      id: 'sec_7',
      name: 'Sektor 7: Anomali Lubang Hitam',
      subtitle: 'Tarikan Gravitasi & Frasa Taktis',
      targetKills: 26,
      spawnIntervalMs: 1500,
      baseSpeed: 0.85,
      bossWord: 'horizon-peristiwa',
      bossPhases: ['distorsi-ruang', 'inti-singularitas'],
      words: ['lubang-hitam', 'materi-gelap', 'energi-kosmik', 'distorsi-waktu', 'paralaks-bintang', 'anomali-kuantum', 'protokol-omega', 'fusi-nuklir', 'medan-gravitasi', 'radiasi-hawking']
    },
    {
      id: 'sec_8',
      name: 'Sektor 8: Benteng Leviathan',
      subtitle: 'Ujian Terakhir Induk Mothership',
      targetKills: 30,
      spawnIntervalMs: 1380,
      baseSpeed: 0.92,
      bossWord: 'leviathan-omega-prime',
      bossPhases: ['perisai-positron', 'jantung-leviathan'],
      words: ['kecepatan-cahaya', 'gelombang-gravitasi', 'relativitas-umum', 'pertahanan-orbital', 'hyperdrive-aktif', 'meriam-positron', 'sabuk-kuiper', 'awan-oort', 'armada-galaksi', 'kemenangan-akhir']
    }
  ];

  // ==========================================
  // 4. EXPANDED PRESET WORD BANKS (INDO, ENG, CODER)
  // ==========================================
  AstroType.WORD_BANKS = {
    indo: [
      'bumi', 'langit', 'cahaya', 'udara', 'waktu', 'gerak', 'energi', 'ruang',
      'bintang', 'galaksi', 'planet', 'satelit', 'komet', 'meteor', 'atom', 'foton',
      'refleks', 'akurasi', 'kecepatan', 'latihan', 'teknologi', 'komputer', 'program',
      'algoritma', 'logika', 'variabel', 'perisai', 'stasiun', 'kosmos', 'navigasi',
      'sinar', 'orbit', 'roket', 'laser', 'nebula', 'aurora', 'korona', 'pulsar',
      'gravitasi', 'atmosfer', 'radiasi', 'frekuensi', 'teleskop', 'astronomi',
      'reaktor', 'turbin', 'kristal', 'sinyal', 'sensor', 'kompas', 'wahana', 'kapsul',
      'semesta', 'angkasa', 'gerhana', 'lintasan', 'horizon', 'dimensi', 'spektrum',
      'partikel', 'elektron', 'proton', 'neutron', 'molekul', 'reaksi', 'kinetik',
      'dinamis', 'stabil', 'presisi', 'fokus', 'strategi', 'armada', 'komandan',
      'skuadron', 'patroli', 'pertahanan', 'pelindung', 'kekuatan', 'kilatan', 'ledakan'
    ],
    eng: [
      'space', 'galaxy', 'planet', 'rocket', 'comet', 'orbit', 'laser', 'shield',
      'speed', 'system', 'matrix', 'vector', 'plasma', 'quasar', 'nebula', 'station',
      'future', 'cosmos', 'gravity', 'quantum', 'energy', 'stellar', 'flight', 'engine',
      'photon', 'beacon', 'vortex', 'nebula', 'pulsar', 'eclipse', 'horizon', 'meteor',
      'asteroid', 'voyager', 'starlight', 'thruster', 'cockpit', 'reactor', 'impulse',
      'velocity', 'momentum', 'spectrum', 'magnetic', 'neutron', 'eclipse', 'zenith',
      'protocol', 'defense', 'command', 'squadron', 'vanguard', 'phantom', 'phoenix',
      'fortress', 'sentinel', 'guardian', 'cyber', 'matrix', 'signal', 'scanner',
      'telemetry', 'altitude', 'propulsion', 'hyperdrive', 'supernova', 'starship',
      'trajectory', 'constellation', 'satellite', 'atmosphere', 'radiation', 'precision'
    ],
    coder: [
      'function', 'return', 'const', 'variable', 'import', 'export', 'async', 'await',
      'promise', 'boolean', 'string', 'number', 'array', 'object', 'canvas', 'render',
      'window', 'document', 'module', 'syntax', 'debug', 'script', 'event', 'kernel',
      'buffer', 'stream', 'socket', 'packet', 'router', 'server', 'client', 'deploy',
      'commit', 'branch', 'merge', 'clone', 'fetch', 'parse', 'stringify', 'filter',
      'reduce', 'splice', 'concat', 'static', 'public', 'private', 'class', 'extends',
      'interface', 'generic', 'compile', 'runtime', 'memory', 'thread', 'worker',
      'shader', 'vertex', 'texture', 'matrix', 'vector', 'frame', 'delta', 'update',
      'request', 'response', 'header', 'cookie', 'token', 'crypto', 'cipher', 'hash',
      'schema', 'query', 'index', 'cursor', 'cache', 'proxy', 'docker', 'cluster'
    ]
  };

  // ==========================================
  // 5. CADET RANKS & XP PROGRESSION (12 LEVELS)
  // ==========================================
  AstroType.RANKS = [
    { minXp: 0, title: 'Kadet Magang', badge: 'LV 1 • KADET', avatar: '👨‍🚀' },
    { minXp: 200, title: 'Taruna Orbit', badge: 'LV 2 • TARUNA', avatar: '🛰️' },
    { minXp: 500, title: 'Letnan Penjelajah', badge: 'LV 3 • LETNAN', avatar: '🚀' },
    { minXp: 950, title: 'Kapten Skuadron', badge: 'LV 4 • KAPTEN', avatar: '⭐' },
    { minXp: 1550, title: 'Mayor Pertahanan', badge: 'LV 5 • MAYOR', avatar: '🛡️' },
    { minXp: 2300, title: 'Kolonel Bintang', badge: 'LV 6 • KOLONEL', avatar: '☄️' },
    { minXp: 3300, title: 'Komandan Armada', badge: 'LV 7 • KOMANDAN', avatar: '⚡' },
    { minXp: 4600, title: 'Laksamana Muda', badge: 'LV 8 • LAKSAMANA', avatar: '🎖️' },
    { minXp: 6200, title: 'Laksamana Bintang', badge: 'LV 9 • BINTANG', avatar: '👑' },
    { minXp: 8200, title: 'Panglima Galaksi', badge: 'LV 10 • PANGLIMA', avatar: '🌠' },
    { minXp: 11000, title: 'Grandmaster Kosmik', badge: 'LV 11 • MASTER', avatar: '💎' },
    { minXp: 15000, title: 'Legenda AstroType', badge: 'LV 12 • LEGENDA', avatar: '🌌' }
  ];

  AstroType.getRankForXp = function (xp) {
    const ranks = AstroType.RANKS;
    for (let i = ranks.length - 1; i >= 0; i--) {
      if (xp >= ranks[i].minXp) {
        return {
          minXp: ranks[i].minXp,
          title: ranks[i].title,
          badge: ranks[i].badge,
          avatar: ranks[i].avatar,
          index: i,
          level: i + 1
        };
      }
    }
    return {
      minXp: ranks[0].minXp,
      title: ranks[0].title,
      badge: ranks[0].badge,
      avatar: ranks[0].avatar,
      index: 0,
      level: 1
    };
  };

  // ==========================================
  // 6. SHIPS HANGAR & LASER CUSTOMIZATION MATRIX
  // ==========================================
  AstroType.SHIPS = [
    {
      id: 'vanguard',
      name: 'Vanguard Falcon',
      unlockLevel: 1,
      style: 'twin',
      laserColor: '#06b6d4',
      hullColor: '#38bdf8',
      accentColor: '#0284c7',
      glowKey: 'cyan',
      weaponLabel: 'Twin Ion Cannon',
      desc: 'Kapal pencegat delta standar galaksi dengan meriam ion ganda presisi tinggi.'
    },
    {
      id: 'phoenix',
      name: 'Solar Phoenix',
      unlockLevel: 3,
      style: 'lance',
      laserColor: '#f97316',
      hullColor: '#fb923c',
      accentColor: '#ea580c',
      glowKey: 'orange',
      weaponLabel: 'Solar Plasma Lance',
      desc: 'Ditempa di korona bintang dengan sayap menyapu ke depan dan tombak plasma surya jingga.'
    },
    {
      id: 'phantom',
      name: 'Void Phantom',
      unlockLevel: 5,
      style: 'quantum',
      laserColor: '#a855f7',
      hullColor: '#c084fc',
      accentColor: '#7e22ce',
      glowKey: 'purple',
      weaponLabel: 'Quantum Dual-Arc',
      desc: 'Kapal siluman bilah ganda dimensi hampa udara dengan berkas energi kuantum ungu.'
    },
    {
      id: 'dreadnought',
      name: 'Titan Dreadnought',
      unlockLevel: 7,
      style: 'heavy',
      laserColor: '#10b981',
      hullColor: '#34d399',
      accentColor: '#047857',
      glowKey: 'emerald',
      weaponLabel: 'Emerald Particle Beam',
      desc: 'Benteng tempur tiga-lambung kelas berat dengan meriam partikel emerald berkekuatan penuh.'
    }
  ];
})(window);

