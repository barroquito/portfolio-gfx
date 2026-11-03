import { gsap } from 'gsap';
import type { RecordScene } from './record-scene';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const root = document.documentElement;
const collection = document.querySelector<HTMLDialogElement>('#collection-dialog')!;
const contact = document.querySelector<HTMLDialogElement>('#contact-dialog')!;
const host = document.getElementById('record-scene')!;
const table = host.closest<HTMLElement>('.listening-table')!;
const initialHomeFrame = { host: host.getBoundingClientRect(), table: table.getBoundingClientRect() };
const status = document.getElementById('room-status')!;
const stage = collection.querySelector<HTMLElement>('.orbit-stage')!;
type PlaybackProject = Parameters<RecordScene['play']>[0] & { description: string };
const projects = JSON.parse(document.getElementById('record-project-data')!.textContent || '[]') as PlaybackProject[];
let scene: RecordScene | null = null;
let mode: 'home' | 'opening' | 'collection' | 'closing' | 'playing' = 'home';
let activeIndex = 0, collectionGeneration = 0;
let originFocus: HTMLElement | null = null;
let pageActive = true, navigating = false;
let playbackGeneration = 0;
let playbackWatchdog: number | undefined, playbackLimit: number | undefined;
let playbackTransition: gsap.core.Timeline | null = null;
let automaticWatchdog: number | undefined;
function focusOrigin() {
  const element = document.activeElement as HTMLElement | null;
  if (element?.closest('#main-nav') && window.matchMedia('(max-width:760px)').matches) return document.querySelector<HTMLElement>('.menu-toggle');
  if (element?.closest('dialog')) return originFocus || document.querySelector<HTMLElement>('.collection-main-button');
  return element;
}
const playbackURL = new URL(location.href);
const requestedSlug = playbackURL.searchParams.get('play');
let automaticProject = projects.find(project => project.slug === requestedSlug) || null;
if (requestedSlug !== null) {
  playbackURL.searchParams.delete('play');
  if (automaticProject) playbackURL.hash = '';
  history.replaceState(history.state, '', playbackURL.pathname + playbackURL.search + playbackURL.hash);
}
function cancelAutomaticPlayback() { automaticProject = null; clearTimeout(automaticWatchdog); }
function cancelPlayback() {
  playbackGeneration++;
  clearTimeout(playbackWatchdog); clearTimeout(playbackLimit);
  playbackWatchdog = undefined; playbackLimit = undefined;
  playbackTransition?.kill(); playbackTransition = null;
}
const fineHover = window.matchMedia('(hover: hover) and (pointer: fine)');
let hoverFrame = 0, hoverX = 0, hoverY = 0;
function clearObjectHover() {
  if (hoverFrame) cancelAnimationFrame(hoverFrame);
  hoverFrame = 0; scene?.clearHover(); table.classList.remove('hover-deck', 'hover-stack');
}
table.addEventListener('pointermove', event => {
  if (mode !== 'home' || !fineHover.matches || reduced.matches || event.pointerType === 'touch' || contact.open) { clearObjectHover(); return; }
  if (scene && table.classList.contains('scene-ready')) {
    hoverX = event.clientX; hoverY = event.clientY;
    if (!hoverFrame) hoverFrame = requestAnimationFrame(() => { hoverFrame = 0; scene?.hoverAt(hoverX, hoverY); });
  }
});
table.addEventListener('pointerleave', clearObjectHover);
const stackHotspot = table.querySelector<HTMLElement>('.collection-hotspot')!;
stackHotspot.addEventListener('focus', () => { if (mode === 'home' && !reduced.matches) scene?.hoverCollection(); });
stackHotspot.addEventListener('blur', clearObjectHover);
reduced.addEventListener('change', clearObjectHover);

function syncRenderMode() {
  collection.dataset.render = scene && host.dataset.renderState === 'ready' ? 'webgl' : 'fallback';
  layoutFallback();
}
new MutationObserver(syncRenderMode).observe(host, { attributes: true, attributeFilter: ['data-render-state'] });
const fallbackCards = Array.from(stage.querySelectorAll<HTMLAnchorElement>('[data-fallback-record]'));
const fallbackTurns = fallbackCards.map(() => ({ x: 0, y: 0 }));
let fallbackPhase = 0;
const wrapIndex = (index: number) => ((index % projects.length) + projects.length) % projects.length;
const hasScene = () => scene !== null && collection.dataset.render === 'webgl';

