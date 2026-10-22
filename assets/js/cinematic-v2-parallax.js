
(() => {
  'use strict';

  const hero = document.querySelector('#home');
  const visual = hero?.querySelector('.orb-visual');
  const orb = hero?.querySelector('.orb-art');

  if (!hero || !visual || !orb) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(pointer: fine)');

  let frame = 0;
  let x = 0;
  let y = 0;

  function render() {
    frame = 0;
    orb.style.setProperty('--nv-parallax-x', `${x.toFixed(1)}px`);
    orb.style.setProperty('--nv-parallax-y', `${y.toFixed(1)}px`);
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(render);
  }

  function reset() {
    x = 0;
    y = 0;
    schedule();
  }

  hero.addEventListener('pointermove', (event) => {
    if (reduced.matches || !finePointer.matches ||
        visual.dataset.motion === 'paused') {
      reset();
      return;
    }

    const rect = hero.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;

    x = Math.max(-14, Math.min(14, nx * 28));
    y = Math.max(-10, Math.min(10, ny * 20));

    schedule();
  }, { passive: true });

  hero.addEventListener('pointerleave', reset);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) reset();
  });
  reduced.addEventListener('change', reset);

  new MutationObserver(() => {
    if (visual.dataset.motion === 'paused') reset();
  }).observe(visual, {
    attributes: true,
    attributeFilter: ['data-motion']
  });
})();
