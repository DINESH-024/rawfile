document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('birthdaySecret') !== 'true') {
    window.location.href = 'index.html';
    return;
  }
  window.location.replace('loading.html');
});
