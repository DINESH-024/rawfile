window.SURPRISE_TYPING = window.SURPRISE_TYPING || {};
window.SURPRISE_TYPING.typeText = function(element, text, { speed = 36, delay = 0, cursor = true } = {}) {
  return new Promise((resolve) => {
    element.textContent = '';
    if (cursor) {
      element.classList.add('typing');
    }
    let index = 0;
    function next() {
      if (index >= text.length) {
        element.classList.remove('typing');
        resolve();
        return;
      }
      element.textContent += text.charAt(index);
      index += 1;
      setTimeout(next, speed);
    }
    setTimeout(next, delay);
  });
};
