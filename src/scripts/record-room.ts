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
const orbitStatus = collection.querySelector<HTMLElement>('[data-orbit-status]')!;
orbitStatus.setAttribute('aria-atomic', 'true');
type PlaybackProject = Parameters<RecordScene['play']>[0] & { description: string };
const projects = JSON.parse(document.getElementById('record-project-data')!.textContent || '[]') as PlaybackProject[];
let scene: RecordScene | null = null;
let mode: 'home' | 'opening' | 'collection' | 'closing' | 'playing' = 'home';
let activeIndex = 0, collectionGeneration = 0;
let keyboardIndex: number | null = null;
let sceneCollectionOpen = false;
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
  hoverFrame = 0; scene?.clearHover();
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

const fallbackCards = Array.from(stage.querySelectorAll<HTMLAnchorElement>('[data-fallback-record]'));
const fallbackTurns = fallbackCards.map(() => 0);
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
    card.style.setProperty('--coil-x', `${Math.sin(angle) * 28}vw`);
    card.style.setProperty('--coil-y', `${-slot * 12}dvh`);
    card.style.setProperty('--coil-z', `${(depth - 1) * 360}px`);
    card.style.setProperty('--coil-yaw', `${angle + turn}rad`);
    card.style.zIndex = String(Math.round(10 + depth * 8));
    card.style.visibility = Math.abs(slot) < 1.65 ? 'visible' : 'hidden';
  }
}

function announceSelection(index: number) {
  const { title, description } = projects[index];
  const text = `${title}. ${description}`;
  if (orbitStatus.textContent !== text) orbitStatus.textContent = text;
}

function centeredIndex() {
  if (!hasScene()) return wrapIndex(Math.round(fallbackPhase));
  return scene!.centeredIndex();
}

function syncVisibleSelection() {
  if (mode !== 'collection' || keyboardIndex !== null) return;
  activeIndex = centeredIndex();
  announceSelection(activeIndex);
}

async function openSceneCollection(index: number, immediate = false) {
  if (!hasScene()) return;
  sceneCollectionOpen = true;
  try { await scene!.openCollection(index, immediate); }
  catch {
    sceneCollectionOpen = false;
    collection.dataset.render = 'fallback';
    layoutFallback();
  }
}

function syncRenderMode() {
  const render = scene && host.dataset.renderState === 'ready' ? 'webgl' : 'fallback';
  if (render === collection.dataset.render) return;
  const browsing = collection.open && (mode === 'opening' || mode === 'collection');
  if (browsing && render === 'fallback' && hasScene()) {
    activeIndex = keyboardIndex ?? scene!.centeredIndex();
    fallbackPhase = activeIndex;
    announceSelection(activeIndex);
  }
  collection.dataset.render = render;
  if (browsing && render === 'webgl') {
    if (sceneCollectionOpen) scene!.select(activeIndex, true);
    else void openSceneCollection(activeIndex, true);
  }
  layoutFallback();
}

new MutationObserver(changes => {
  if (changes.some(change => change.attributeName === 'data-render-state')) syncRenderMode();
  if (changes.some(change => change.attributeName === 'data-active-record')) syncVisibleSelection();
}).observe(host, { attributes: true, attributeFilter: ['data-render-state', 'data-active-record'] });

