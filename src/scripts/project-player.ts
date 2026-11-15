document.querySelectorAll<HTMLElement>('[data-project-reel]').forEach(reel => {
  const track = reel.querySelector<HTMLElement>('.reel-track')!;
  const pieces = [...reel.querySelectorAll<HTMLElement>('[data-reel-piece]')];
  const previous = reel.querySelector<HTMLButtonElement>('[data-reel-prev]')!;
  const next = reel.querySelector<HTMLButtonElement>('[data-reel-next]')!;
  const count = reel.querySelector<HTMLElement>('[data-reel-count]')!;
  const status = reel.querySelector<HTMLElement>('[data-reel-status]')!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  let selected = -1;
  let visible = false;
  let frame = 0;
  let announceTimer = 0;

  function pauseAll() { pieces.forEach(piece => piece.querySelector('video')?.pause()); }
  function playCurrent() {
    if (!visible || document.hidden || reduced.matches || connection?.saveData) return;
    const video = pieces[selected]?.querySelector('video');
    if (video) video.play().catch(() => { /* Native controls remain available when autoplay is blocked. */ });
  }
  function update() {
    frame = 0;
    const left = track.getBoundingClientRect().left + parseFloat(getComputedStyle(track).paddingLeft);
    let nearest = 0;
    let distance = Infinity;
    pieces.forEach((piece, index) => {
      const delta = Math.abs(piece.getBoundingClientRect().left - left);
      if (delta < distance) { nearest = index; distance = delta; }
    });
    if (nearest === selected) return;
    pauseAll();
    selected = nearest;
    count.textContent = `${selected + 1} / ${pieces.length}`;
    previous.setAttribute('aria-disabled', String(selected === 0));
    next.setAttribute('aria-disabled', String(selected === pieces.length - 1));
    clearTimeout(announceTimer);
    announceTimer = window.setTimeout(() => {
      status.textContent = `${pieces[selected].querySelector('figcaption')!.textContent}. ${selected + 1} de ${pieces.length}.`;
      playCurrent();
    }, 160);
  }
  function go(index: number) {
    if (index < 0 || index >= pieces.length) return;
    const offset = pieces[index].getBoundingClientRect().left - track.getBoundingClientRect().left - parseFloat(getComputedStyle(track).paddingLeft);
    track.scrollTo({ left: track.scrollLeft + offset, behavior: reduced.matches ? 'instant' : 'smooth' });
  }
  previous.addEventListener('click', () => go(selected - 1));
  next.addEventListener('click', () => go(selected + 1));
  track.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(update); }, { passive: true });
  track.addEventListener('keydown', event => {
    if ((event.target as HTMLElement).closest('video')) return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    go(selected + (event.key === 'ArrowRight' ? 1 : -1));
    track.focus({ preventScroll: true });
  });
  // A mouse wheel traverses the horizontal sequence. At either end, page scrolling resumes.
  track.addEventListener('wheel', event => {
    if (event.ctrlKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY) || (event.target as HTMLElement).closest('video:focus')) return;
    const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? track.clientWidth : 1;
    const delta = event.deltaY * scale;
    const end = track.scrollWidth - track.clientWidth;
    if ((delta > 0 && track.scrollLeft >= end - 1) || (delta < 0 && track.scrollLeft <= 1)) return;
    event.preventDefault();
    track.scrollLeft += delta;
  }, { passive: false });
  function restore() {
    const match = location.hash.match(/^#pieza-(\d+)$/);
    if (match) go(Number(match[1]) - 1);
  }
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) playCurrent(); else pauseAll();
  }, { threshold: .25 }).observe(track);
  document.addEventListener('visibilitychange', () => { if (document.hidden) pauseAll(); });
  window.addEventListener('pagehide', pauseAll);
  reduced.addEventListener('change', () => { if (reduced.matches) pauseAll(); });
  window.addEventListener('hashchange', restore);
  window.addEventListener('resize', () => { if (!frame) frame = requestAnimationFrame(update); });
  update();
  restore();
});
