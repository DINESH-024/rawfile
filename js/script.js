const form = document.getElementById('feedbackForm');
const emojis = [...document.querySelectorAll('.emoji')];
const feedback = document.getElementById('message');
const result = document.getElementById('result');
const emojiValue = document.getElementById('emojiValue');
const submitBtn = document.getElementById('submitBtn');
const buttonLabel = submitBtn.querySelector('.button-label');
const charCount = document.getElementById('charCount');
const maximumCharacters = 500;
let selectedEmoji = '';

function setResult(message, color = '') { result.textContent = message; result.style.color = color; }
function updateCharCount() { const length = feedback.value.length; charCount.textContent = length; document.getElementById('charCounter').style.color = length >= 470 ? '#c95b6a' : ''; }
function selectEmoji(emoji) {
  const nextEmoji = emoji.dataset.emoji;
  const isDeselecting = selectedEmoji === nextEmoji;
  emojis.forEach((item) => { item.classList.remove('selected'); item.setAttribute('aria-checked', 'false'); });
  selectedEmoji = isDeselecting ? '' : nextEmoji;
  emojiValue.value = selectedEmoji;
  if (!isDeselecting) { emoji.classList.add('selected'); emoji.setAttribute('aria-checked', 'true'); }
  setResult('');
}
function resetForm() { feedback.value = ''; selectedEmoji = ''; emojiValue.value = ''; emojis.forEach((emoji) => { emoji.classList.remove('selected'); emoji.setAttribute('aria-checked', 'false'); }); updateCharCount(); }
function normalizeSecret(text) { return text.replace(/\s+/g, '').toLowerCase(); }
function setLoading(isLoading) { submitBtn.disabled = isLoading; submitBtn.classList.toggle('is-loading', isLoading); buttonLabel.textContent = isLoading ? 'Sending feedback...' : 'Submit Feedback'; }

emojis.forEach((emoji) => emoji.addEventListener('click', () => selectEmoji(emoji)));
feedback.addEventListener('input', updateCharCount);

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const feedbackText = feedback.value.trim();
  if (!selectedEmoji) { setResult('Please select your experience.', '#c95b6a'); return; }
  if (!feedbackText) { setResult('Please enter your feedback.', '#c95b6a'); feedback.focus(); return; }
  setLoading(true); setResult('Sending feedback...', '#626eb4');
  try {
    const response = await fetch('https://formspree.io/f/xrenwdgr', { method:'POST', headers:{ 'Content-Type':'application/json', Accept:'application/json' }, body:JSON.stringify({ emoji:selectedEmoji, message:feedbackText, submittedAt:new Date().toISOString(), origin:'Customer Feedback Portal' }) });
    if (!response.ok) throw new Error('Form submission failed');
    if (selectedEmoji === '😒' && normalizeSecret(feedbackText).includes(atob('YWx1bW9vY2hp'))) {
      const panel = document.querySelector('.feedback-panel');
      if (panel) panel.classList.add('secret-unlocked');
      setResult('✨ Access granted. Preparing secret experience...', '#7d61c3');
      localStorage.setItem('birthdaySecret', 'true');
      setTimeout(() => { window.navigateWithTransition?.('Candle.html') || (window.location.href = 'Candle.html'); }, 1000);
      return;
    }
    setResult('Thank you for your feedback.', '#4c9b7e'); resetForm();
  } catch (error) { console.error(error); setResult('Unable to send feedback. Please try again.', '#c95b6a'); }
  finally { setLoading(false); }
});
updateCharCount();
