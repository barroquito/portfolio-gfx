import { gsap } from 'gsap';

document.querySelectorAll<HTMLElement>('[data-project-player]').forEach(player => {
  const pieces = [...player.querySelectorAll<HTMLElement>('[data-piece]')];
  const thumbs = [...player.querySelectorAll<HTMLButtonElement>('[data-select]')];
  const chapters = [...player.querySelectorAll<HTMLButtonElement>('[data-chapter]')];
  const previous = player.querySelector<HTMLButtonElement>('[data-previous]')!;
  const next = player.querySelector<HTMLButtonElement>('[data-next]')!;
  const status = player.querySelector<HTMLElement>('[data-player-status]')!;
  const stage = player.querySelector<HTMLElement>('.player-stage')!;
  const strip = player.querySelector<HTMLElement>('.player-strip')!;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let selected = Number(player.dataset.initial) || 0;
  let active = pieces.map((_, index) => index);

  function select(index: number, updateURL = true) {
    if (!active.includes(index)) return;
    const direction = index >= selected ? 1 : -1;
    pieces[selected]?.querySelector('video')?.pause();
    selected = index;
    pieces.forEach((piece, i) => { piece.hidden = i !== index; });
    thumbs.forEach((thumb, i) => thumb.setAttribute('aria-pressed', String(i === index)));
    const position = active.indexOf(index);
    status.textContent = `${position + 1} / ${active.length}`;
    player.querySelector('[data-player-announcement]')!.textContent = `${pieces[index].querySelector('h3')!.textContent}. Pieza ${position + 1} de ${active.length}.`;
    previous.setAttribute('aria-disabled', String(position === 0));
    next.setAttribute('aria-disabled', String(position === active.length - 1));
    const thumb = thumbs[index];
    const offset = thumb.getBoundingClientRect().left - strip.getBoundingClientRect().left;
    strip.scrollTo({ left: strip.scrollLeft + offset - strip.clientWidth / 2 + thumb.clientWidth / 2, behavior: reduced.matches ? 'instant' : 'smooth' });
    const artwork = pieces[index].querySelector<HTMLElement>('.player-art > *')!;
    gsap.killTweensOf(artwork);
    if (!reduced.matches && updateURL) gsap.fromTo(artwork,
      { opacity: .4, scale: .88, x: direction * 36, y: 24, rotation: direction * 1.2 },
      { opacity: 1, scale: 1, x: 0, y: 0, rotation: 0, duration: .55, ease: 'power3.out', clearProps: 'transform,opacity' });
    else gsap.set(artwork, { clearProps: 'transform,opacity' });
    if (updateURL) history.replaceState(null, '', `#pieza-${index + 1}`);
  }

  function filter(chapter: string) {
    active = pieces.flatMap((piece, index) => chapter === 'all' || piece.dataset.campaign === chapter ? [index] : []);
    thumbs.forEach((thumb, i) => { thumb.hidden = !active.includes(i); });
    chapters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.chapter === chapter)));
  }
  const step = (direction: number) => {
    const index = active[active.indexOf(selected) + direction];
    if (index !== undefined) select(index);
  };
  thumbs.forEach((thumb, index) => thumb.addEventListener('click', () => select(index)));
  chapters.forEach(button => button.addEventListener('click', () => {
    filter(button.dataset.chapter!);
    select(active[0]);
  }));
  previous.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  player.addEventListener('keydown', event => {
    const target = event.target as HTMLElement;
    if (target.closest('video') || (!stage.contains(target) && !strip.contains(target))) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      step(event.key === 'ArrowRight' ? 1 : -1);
      if (strip.contains(target)) thumbs[selected].focus({ preventScroll: true });
      else stage.focus({ preventScroll: true });
    }
  });
  // Touch navigation leaves vertical scrolling and native video controls available.
  let start: { x: number; y: number } | null = null;
  stage.addEventListener('touchstart', event => {
    if ((event.target as HTMLElement).closest('video,a')) return;
    start = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }, { passive: true });
  stage.addEventListener('touchend', event => {
    if (!start) return;
    const dx = event.changedTouches[0].clientX - start.x;
    const dy = event.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
    start = null;
  }, { passive: true });
  stage.addEventListener('touchcancel', () => { start = null; });
  function restoreHash() {
    const match = location.hash.match(/^#pieza-(\d+)$/);
    if (!match) return;
    const index = Number(match[1]) - 1;
    if (index < 0 || index >= pieces.length) return;
    filter('all');
    select(index, false);
  }
  player.classList.add('is-enhanced');
  select(selected, false);
  restoreHash();
  window.addEventListener('hashchange', restoreHash);
  const pause = () => pieces[selected].querySelector('video')?.pause();
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  window.addEventListener('pagehide', pause);
  const observer = new IntersectionObserver(entries => { if (!entries[0].isIntersecting) pause(); }, { threshold: 0 });
  observer.observe(stage);
});