function layoutFallback() {
  if (!collection.open || hasScene()) return;
  const count = fallbackCards.length;
  for (const [index, card] of fallbackCards.entries()) {
    const slot = ((index - fallbackPhase + count / 2) % count + count) % count - count / 2;
    const angle = slot * Math.PI * 2 / count;
    const depth = Math.cos(angle);
    const turn = fallbackTurns[index];
    card.style.setProperty('--coil-x', `${Math.sin(angle) * 35}vw`);
    card.style.setProperty('--coil-y', `${-slot * 12}dvh`);
    card.style.setProperty('--coil-z', `${(depth - 1) * 360}px`);
    card.style.setProperty('--coil-yaw', `${angle + turn.y}rad`);
    card.style.setProperty('--coil-pitch', `${turn.x}rad`);
    card.style.zIndex = String(Math.round(10 + depth * 8));
    card.style.visibility = Math.abs(slot) < 1.65 ? 'visible' : 'hidden';
  }
}

function announceSelection(index: number) {
  collection.querySelector('[data-orbit-status]')!.textContent = projects[index].title;
}

function centeredIndex() {
  if (!hasScene()) return wrapIndex(Math.round(fallbackPhase));
  return scene!.centeredIndex();
}

function selectRecord(index: number) {
  if (mode !== 'collection' && mode !== 'opening') return;
  activeIndex = wrapIndex(index);
  fallbackPhase = activeIndex;
  layoutFallback();
  announceSelection(activeIndex);
  scene?.select(activeIndex);
}

async function openCollection(index = activeIndex) {
  if (entryPromise) await entryPromise;
  if (navigating || !pageActive) return;
  if (mode === 'collection' || mode === 'opening') { selectRecord(index); return; }
  const generation = ++collectionGeneration;
  clearObjectHover();
  if (contact.open) contact.close();
  originFocus = focusOrigin();
  activeIndex = index; fallbackPhase = index;
  fallbackTurns.forEach(turn => { turn.x = 0; turn.y = 0; });
  syncRenderMode();
  mode = 'opening';
  collection.dataset.phase = 'opening';
  document.body.classList.add('collection-open');
  if (!collection.open) collection.showModal();
  layoutFallback();
  announceSelection(activeIndex);
  // Expand and update the projection in one task; no intermediate resized frame.
  try { await scene?.openCollection(activeIndex); } catch { collection.dataset.render = 'fallback'; layoutFallback(); }
  if (generation !== collectionGeneration || !pageActive || navigating) return;
  mode = 'collection';
  scene?.select(activeIndex);
  collection.dataset.phase = 'collection';
  stage.focus({ preventScroll: true });
}
async function closeCollection(restoreFocus = true) {
  if (navigating || mode === 'home' || mode === 'closing') return;
  const generation = ++collectionGeneration;
  mode = 'closing';
  collection.dataset.phase = 'closing';
  try { await scene?.closeCollection(); } catch { scene?.reset(); }
  if (generation !== collectionGeneration || !pageActive) return;
  mode = 'home';
  if (collection.open) collection.close();
  document.body.classList.remove('collection-open', 'collection-playing');
  if (restoreFocus) originFocus?.focus({ preventScroll: true });
  if (['#proyectos', '#sobre-mi'].includes(location.hash)) history.replaceState(history.state, '', location.pathname + location.search);
}
document.querySelectorAll<HTMLButtonElement>('[data-open-collection]').forEach(button => button.addEventListener('click', () => { cancelAutomaticPlayback(); void openCollection(); }));
collection.querySelector('[data-close-collection]')!.addEventListener('click', () => { void closeCollection(); });
collection.addEventListener('cancel', event => { event.preventDefault(); void closeCollection(); });
stage.addEventListener('dragstart', event => event.preventDefault());

function openRecord(index: number) {
  const project = projects[index];
  if (project && mode === 'collection') void playProject(project, `/proyectos/${project.slug}/`);
}

collection.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.target !== stage) return;
  const direction = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : ['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 0;
  if (direction) {
    event.preventDefault();
    selectRecord(centeredIndex() + direction);
  } else if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault();
    selectRecord(event.key === 'Home' ? 0 : projects.length - 1);
  } else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    openRecord(centeredIndex());
  }
});

function advance(delta: number) {
  if (hasScene()) scene?.scrollBy(delta);
  else {
    fallbackPhase = (fallbackPhase + delta / 280) % projects.length;
    layoutFallback();
  }
}
stage.addEventListener('wheel', event => {
  if (event.ctrlKey || mode !== 'collection') return;
  event.preventDefault();
  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
  advance(delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stage.clientHeight : 1));
}, { passive: false });

