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

// Case pages keep the same editorial reveals. The room owns its own motion.
const mm = gsap.matchMedia();
mm.add('(prefers-reduced-motion: no-preference)', () => {
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(element => {
    gsap.from(element, { y: 26, opacity: 0, duration: .7, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 95%', once: true } });
  });
});

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