function selectRecord(index: number) {
  if (mode !== 'collection' && mode !== 'opening') return;
  keyboardIndex = activeIndex = wrapIndex(index);
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
  keyboardIndex = null;
  fallbackTurns.fill(0);
  syncRenderMode();
  mode = 'opening';
  collection.dataset.phase = 'opening';
  document.body.classList.add('collection-open');
  if (!collection.open) collection.showModal();
  layoutFallback();
  announceSelection(activeIndex);
  // Expand and update the projection in one task; no intermediate resized frame.
  await openSceneCollection(activeIndex);
  if (generation !== collectionGeneration || !pageActive || navigating) return;
  mode = 'collection';
  if (hasScene()) scene!.select(activeIndex);
  collection.dataset.phase = 'collection';
  stage.focus({ preventScroll: true });
}
async function closeCollection(restoreFocus = true) {
  if (navigating || mode === 'home' || mode === 'closing') return;
  const generation = ++collectionGeneration;
  mode = 'closing';
  collection.dataset.phase = 'closing';
  try {
    if (hasScene()) await scene!.closeCollection();
    else scene?.reset();
  } catch { scene?.reset(); }
  if (generation !== collectionGeneration || !pageActive) return;
  mode = 'home';
  keyboardIndex = null; sceneCollectionOpen = false;
  if (collection.open) collection.close();
  orbitStatus.textContent = '';
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
    selectRecord((keyboardIndex ?? centeredIndex()) + direction);
  } else if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault();
    selectRecord(event.key === 'Home' ? 0 : projects.length - 1);
  } else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    const index = keyboardIndex ?? centeredIndex();
    if (mode === 'collection' && hasScene() && index !== centeredIndex()) scene!.select(index, true);
    openRecord(index);
  }
});

function advance(delta: number) {
  if (!delta) return;
  keyboardIndex = null;
  if (hasScene()) scene?.scrollBy(delta);
  else {
    fallbackPhase = (fallbackPhase + delta / 280) % projects.length;
    layoutFallback();
  }
  syncVisibleSelection();
}
stage.addEventListener('wheel', event => {
  if (event.ctrlKey || mode !== 'collection') return;
  event.preventDefault();
  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
  advance(delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stage.clientHeight : 1));
}, { passive: false });

let gesture: {
  id: number; x: number; y: number; index: number | null; touch: boolean;
  intent: 'orbit-x' | 'orbit-y' | 'turn' | null;
} | null = null;
stage.addEventListener('pointerdown', event => {
  if (mode !== 'collection' || !event.isPrimary || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const fallback = (event.target as Element).closest<HTMLElement>('[data-fallback-record]');
  const index = hasScene() ? scene!.pick(event.clientX, event.clientY) : fallback ? Number(fallback.dataset.fallbackRecord) : null;
  gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, index, touch: event.pointerType === 'touch', intent: null };
  keyboardIndex = null;
  syncVisibleSelection();
  stage.setPointerCapture(event.pointerId);
});
stage.addEventListener('pointermove', event => {
  if (!gesture || gesture.id !== event.pointerId || mode !== 'collection') return;
  const dx = event.clientX - gesture.x;
  const dy = event.clientY - gesture.y;
  if (!gesture.intent) {
    if (Math.hypot(dx, dy) < 6) return;
    const vertical = Math.abs(dy) > Math.abs(dx);
    gesture.intent = gesture.index === null || (gesture.touch && vertical)
      ? (vertical ? 'orbit-y' : 'orbit-x')
      : 'turn';
  }
  gesture.x = event.clientX;
  gesture.y = event.clientY;
  if (gesture.intent === 'turn') {
    if (!dx || gesture.index === null) return;
    if (hasScene()) scene!.rotate(gesture.index, dx);
    else {
      fallbackTurns[gesture.index] = (fallbackTurns[gesture.index] + dx * .007) % (Math.PI * 2);
      layoutFallback();
    }
  } else {
    advance(gesture.intent === 'orbit-y' ? -dy : -dx);
  }
});
stage.addEventListener('pointerup', event => {
  if (!gesture || gesture.id !== event.pointerId) return;
  const { index, intent } = gesture;
  gesture = null;
  if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
  if (!intent && index !== null) openRecord(index);
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
  keyboardIndex = null; sceneCollectionOpen = false;
  if (collection.open) collection.close(); if (contact.open) contact.close();
  orbitStatus.textContent = '';
  document.body.classList.remove('collection-open', 'collection-playing');
  scene?.reset(); host.style.visibility = '';
  document.querySelectorAll<HTMLButtonElement>('[data-open-collection]').forEach(button => button.disabled = false);
  gsap.set('.record-transition', { autoAlpha: 0 }); gsap.set('.transition-line', { scaleX: 0 });
  status.textContent = ''; void finishLoading();
});
