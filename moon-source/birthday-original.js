const moon = document.querySelector('.moon');
const birthdayCopy = document.querySelector('.birthday-copy');
const birthdayLine = document.getElementById('birthdayLine');
const nameLine = document.getElementById('nameLine');
const dateLine = document.getElementById('dateLine');
const cakeStage = document.querySelector('.cake-stage');
const candle = document.getElementById('candle');
const candleHint = document.getElementById('candleHint');
const magicLayer = document.getElementById('magicLayer');
const quote = document.getElementById('geminiQuote');
const nextMoment = document.getElementById('nextMoment');
const giftsBtn = document.getElementById('giftsBtn');

// Glass Music Controls
const musicToggle = document.getElementById('musicToggle');
const playerPlayBtn = document.getElementById('playerPlayBtn');
const playerMuteBtn = document.getElementById('playerMuteBtn');
const equalizer = document.getElementById('equalizer');

const geminiPrompt = 'Write one warm, elegant, simple birthday quote for Deepika in no more than 40 words. Do not mention AI.';
const quoteFallback = 'May your new year bloom gently, Deepika, with bright days, kind hearts, and beautiful memories waiting to find you.';
let candleLit = false;

// Audio System State (Loud & Audible Output)
let audioCtx = null;
let mainGain = null;
let isPlayingSong = false;
let isMuted = false;
let songTimeoutId = null;

const wait = (time) => new Promise((resolve) => setTimeout(resolve, time));

async function typeText(element, text, speed = 34) {
  if (!element) return;
  element.textContent = '';
  for (const character of text) {
    element.textContent += character;
    await wait(speed);
  }
}

// Generate Luminous Fairy Butterflies
function createFairyButterflies(count = 10) {
  if (!magicLayer) return;
  const colors = [
    { c: '#ff94cf', g: 'rgba(255, 148, 207, 0.8)' }, // Pink
    { c: '#c7a8ff', g: 'rgba(199, 168, 255, 0.8)' }, // Lavender
    { c: '#74c3ff', g: 'rgba(116, 195, 255, 0.8)' }, // Sky/Cyan
    { c: '#ff5eb4', g: 'rgba(255, 94, 180, 0.8)' },  // Magenta
    { c: '#ffd56e', g: 'rgba(255, 213, 110, 0.8)' }, // Soft Gold
    { c: '#ffb38a', g: 'rgba(255, 179, 138, 0.8)' }  // Peach
  ];

  for (let i = 0; i < count; i++) {
    const item = document.createElement('span');
    const colorObj = colors[i % colors.length];
    item.className = 'fairy-butterfly';
    item.textContent = '🦋';
    item.style.color = colorObj.c;
    item.style.setProperty('--glow-color', colorObj.g);
    item.style.left = `${Math.random() * 85}%`;
    item.style.top = `${30 + Math.random() * 50}%`;
    item.style.setProperty('--duration', `${12 + Math.random() * 10}s`);
    item.style.setProperty('--delay', `${Math.random() * 4}s`);
    magicLayer.append(item);
  }
}

function createMagic(className, content, count, durationRange) {
  if (!magicLayer) return;
  for (let index = 0; index < count; index += 1) {
    const item = document.createElement('span');
    item.className = `magic-item ${className}`;
    item.textContent = content;
    item.style.left = `${Math.random() * 100}%`;
    item.style.setProperty('--x', `${(Math.random() - .5) * 45}vw`);
    item.style.setProperty('--duration', `${durationRange[0] + Math.random() * (durationRange[1] - durationRange[0])}s`);
    item.style.setProperty('--delay', `${Math.random() * 1.2}s`);
    magicLayer.append(item);
    item.addEventListener('animationend', () => item.remove());
  }
}

function createFireflies(count = 18) {
  if (!magicLayer) return;
  for (let index = 0; index < count; index += 1) {
    const item = document.createElement('span');
    item.className = 'magic-item firefly';
    item.style.left = `${Math.random() * 100}%`;
    item.style.bottom = `${Math.random() * 45}%`;
    item.style.setProperty('--x', `${(Math.random() - .5) * 35}vw`);
    item.style.setProperty('--duration', `${5 + Math.random() * 4}s`);
    item.style.setProperty('--delay', `${Math.random() * 2}s`);
    magicLayer.append(item);
    item.addEventListener('animationend', () => item.remove());
  }
}

