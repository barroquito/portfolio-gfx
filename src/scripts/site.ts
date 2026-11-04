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

let toastTimer: ReturnType<typeof setTimeout>;
function toast(message: string) {
  const element = document.querySelector<HTMLElement>('.toast'); if (!element) return;
  clearTimeout(toastTimer); element.textContent = message; element.classList.add('show');
  toastTimer = setTimeout(() => element.classList.remove('show'), 3500);
}
const copyEmail = document.querySelector<HTMLButtonElement>('.copy-email');
copyEmail?.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText('jorgepindado.gfx@gmail.com'); toast('Correo copiado. Hablemos.'); }
  catch {
    const previousFocus = document.activeElement as HTMLElement | null;
    const field = document.createElement('textarea');
    field.value = 'jorgepindado.gfx@gmail.com'; field.setAttribute('readonly', '');
    field.style.cssText = 'position:fixed;left:-9999px;top:0;';
    // The document outside a modal is inert, so the field must live inside it.
    (copyEmail.closest('dialog[open]') ?? document.body).append(field);
    field.focus({ preventScroll: true });
    field.select();
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

const progressBar = document.querySelector<HTMLElement>('.scroll-progress');
if (progressBar && !document.body.classList.contains('listening-room')) {
  let frame = 0;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    progressBar.style.transform = `scaleX(${progress})`;
    frame = 0;
  };
  window.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(update); }, { passive: true });
  update();
}