let gesture: { id: number; x: number; y: number; startX: number; startY: number; index: number | null; dragged: boolean } | null = null;
stage.addEventListener('pointerdown', event => {
  if (mode !== 'collection' || !event.isPrimary || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const fallback = (event.target as Element).closest<HTMLElement>('[data-fallback-record]');
  const index = hasScene() ? scene!.pick(event.clientX, event.clientY) : fallback ? Number(fallback.dataset.fallbackRecord) : null;
  gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY, index, dragged: false };
  stage.setPointerCapture(event.pointerId);
});
stage.addEventListener('pointermove', event => {
  if (!gesture || gesture.id !== event.pointerId || mode !== 'collection') return;
  if (!gesture.dragged && Math.hypot(event.clientX - gesture.startX, event.clientY - gesture.startY) < 6) return;
  gesture.dragged = true;
  const dx = event.clientX - gesture.x;
  const dy = event.clientY - gesture.y;
  gesture.x = event.clientX;
  gesture.y = event.clientY;
  if (gesture.index === null) advance(Math.abs(dy) > Math.abs(dx) ? -dy : -dx);
  else if (hasScene()) scene?.rotate(gesture.index, dx, dy);
  else {
    const turn = fallbackTurns[gesture.index];
    turn.y = (turn.y + dx * .012) % (Math.PI * 2);
    turn.x = (turn.x - dy * .012) % (Math.PI * 2);
    layoutFallback();
  }
});
stage.addEventListener('pointerup', event => {
  if (!gesture || gesture.id !== event.pointerId) return;
  const { index, dragged } = gesture;
  gesture = null;
  if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
  if (!dragged && index !== null) openRecord(index);
});
stage.addEventListener('pointercancel', () => { gesture = null; });
stage.addEventListener('lostpointercapture', () => { gesture = null; });

function openContact() {
  if (navigating || contact.open) return;
  const show = () => { originFocus = focusOrigin(); contact.showModal(); };
  if (collection.open) void closeCollection(false).then(show); else show();
}
contact.querySelector('[data-close-dialog]')?.addEventListener('click', () => contact.close());
contact.addEventListener('close', () => { if (!navigating) originFocus?.focus({ preventScroll: true }); });
contact.addEventListener('click', event => {
  if (event.target !== contact) return;
  const box = contact.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) contact.close();
});
function navigateHash(hash: string) {
  if (automaticProject || root.classList.contains('room-loading')) return;
  if (hash === '#proyectos') void openCollection();
  else if (hash === '#sobre-mi') void openCollection(Math.max(0, projects.findIndex(project => project.slug === 'sobre-mi')));
  else if (hash === '#contacto') openContact();
}
document.querySelectorAll<HTMLAnchorElement>('#main-nav a').forEach(link => link.addEventListener('click', event => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault(); cancelAutomaticPlayback(); navigateHash(new URL(link.href).hash);
}));
window.addEventListener('hashchange', () => navigateHash(location.hash));

const loader = document.getElementById('room-loader');
const loaderMessage = document.getElementById('loader-message');
const loaderProgress = document.getElementById('loader-progress');
const skip = document.getElementById('loader-skip') as HTMLButtonElement | null;
let entryPromise: Promise<void> | null = null;
const skipTimer = window.setTimeout(() => { if (skip) skip.hidden = false; }, 5000);
function finishLoading(): Promise<void> {
  if (entryPromise) return entryPromise;
  clearTimeout(skipTimer);
  const wasLoading = root.classList.contains('room-loading');
  loader?.classList.add('is-leaving');
  root.classList.remove('room-loading', 'room-static'); root.classList.add('room-loaded');
  const afterEntry = () => { if (location.hash) navigateHash(location.hash); };
  if (reduced.matches || !wasLoading) { loader?.remove(); entryPromise = Promise.resolve(); afterEntry(); return entryPromise; }
  const elements = document.querySelectorAll('.site-header,.room-heading-copy,.room-identity,.listening-table,.room-bottom');
  entryPromise = new Promise(resolve => {
    gsap.timeline({ onComplete: () => { afterEntry(); resolve(); } })
      .to(loader, { opacity: 0, duration: .35, onComplete: () => loader?.remove() }, 0)
      .fromTo(elements, { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .7, stagger: .065, ease: 'power3.out', clearProps: 'transform,opacity,visibility' }, .08);
  });
  return entryPromise;
}
skip?.addEventListener('click', () => { cancelAutomaticPlayback(); void finishLoading().then(() => openCollection()); });
function playAutomaticProject() {
  const project = automaticProject;
  if (!project) return;
  cancelAutomaticPlayback();
  void playProject(project, new URL(`/proyectos/${project.slug}/`, location.origin).href, true);
}
if (automaticProject) automaticWatchdog = window.setTimeout(() => { void finishLoading().then(playAutomaticProject); }, 18000);
async function initializeScene() {
  try {
    await document.fonts.ready;
    if (!pageActive || navigating) return;
    const { createRecordScene } = await import('./record-scene');
    if (!pageActive || navigating) return;
    if (loaderMessage) loaderMessage.textContent = 'Cargando el tocadiscos';
    const loadedScene = await createRecordScene(host, projects, value => {
      if (value !== null && loaderProgress) loaderProgress.style.transform = `scaleX(${Math.max(.05, value)})`;
    }, initialHomeFrame);
    if (!pageActive || navigating) { loadedScene.dispose(); host.replaceChildren(); table.classList.remove('scene-ready'); host.dataset.renderState = 'fallback'; return; }
    scene = loadedScene; syncRenderMode();
    if (loaderProgress) loaderProgress.style.transform = 'scaleX(1)';
    if (collection.open && (mode === 'opening' || mode === 'collection')) {
      const generation = collectionGeneration;
      await scene.openCollection(activeIndex);
      if (generation === collectionGeneration && collection.open && !navigating) scene.select(activeIndex);
    }
  } catch (error) {
    if (!pageActive || navigating) return;
    host.style.display = 'none'; host.dataset.renderState = 'failed'; syncRenderMode();
    const message = document.createElement('p'); message.className = 'scene-recovery';
    message.append('Vista estática. Puedes seguir recorriendo la colección. ');
    const retry = document.createElement('button'); retry.textContent = 'Reintentar 3D'; retry.addEventListener('click', () => location.reload()); message.append(retry);
    const detail = document.createElement('details'), summary = document.createElement('summary');
    summary.textContent = 'Ver diagnóstico'; detail.append(summary, document.createTextNode(error instanceof Error ? error.message : String(error))); message.append(detail); table.append(message);
    console.warn('3D unavailable; accessible collection remains active.', error);
  }
  await finishLoading(); playAutomaticProject();
}
void initializeScene();