function createFireworks() {
  if (!magicLayer) return;
  for (let group = 0; group < 4; group += 1) {
    setTimeout(() => {
      const originX = 22 + Math.random() * 56;
      const originY = 18 + Math.random() * 42;
      for (let ray = 0; ray < 22; ray += 1) {
        const spark = document.createElement('span');
        const angle = (Math.PI * 2 * ray) / 22;
        const distance = 45 + Math.random() * 60;
        spark.className = 'firework';
        spark.style.left = `${originX}%`;
        spark.style.top = `${originY}%`;
        spark.style.setProperty('--x', `${Math.cos(angle) * distance}px`);
        spark.style.setProperty('--y', `${Math.sin(angle) * distance}px`);
        spark.style.setProperty('--color', ['#ffd56e', '#ff9dce', '#bda3ff', '#8ed6ff'][ray % 4]);
        magicLayer.append(spark);
        spark.addEventListener('animationend', () => spark.remove());
      }
    }, group * 950);
  }
}

// Audio Initialization with High Loudness Output
function initAudio() {
  if (audioCtx) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
    mainGain = audioCtx.createGain();
    mainGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    mainGain.gain.exponentialRampToValueAtTime(0.35, audioCtx.currentTime + 1.2); // Loud & clear output
    mainGain.connect(audioCtx.destination);
  } catch (error) {
    console.warn('Audio Context unavailable:', error);
  }
}

function ensureAudioStarted() {
  initAudio();
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
}

// Ambient Background Chords
function beginAmbientMusic() {
  ensureAudioStarted();
  if (!audioCtx) return;
  try {
    const ambientGain = audioCtx.createGain();
    ambientGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    ambientGain.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 2.5);
    ambientGain.connect(mainGain);

    [261.63, 329.63, 392.00].forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const vGain = audioCtx.createGain();
      vGain.gain.value = 0.22;
      osc.connect(vGain).connect(ambientGain);
      osc.start(audioCtx.currentTime + idx * 0.2);
      osc.stop(audioCtx.currentTime + 30);
    });
  } catch (err) {
    console.warn('Ambient music failed', err);
  }
}

// Synthesized Birthday Song ("Happy Birthday Deepika") — Loud & Rich Harmonics
function playBirthdayNote(freq, startTime, duration) {
  if (!audioCtx || !isPlayingSong) return;
  try {
    const osc = audioCtx.createOscillator();
    const noteGain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = freq;

    // Celesta / Music box harmonics overlay
    const oscHarmonic = audioCtx.createOscillator();
    oscHarmonic.type = 'triangle';
    oscHarmonic.frequency.value = freq * 2;
    const harmGain = audioCtx.createGain();
    harmGain.gain.value = 0.25;
    oscHarmonic.connect(harmGain).connect(noteGain);

    noteGain.gain.setValueAtTime(0.001, startTime);
    noteGain.gain.exponentialRampToValueAtTime(0.28, startTime + 0.05); // High volume
    noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration - 0.04);

    osc.connect(noteGain);
    noteGain.connect(mainGain);

    osc.start(startTime);
    oscHarmonic.start(startTime);
    osc.stop(startTime + duration);
    oscHarmonic.stop(startTime + duration);
  } catch (e) {}
}

function startBirthdaySong() {
  ensureAudioStarted();
  if (!audioCtx) return;
  isPlayingSong = true;

  if (equalizer) equalizer.classList.add('is-playing');
  if (playerPlayBtn) playerPlayBtn.textContent = '⏸';

  // Notes sequence for Happy Birthday in F Major
  const notes = [
    { f: 261.63, d: 0.4 }, { f: 261.63, d: 0.4 }, { f: 293.66, d: 0.8 }, { f: 261.63, d: 0.8 }, { f: 349.23, d: 0.8 }, { f: 329.63, d: 1.2 },
    { f: 261.63, d: 0.4 }, { f: 261.63, d: 0.4 }, { f: 293.66, d: 0.8 }, { f: 261.63, d: 0.8 }, { f: 392.00, d: 0.8 }, { f: 349.23, d: 1.2 },
    { f: 261.63, d: 0.4 }, { f: 261.63, d: 0.4 }, { f: 523.25, d: 0.8 }, { f: 440.00, d: 0.8 }, { f: 349.23, d: 0.8 }, { f: 329.63, d: 0.8 }, { f: 293.66, d: 0.8 },
    { f: 466.16, d: 0.4 }, { f: 466.16, d: 0.4 }, { f: 440.00, d: 0.8 }, { f: 349.23, d: 0.8 }, { f: 392.00, d: 0.8 }, { f: 349.23, d: 1.6 }
  ];

  let currentTime = audioCtx.currentTime + 0.2;
  notes.forEach((note) => {
    playBirthdayNote(note.f, currentTime, note.d);
    currentTime += note.d + 0.05;
  });

  const totalDuration = (currentTime - audioCtx.currentTime) * 1000;
  songTimeoutId = setTimeout(() => {
    if (isPlayingSong) startBirthdaySong(); // Smooth loop
  }, totalDuration + 1800);
}

