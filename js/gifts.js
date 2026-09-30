const scenes = [...document.querySelectorAll('.gift-scene')];
const modal = document.getElementById('giftModal');
const modalVisual = document.getElementById('modalVisual');
const modalNumber = document.getElementById('modalNumber');
const modalTitle = document.getElementById('modalTitle');
const modalStory = document.getElementById('modalStory');
const modalMeaning = document.getElementById('modalMeaning');
const nextGift = document.getElementById('nextGift');
const closeModal = document.getElementById('closeModal');
const progressLabel = document.getElementById('progressLabel');
const progressBar = document.getElementById('progressBar');
const seedButton = document.getElementById('seedButton');
const seedPrompt = document.getElementById('seedPrompt');
let currentGift = 0;
let activeModalGift = 0;

const gifts = [
  { title: 'Sunflower Seeds', visual: 'sunflower', story: 'The real sunflower seed gift is ready for you.', meaning: 'Every beautiful flower begins from a tiny seed. May every dream you plant grow beautifully and always turn towards happiness just like a sunflower turns towards the light.' },
  { title: 'Stitch', visual: 'stitch', story: 'A small blue companion with a very big heart.', meaning: 'Always smile. Always laugh. Always take care of yourself.' },
  { title: 'Memory Canvas', visual: 'canvas', story: 'A place for a memory that deserves to stay close.', meaning: 'Some memories deserve more than a gallery. They deserve a permanent place where they can always make us smile.' },
  { title: 'A secret, just for you', visual: 'secret', story: "This surprise isn't meant to be opened here.", meaning: "I'm going to give it to you personally." }
];

function updateProgress() { progressLabel.textContent = `0${currentGift + 1} / 04`; progressBar.style.width = `${(currentGift + 1) * 25}%`; }
function showGift(index) { currentGift = index; scenes.forEach((scene, sceneIndex) => scene.classList.toggle('is-active', sceneIndex === index)); updateProgress(); }
function openGift(index) { activeModalGift = index; const gift = gifts[index]; modalVisual.className = `modal-visual ${gift.visual}`; modalNumber.textContent = `Gift 0${index + 1}`; modalTitle.textContent = gift.title; modalStory.textContent = gift.story; modalMeaning.textContent = gift.meaning; nextGift.textContent = index === gifts.length - 1 ? 'Continue the story →' : 'Open the next wonder →'; modal.showModal(); closeModal.focus(); }
function closeGift() { modal.close(); }
seedButton.addEventListener('click', () => { const scene = scenes[0]; seedPrompt.textContent = 'A little rain, a little patience, and a lot of light...'; scene.classList.add('is-grown'); setTimeout(() => { seedPrompt.textContent = 'Your sunflower is in bloom'; document.querySelector('[data-open="0"]').hidden = false; }, 6200); });
document.querySelectorAll('[data-open]').forEach((button) => button.addEventListener('click', () => openGift(Number(button.dataset.open))));
closeModal.addEventListener('click', closeGift);
nextGift.addEventListener('click', () => { closeGift(); if (activeModalGift < gifts.length - 1) showGift(activeModalGift + 1); else { document.body.classList.add('is-leaving'); setTimeout(() => { window.navigateWithTransition?.('family.html') || (window.location.href = 'family.html'); }, 850); } });
modal.addEventListener('click', (event) => { if (event.target === modal) closeGift(); });
updateProgress();
