// Shared, progressively enhanced route transition for the birthday experience.
(() => {
  const transitionDuration = 620;
  let isNavigating = false;
  const markReady = () => requestAnimationFrame(() => document.body.classList.add('page-ready'));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', markReady, { once:true }); else markReady();

  window.navigateWithTransition = (url, { replace = false } = {}) => {
    if (!url || isNavigating) return;
    isNavigating = true;
    document.body.classList.add('page-leaving');
    window.setTimeout(() => { if (replace) window.location.replace(url); else window.location.assign(url); }, transitionDuration);
  };

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || link.target || link.hasAttribute('download') || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const destination = new URL(link.href, window.location.href);
    if (destination.origin !== window.location.origin || destination.hash || isNavigating) return;
    event.preventDefault();
    window.navigateWithTransition(destination.href);
  });
})();