async function playProject(project: PlaybackProject, route: string, replace = false) {
  if (navigating || !pageActive) return;
  navigating = true; mode = 'playing'; collectionGeneration++;
  const generation = ++playbackGeneration;
  const isCurrent = () => pageActive && generation === playbackGeneration;
  cancelAutomaticPlayback(); clearObjectHover();
  const navigate = () => { if (!isCurrent()) return; cancelPlayback(); if (replace) location.replace(route); else location.assign(route); };
  status.textContent = `Poniendo ${project.title}. Abriendo el proyecto.`;
  document.querySelectorAll<HTMLButtonElement>('[data-open-collection]').forEach(button => button.disabled = true);
  if (contact.open) contact.close();
  document.body.classList.add('collection-open', 'collection-playing');
  const transition = document.querySelector<HTMLElement>('.record-transition')!;
  transition.querySelector('strong')!.textContent = project.title;
  transition.querySelector('.record-transition-subtitle')!.textContent = project.subtitle;
  playbackWatchdog = window.setTimeout(navigate, 8000);
  try {
    if (scene) await Promise.race([
      scene.play(project),
      new Promise<void>(resolve => { playbackLimit = window.setTimeout(resolve, 4200); })
    ]);
    if (!isCurrent()) return;
    clearTimeout(playbackLimit); playbackLimit = undefined;
    if (collection.open) collection.close();
    if (reduced.matches) { navigate(); return; }
    playbackTransition = gsap.timeline({ onComplete: navigate })
      .to(transition, { autoAlpha: 1, duration: .35, ease: 'power2.inOut' })
      .fromTo(transition.querySelector('strong'), { y: 16 }, { y: 0, duration: .4, ease: 'power3.out' }, 0)
      .to('.transition-line', { scaleX: 1, duration: .35, ease: 'power2.inOut' }, .12);
  } catch { if (isCurrent()) navigate(); }
}
window.addEventListener('pagehide', event => {
  pageActive = false; collectionGeneration++; cancelAutomaticPlayback(); cancelPlayback(); clearObjectHover();
  if (event.persisted) scene?.reset(); else scene?.dispose();
});
window.addEventListener('pageshow', event => {
  pageActive = true;
  if (!event.persisted) return;
  cancelAutomaticPlayback(); cancelPlayback(); navigating = false; mode = 'home';
  if (collection.open) collection.close(); if (contact.open) contact.close();
  document.body.classList.remove('collection-open', 'collection-playing');
  scene?.reset(); host.style.visibility = '';
  document.querySelectorAll<HTMLButtonElement>('[data-open-collection]').forEach(button => button.disabled = false);
  gsap.set('.record-transition', { autoAlpha: 0 }); gsap.set('.transition-line', { scaleX: 0 });
  status.textContent = ''; void finishLoading();
});
