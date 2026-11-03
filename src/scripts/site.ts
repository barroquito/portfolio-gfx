import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
const menuToggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
const nav = document.querySelector<HTMLElement>('#main-nav');

function closeMenu(returnFocus = false) {
  const wasOpen = menuToggle?.getAttribute('aria-expanded') === 'true';
  menuToggle?.setAttribute('aria-expanded', 'false');
  menuToggle?.setAttribute('aria-label', 'Abrir menú');
  nav?.classList.remove('open');
  document.body.classList.remove('menu-open');
  if (returnFocus && wasOpen) menuToggle?.focus();
}
menuToggle?.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  nav?.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
});
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeMenu(true);
  if (event.key === 'Tab' && menuToggle?.getAttribute('aria-expanded') === 'true') {
    const focusable = [menuToggle, ...Array.from(nav?.querySelectorAll<HTMLAnchorElement>('a') || [])];
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }
});
window.matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

// Scroll drives the editorial sequence. Cube rotations still belong to the gallery.
const casePage = document.querySelector<HTMLElement>('.case-page');
if (casePage) {
  const motion = gsap.matchMedia();
  motion.add('(prefers-reduced-motion: no-preference)', () => {
    const heading = casePage.querySelectorAll('.back-link, .case-topline, .case-heading h1, .case-intro');
    const entrance = gsap.fromTo(heading, { y: 14, opacity: .45 }, {
      y: 0, opacity: 1, duration: .65, stagger: .065, ease: 'power3.out',
      clearProps: 'transform,opacity',
    });

    const story = casePage.querySelector('.case-story');
    const storyBlocks = story?.querySelectorAll('.case-story-grid > div, .case-reflection > p');
    if (story && storyBlocks?.length) {
      gsap.fromTo(storyBlocks, { y: 24, opacity: .72 }, {
        y: 0, opacity: 1, ease: 'none', stagger: .12,
        scrollTrigger: { trigger: story, start: 'clamp(top 92%)', end: 'clamp(top 40%)', scrub: .4 },
      });
    }

    for (const tile of casePage.querySelectorAll('.bento-tile')) {
      gsap.fromTo(tile, { y: 28, scale: .98, opacity: .78 }, {
        y: 0, scale: 1, opacity: 1, ease: 'none',
        scrollTrigger: { trigger: tile, start: 'clamp(top 96%)', end: 'clamp(top 67%)', scrub: .35 },
      });
    }
    const restore = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      entrance.progress(1);
      ScrollTrigger.refresh();
    };
    window.addEventListener('pageshow', restore);
    return () => window.removeEventListener('pageshow', restore);
  });
  window.addEventListener('pagehide', event => {
    if (!event.persisted) motion.revert();
  });
}

let toastTimer: ReturnType<typeof setTimeout>;
function toast(message: string) {
  const element = document.querySelector<HTMLElement>('.toast'); if (!element) return;
  clearTimeout(toastTimer); element.textContent = message; element.classList.add('show');
  toastTimer = setTimeout(() => element.classList.remove('show'), 3500);
}
document.querySelector('.copy-email')?.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText('jorgepindado.gfx@gmail.com'); toast('Correo copiado. Hablemos.'); }
  catch {
    const previousFocus = document.activeElement as HTMLElement | null;
    const field = document.createElement('textarea');
    field.value = 'jorgepindado.gfx@gmail.com'; field.setAttribute('readonly', '');
    field.style.cssText = 'position:fixed;left:-9999px;top:0;';
    document.body.append(field); field.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch { /* Show the address when copying is unavailable. */ }
    field.remove(); previousFocus?.focus();
    toast(copied ? 'Correo copiado. Hablemos.' : 'Puedes escribir a jorgepindado.gfx@gmail.com');
  }
});

let lastFocus: HTMLElement | null = null;
const lightbox = document.querySelector<HTMLDialogElement>('.lightbox');
document.querySelectorAll<HTMLButtonElement>('.gallery-zoom').forEach(button => button.addEventListener('click', () => {
  if (!lightbox) return;
  const image = lightbox.querySelector('img'); if (!image) return;
  lastFocus = button;
  image.src = button.dataset.src || ''; image.alt = button.dataset.alt || '';
  const caption = lightbox.querySelector('p'); if (caption) caption.textContent = image.alt;
  lightbox.showModal(); document.body.style.overflow = 'hidden';
}));
lightbox?.querySelector('.lightbox-close')?.addEventListener('click', () => lightbox.close());
lightbox?.addEventListener('click', event => { if (event.target === lightbox) { const box=lightbox.getBoundingClientRect(); if (event.clientX<box.left || event.clientX>box.right || event.clientY<box.top || event.clientY>box.bottom) lightbox.close(); } });
lightbox?.addEventListener('close', () => { document.body.style.overflow = ''; lastFocus?.focus(); });

let ticking = false;
function updateScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? window.scrollY / max : 0;
  const bar = document.querySelector<HTMLElement>('.scroll-progress'); if (bar) bar.style.transform = `scaleX(${progress})`;
  const sections = ['proyectos','sobre-mi','contacto'];
  let active = '';
  for (const id of sections) { const section = document.getElementById(id); if (section && section.getBoundingClientRect().top < window.innerHeight * .45) active = id; }
  document.querySelectorAll<HTMLElement>('[data-nav]').forEach(link => { if (link.dataset.nav === active) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current'); });
  ticking = false;
}
window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(updateScroll); ticking = true; } }, { passive: true });
updateScroll();
document.fonts.ready.then(() => ScrollTrigger.refresh());
window.addEventListener('load', () => ScrollTrigger.refresh());
