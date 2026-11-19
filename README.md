# AstroType: Pertahanan Galaksi & Akademi Mengetik 10 Jari 🚀
> **Created & Developed by YRZQ_WLDN**  
> *Versi 3.0 • Zero-Framedrop Space Touch-Typing Combat Simulator & Progressive Web App*

---

AstroType adalah game pertahanan luar angkasa sekaligus platform edukasi mengetik 10 jari (*Touch Typing Odyssey*) modern berkecepatan tinggi yang dibangun murni menggunakan HTML5 Canvas, CSS statis terkompilasi, dan Web Audio API — tanpa dependensi runtime berat dan berjalan mulus di **60–144+ FPS** di desktop maupun ponsel.

## ⚡ Pembaruan Engine v3.0 (Zero-Framedrop & Playability Overhaul)

### 1. 🏎️ Arsitektur Render Anti-Framedrop
- **Static Pre-Compiled CSS (Zero Tailwind CDN Runtime)**: Menghapus *Tailwind Play CDN* runtime compiler (`MutationObserver`) sehingga tidak ada lagi scan DOM & style recalculation setiap ketukan tombol — sekaligus membuat aplikasi 100% bisa dimainkan *offline* via PWA.
- **Zero-Reflow Virtual Keyboard**: Menghapus *forced synchronous layout* (`offsetWidth`), spawner elemen flare DOM, dan 40+ layer GPU `will-change` yang sebelumnya memicu stutter saat mengetik cepat.
- **Zero `backdrop-filter` di Atas Kanvas**: Menghapus efek *blur* framebuffer di atas kanvas animasi 60/120 FPS agar GPU fill-rate tidak tercekik.
- **Pre-Rendered Sprite Atlas & O(1) Text Metrics**: Mengganti `ctx.measureText()` (sebelumnya ~20x/frame) dan rasterisasi emoji dengan perhitungan lebar monospace O(1) serta sprite glow & ikon power-up pra-render.
- **Object Pooling (Zero GC Pause)**: Partikel, laser, shockwave, dan teks melayang menggunakan *fixed-size object pool* tanpa alokasi array berulang di tengah pertempuran.
- **100% Delta-Time Physics**: Seluruh kecepatan musuh, bintang paralaks, rotasi kapal, laser, dan efek berjalan konsisten pada layar 60Hz, 90Hz, 120Hz, hingga 144Hz.
- **1:1 DPR Background Blit + Adaptive Quality (`AUTO / TURBO / ULTRA`)**: Dilengkapi monitor FPS & frame-time real-time (`FPS • ms`) serta penyesuaian kualitas otomatis jika frame time melebihi anggaran.
- **Debounced LocalStorage & Non-Blocking Voice**: Penyimpanan data di-batch agar bebas *disk I/O stall* saat mengetik, dan penyiar suara di-cache di luar frame kritis.

### 2. 🎮 Peningkatan Gameplay & Kelayakan Bermain
- **Pause & Resume Sejati**: Overlay jeda khusus (`Esc` / tombol Pause) yang membekukan timer WPM, Blitz 60 detik, dan durasi power-up (juga otomatis jeda saat pindah tab).
- **4 Desain Kapal Hangar Unik & Terbuka di Level Wajar**: Progresi 12 pangkat kadet dengan kapal tempur yang dapat dibuka di **LV 1** (*Vanguard Falcon*), **LV 3** (*Solar Phoenix*), **LV 5** (*Void Phantom*), dan **LV 7** (*Titan Dreadnought*), masing-masing dengan siluet dan gaya tembakan meriam plasma berbeda.
- **Kampanye 8 Sektor + Bos Multi-Fase & Penyimpanan Bintang**: Progres bintang Kampanye & Akademi tersimpan permanen tanpa menimpa rekor bintang tertinggi.
- **Power-Up yang Konsisten**: *Cryo Freeze* (6,5 detik) & *2X Skor* (10 detik penuh, tidak lagi tertimpa ketukan berikutnya) dengan tarikan magnetik dan indikator hitung mundur.
- **Diagnostik Akurat**: Perhitungan WPM dimulai sejak ketukan pertama tanpa spike palsu, dan *Weak Keys* melacak **huruf target yang meleset** lengkap dengan tombol drill cepat di layar hasil.
- **Smart Spawning & Anti-Tumpuk**: Pembagian jalur horizontal & pencegahan tumpang-tindih label kata agar semua target selalu terbaca jernih.
- **Virtual Keyboard Mobile Lengkap**: Kini mendukung tanda hubung (`-`), titik koma (`;`), serta tombol Spasi yang konsisten memicu EMP Nova.

---

## ✨ Fitur-Fitur Utama
- **🎓 Simulator Akademi 10 Jari**: 12 modul kurikulum terstruktur (`F-J`, `D-K`, `S-L`, `A-;`, `G-H`, `QWERTY`, `ZXCVB`, angka `1-0`, hingga ujian wisuda).
- **🚀 Pertahanan Galaksi (8 Sektor)**: Lawan *Scout*, *Asteroid*, *Splitter Drone*, *Cruiser Berperisai*, dan *Bos Kapal Induk*.
- **♾️ Mode Serbuan (Endless)** & **⏱️ Uji Kecepatan 60 Detik (Speed Blitz)**.
- **🛠️ Mode Kustom & 230+ Kosakata**: Bank kata Bahasa Indonesia, English, dan istilah Pemrograman (*Coder*), atau kata kustom sendiri.
- **🎵 Synthwave BGM Prosedural & 3 Profil Audio**: Lookahead Web Audio synthesizer bebas drift + *DynamicsCompressor* anti-clipping (*Laser*, *Clack ASMR*, *8-Bit Retro*).
- **📜 Sertifikat Kelulusan Digital PNG** & **📤 Berbagi WhatsApp / Web Share**.
- **📱 Mobile Ready & Offline PWA**: Keyboard layar ergonomis + integrasi keyboard bawaan HP (*Gboard / Samsung / iOS*).

---

## 🚀 Cara Menjalankan & Hosting di Vercel

Jalankan secara lokal:
```bash
npm start
```
(atau buka langsung `index.html` di browser — 100% statis tanpa proses build wajib!).

Untuk mengkompilasi ulang CSS setelah mengubah class Tailwind di HTML/JS:
```bash
npm run build:css
```

### Deploy ke Vercel
1. Upload folder ini ke repository GitHub Anda.
2. Buka [Vercel](https://vercel.com/) → **Add New Project** → pilih repository ini.
3. Pilih **Framework Preset: Other** → klik **Deploy**.

---

## 👨‍💻 Hak Cipta & Pengembang
Dibuat dan dikembangkan dengan bangga oleh **YRZQ_WLDN**.  
*Lisensi: MIT License*
