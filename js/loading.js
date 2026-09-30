const bar = document.getElementById('bar');
const percent = document.getElementById('percent');
const loadingNote = document.getElementById('loadingNote');
const welcome = document.getElementById('welcome');
const progressWrap = document.querySelector('.progress-wrap');

if (sessionStorage.getItem('birthdayReady') !== 'true' && localStorage.getItem('birthdaySecret') !== 'true') {
  window.location.replace('index.html');
}

const messages = [
  'Preparing your special moment...',
  'Gathering sweet memories...',
  'Lighting birthday candles...',
  'Unfolding the magic...',
  'Almost ready for you... 🌸'
];

let isLeaving = false;

function pause(duration) { 
  return new Promise((resolve) => setTimeout(resolve, duration)); 
}

async function typeText(element, text, speed = 22) { 
  element.textContent = ''; 
  for (const character of text) { 
    element.textContent += character; 
    await pause(speed); 
  } 
}

async function showLoadingMessages() {
  for (let index = 0; index < messages.length; index += 1) {
    await typeText(loadingNote, messages[index], 22);
    if (index < messages.length - 1) { 
      await pause(450); 
      loadingNote.style.opacity = '0'; 
      await pause(150); 
      loadingNote.style.opacity = '1'; 
    }
  }
}

function runProgress() {
  const duration = 4200; 
  const startedAt = performance.now();
  return new Promise((resolve) => {
    function update(now) { 
      const value = Math.min(100, Math.round(((now - startedAt) / duration) * 100)); 
      if (bar) bar.style.width = `${value}%`; 
      if (percent) percent.textContent = `${value}%`; 
      if (progressWrap) progressWrap.setAttribute('aria-valuenow', String(value)); 
      if (value < 100) {
        requestAnimationFrame(update); 
      } else {
        resolve(); 
      }
    }
    requestAnimationFrame(update);
  });
}

async function prepareExperience() {
  await Promise.all([runProgress(), showLoadingMessages()]);
  sessionStorage.setItem('birthdayReady', 'true');
  
  if (isLeaving) return;
  isLeaving = true;
  await pause(350);
  
  window.navigateWithTransition?.('birthday.html') || (window.location.href = 'birthday.html');
}

prepareExperience();