function pauseBirthdaySong() {
  isPlayingSong = false;
  if (songTimeoutId) clearTimeout(songTimeoutId);
  if (equalizer) equalizer.classList.remove('is-playing');
  if (playerPlayBtn) playerPlayBtn.textContent = '▶';
}

function togglePlayPause() {
  if (isPlayingSong) {
    pauseBirthdaySong();
  } else {
    startBirthdaySong();
  }
}

function toggleMute() {
  ensureAudioStarted();
  isMuted = !isMuted;
  if (musicToggle) {
    musicToggle.classList.toggle('is-muted', isMuted);
    musicToggle.setAttribute('aria-pressed', String(!isMuted));
    musicToggle.textContent = isMuted ? '🔇' : '🎵';
  }
  if (playerMuteBtn) {
    playerMuteBtn.textContent = isMuted ? '🔇' : '🔊';
  }
  if (mainGain && audioCtx) {
    const now = audioCtx.currentTime;
    mainGain.gain.cancelScheduledValues(now);
    mainGain.gain.setValueAtTime(mainGain.gain.value, now);
    mainGain.gain.linearRampToValueAtTime(isMuted ? 0.0001 : 0.35, now + 0.3);
  }
}

if (musicToggle) musicToggle.addEventListener('click', toggleMute);
if (playerMuteBtn) playerMuteBtn.addEventListener('click', toggleMute);
if (playerPlayBtn) playerPlayBtn.addEventListener('click', togglePlayPause);

document.addEventListener('pointerdown', ensureAudioStarted, { once: true });

async function loadQuote() {
  if (!window.GEMINI_API_KEY) return quoteFallback;
  try {
    return await window.SURPRISE_AI.generateGeminiResponse(geminiPrompt, { maxOutputTokens: 75, temperature: .8, timeoutMs: 6500, retries: 0 });
  } catch (error) {
    console.warn('Birthday quote fallback used.', error?.message || error);
    return quoteFallback;
  }
}

async function startCinematicMoment() {
  beginAmbientMusic();
  const quotePromise = loadQuote();
  
  // Preserved Moon Phases Sequence
  moon.classList.add('is-visible');
  await wait(1400);
  moon.classList.add('is-half');
  await wait(1400);
  moon.classList.add('is-three-quarter');
  await wait(1400);
  moon.classList.add('is-full');
  
  // Launch Luminous Fairy Butterflies
  createFairyButterflies(12);
  createFireflies(20);
  await wait(1200);
  
  birthdayCopy.classList.add('is-visible');
  
  const generatedQuote = await quotePromise;
  quote.classList.add('is-visible');
  await typeText(quote, generatedQuote, 22);
  
  // Realistic Birthday Cake Appears
  cakeStage.classList.add('is-visible');
  
  // Start loud & clear birthday song sequence
  startBirthdaySong();
  
  await wait(1000);
  candle.disabled = false;
  candleHint.textContent = 'Tap the candle to light your celebration';
}

candle.addEventListener('click', async () => {
  if (candleLit || candle.disabled) return;
  candleLit = true;
  candle.disabled = true;
  candle.classList.add('is-lit');
  candleHint.classList.add('is-hidden');
  
  createMagic('confetti', '', 60, [3.5, 6]);
  [...magicLayer.querySelectorAll('.confetti')].forEach((item, index) => {
    item.style.background = ['#ff9bc9', '#c3a4ff', '#8bcdf7', '#ffe27d'][index % 4];
  });
  createMagic('heart', '♥', 18, [4, 7]);
  createMagic('petal', '✿', 22, [4, 7]);
  createFireworks();
  
  await wait(7500);
  nextMoment.classList.add('is-visible');
  giftsBtn.focus();
});

giftsBtn.addEventListener('click', async () => {
  // Clean audio teardown before leaving page
  if (mainGain && audioCtx) {
    try {
      mainGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8);
    } catch (e) {}
  }
  document.body.classList.add('is-leaving');
  await wait(900);
  window.navigateWithTransition?.('gifts.html') || (window.location.href = 'gifts.html');
});

startCinematicMoment();
