import { gsap } from 'gsap';
import type { RecordProject, RecordScene } from './record-scene';

type CollectionProject = RecordProject & { preview: { image?: string; alt: string; video?: string } };
const projects = JSON.parse(document.getElementById('record-project-data')!.textContent!) as CollectionProject[];
const collection = document.querySelector<HTMLDialogElement>('#collection-dialog')!;
const contact = document.querySelector<HTMLDialogElement>('#contact-dialog')!;
const host = document.querySelector<HTMLElement>('#record-scene')!;
const table = host.closest<HTMLElement>('.listening-table')!;
const stage = collection.querySelector<HTMLElement>('.orbit-stage')!;
const status = collection.querySelector<HTMLElement>('[data-orbit-status]')!;
const previewLink = collection.querySelector<HTMLAnchorElement>('[data-preview-link]')!;
const previewTitle = collection.querySelector<HTMLElement>('[data-preview-title]')!;
const previewImage = collection.querySelector<HTMLImageElement>('[data-preview-image]')!;
const previewVideo = collection.querySelector<HTMLVideoElement>('[data-preview-video]')!;
const previewMedia = collection.querySelector<HTMLElement>('.orbit-preview-media')!;
const followX = gsap.quickTo(previewMedia, 'x', { duration: .18, ease: 'power2.out' });
const followY = gsap.quickTo(previewMedia, 'y', { duration: .18, ease: 'power2.out' });
function followPointer(event: PointerEvent) {
  const entering = !previewMedia.classList.contains('cursor-preview');
  previewMedia.classList.add('cursor-preview');
  const x = Math.max(12, Math.min(innerWidth - previewMedia.offsetWidth - 12, event.clientX - previewMedia.offsetWidth / 2));
  const y = Math.max(12, Math.min(innerHeight - previewMedia.offsetHeight - 12, event.clientY - previewMedia.offsetHeight / 2));
  if (entering || motion.matches) gsap.set(previewMedia, { x, y });
  else { followX(x); followY(y); }
}
function resetPointerPreview() {
  followX.tween.pause(); followY.tween.pause();
  previewMedia.classList.remove('cursor-preview');
  gsap.set(previewMedia, { clearProps: 'transform' });
}
const fallbackCards = [...stage.querySelectorAll<HTMLAnchorElement>('[data-fallback-record]')];
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const fineHover = window.matchMedia('(hover: hover) and (pointer: fine)');
const initialHomeFrame = { host: host.getBoundingClientRect(), table: table.getBoundingClientRect() };
const wrap = (index: number) => ((index % projects.length) + projects.length) % projects.length;
const projectPath = (project: RecordProject) => '/proyectos/' + project.slug + '/';

let scene: RecordScene | null = null;
let useWebGL = false;
let closing = false;
let leaving = false;
let originFocus: HTMLElement | null = null;
let selected = 0;
let fallbackOrbit = 0;
let requestedSelection: number | null = null;
let hovered: number | null = null;
let previewed: number | null = null;
let videoTimer: number | undefined;
let snapTimer: number | undefined;
let suppressClick = false;

function stopPreviewVideo() {
  clearTimeout(videoTimer);
  previewVideo.hidden = true;
  if (!previewVideo.hasAttribute('src')) return;
  previewVideo.pause();
  previewVideo.removeAttribute('src');
  previewVideo.load();
}

function showPreview(index: number, force = false) {
  if (previewed === index && !force) return;
  previewed = index;
  const project = projects[index];
  const { image, alt, video } = project.preview;

  previewTitle.textContent = project.title;
  previewLink.href = projectPath(project);
  previewImage.alt = alt;
  if (image) previewImage.src = image;
  else previewImage.removeAttribute('src');
  previewImage.hidden = !image;
  stopPreviewVideo();
  if (video && !motion.matches) {
    videoTimer = window.setTimeout(() => {
      previewVideo.src = video;
      void previewVideo.play().catch(() => { previewVideo.hidden = true; });
    }, 160);
  }
}

previewVideo.addEventListener('playing', () => { previewVideo.hidden = false; });
previewVideo.addEventListener('error', () => { previewVideo.hidden = true; });
previewVideo.addEventListener('timeupdate', () => {
  if (previewVideo.currentTime >= 4.75) previewVideo.pause();
});
motion.addEventListener('change', () => {
  if (collection.open && !closing) showPreview(hovered ?? selected, true);
});

function layoutFallback() {
  const count = fallbackCards.length;
  const width = stage.clientWidth;
  for (const [index, card] of fallbackCards.entries()) {
    const slot = ((index - fallbackOrbit + count / 2) % count + count) % count - count / 2;
    const angle = slot * Math.PI * 2 / count;
    const depth = Math.cos(angle);
    card.style.setProperty('--coil-x', Math.sin(angle) * width * .34 + 'px');
    card.style.setProperty('--coil-y', Math.sin(angle) * stage.clientHeight * .13 + 'px');
    card.style.setProperty('--coil-z', (depth - 1) * 400 + 'px');
    card.style.setProperty('--coil-yaw', angle * .6 + 'rad');
    card.style.zIndex = String(Math.round(10 + depth * 8));
    card.style.visibility = Math.abs(slot) < 1.75 ? 'visible' : 'hidden';
  }
}
new ResizeObserver(() => {
  if (collection.open && !useWebGL) layoutFallback();
}).observe(stage);

function centerRecord(index: number) {
  selected = wrap(index);
  const announcement = projects[selected].title + ', ' + (selected + 1) + ' de ' + projects.length;
  if (status.textContent !== announcement) status.textContent = announcement;
  if (hovered === null) showPreview(selected);
}

function clearRecordHover() {
  resetPointerPreview();
  hovered = null;
  delete stage.dataset.hoverRecord;
  if (collection.open && !closing) showPreview(selected);
}

function selectRecord(index: number) {
  resetPointerPreview();
  clearTimeout(snapTimer);
  hovered = null;
  delete stage.dataset.hoverRecord;
  centerRecord(index);
  if (useWebGL) {
    requestedSelection = selected;
    scene!.select(selected);
  } else {
    fallbackOrbit = selected;
    layoutFallback();
  }
}

function syncScene() {
  if (!collection.open || closing || !useWebGL || !scene) return;
  if (host.dataset.renderState !== 'ready') {
    useWebGL = false;
    collection.dataset.render = 'fallback';
    fallbackOrbit = selected;
    requestedSelection = null;
    clearRecordHover();
    layoutFallback();
    return;
  }
  const index = scene.centeredIndex();
  if (requestedSelection !== null) {
    if (index === requestedSelection) requestedSelection = null;
    return;
  }
  centerRecord(index);
}
new MutationObserver(syncScene).observe(host, {
  attributes: true,
  attributeFilter: ['data-render-state', 'data-active-record'],
});

function focusOrigin() {
  const element = document.activeElement as HTMLElement | null;
  if (element?.closest('#main-nav') && window.matchMedia('(max-width: 760px)').matches) {
    return document.querySelector<HTMLElement>('.menu-toggle');
  }
  if (element?.closest('dialog')) return originFocus;
  return element;
}

function openCollection() {
  if (collection.open || leaving) return;
  if (contact.open) contact.close();
  originFocus = focusOrigin();
  scene?.clearHover();
  useWebGL = !!scene && host.dataset.renderState === 'ready';
  collection.dataset.render = useWebGL ? 'webgl' : 'fallback';
  document.body.classList.add('collection-open');
  collection.showModal();
  hovered = null;
  requestedSelection = null;
  centerRecord(selected);
  previewLink.focus({ preventScroll: true });
  if (useWebGL) void scene!.openCollection(selected);
  else {
    fallbackOrbit = selected;
    layoutFallback();
  }
}

async function closeCollection(restoreFocus = true) {
  if (!collection.open || closing) return;
  closing = true;
  resetPointerPreview();
  clearTimeout(snapTimer);
  stopPreviewVideo();
  previewed = null;
  hovered = null;
  delete stage.dataset.hoverRecord;
  collection.dataset.phase = 'closing';
  if (useWebGL) await scene!.closeCollection();
  closing = false;
  delete collection.dataset.phase;
  document.body.classList.remove('collection-open');
  collection.close();
  scene?.reset();
  if (restoreFocus) originFocus?.focus({ preventScroll: true });
  if (location.hash === '#proyectos') history.replaceState(history.state, '', location.pathname + location.search);
}

document.querySelectorAll('[data-open-collection]').forEach(button => button.addEventListener('click', openCollection));
collection.querySelector('[data-close-collection]')!.addEventListener('click', () => { void closeCollection(); });
collection.addEventListener('cancel', event => { event.preventDefault(); void closeCollection(); });
collection.querySelectorAll<HTMLButtonElement>('[data-step]').forEach(button => {
  button.addEventListener('click', () => selectRecord(selected + Number(button.dataset.step)));
});
collection.addEventListener('keydown', event => {
  if (closing || event.altKey || event.ctrlKey || event.metaKey) return;
  const offsets: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -1, ArrowDown: 1 };
  const offset = offsets[event.key];
  if (!offset && event.key !== 'Home' && event.key !== 'End') return;
  event.preventDefault();
  selectRecord(offset ? selected + offset : event.key === 'Home' ? 0 : projects.length - 1);
});

function advance(pixels: number) {
  requestedSelection = null;
  const distance = pixels / Math.min(245, Math.max(125, stage.clientWidth * .42));
  if (useWebGL) scene!.scrollBy(distance * 560);
  else {
    fallbackOrbit = (fallbackOrbit + distance) % projects.length;
    layoutFallback();
    centerRecord(Math.round(fallbackOrbit));
  }
}

function snapToRecord() {
  if (useWebGL) {
    requestedSelection = scene!.centeredIndex();
    scene!.select(requestedSelection);
    centerRecord(requestedSelection);
  } else selectRecord(Math.round(fallbackOrbit));
}
stage.addEventListener('wheel', event => {
  if (closing || event.ctrlKey) return;
  event.preventDefault();
  clearRecordHover();
  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
  advance(delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stage.clientHeight : 1));
  clearTimeout(snapTimer);
  snapTimer = window.setTimeout(snapToRecord, 130);
}, { passive: false });

let gesture: { id: number; x: number; y: number; axis?: 'x' | 'y' } | null = null;
function pickRecord(event: MouseEvent) {
  if (useWebGL) return scene!.pick(event.clientX, event.clientY);
  const card = (event.target as Element).closest<HTMLElement>('[data-fallback-record]');
  return card ? Number(card.dataset.fallbackRecord) : null;
}
stage.addEventListener('pointerdown', event => {
  if (closing || !event.isPrimary || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  suppressClick = false;
  gesture = { id: event.pointerId, x: event.clientX, y: event.clientY };
});
stage.addEventListener('pointermove', event => {
  if (closing) return;
  if (gesture?.id === event.pointerId) {
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (!gesture.axis) {
      if (Math.hypot(dx, dy) < 6) return;
      gesture.axis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
      stage.setPointerCapture(event.pointerId);
      stage.classList.add('is-dragging');
      clearTimeout(snapTimer);
      clearRecordHover();
    }
    advance(gesture.axis === 'x' ? -dx : -dy);
    gesture.x = event.clientX;
    gesture.y = event.clientY;
    return;
  }
  if (!fineHover.matches || event.pointerType === 'touch') return;
  const index = pickRecord(event);
  if (index !== null) followPointer(event);
  if (index === hovered) return;
  if (index === null) clearRecordHover();
  else {
    hovered = index;
    stage.dataset.hoverRecord = projects[index].slug;
    showPreview(index);
  }
});
function endGesture(event: PointerEvent) {
  if (gesture?.id !== event.pointerId) return;
  if (gesture.axis) {
    suppressClick = true;
    stage.classList.remove('is-dragging');
    snapToRecord();
  }
  gesture = null;
}
stage.addEventListener('pointerup', endGesture);
stage.addEventListener('pointercancel', endGesture);
stage.addEventListener('lostpointercapture', endGesture);
stage.addEventListener('pointerleave', () => {
  if (!gesture?.axis) gesture = null;
  clearRecordHover();
});
stage.addEventListener('dragstart', event => event.preventDefault());
stage.addEventListener('click', event => {
  if (suppressClick || closing) {
    suppressClick = false;
    event.preventDefault();
  } else if (useWebGL) {
    const index = pickRecord(event);
    if (index !== null) location.assign(projectPath(projects[index]));
  }
});

function openContact() {
  if (contact.open) return;
  const show = () => { originFocus = focusOrigin(); contact.showModal(); };
  if (collection.open) void closeCollection(false).then(show);
  else show();
}
contact.querySelector('[data-close-dialog]')?.addEventListener('click', () => contact.close());
contact.addEventListener('close', () => originFocus?.focus({ preventScroll: true }));
contact.addEventListener('click', event => {
  if (event.target !== contact) return;
  const box = contact.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) contact.close();
});
function navigateHash(hash: string) {
  if (hash === '#proyectos') openCollection();
  else if (hash === '#sobre-mi') location.replace('/proyectos/sobre-mi/');
  else if (hash === '#contacto') openContact();
}
document.querySelectorAll<HTMLAnchorElement>('#main-nav a[href^="#"]').forEach(link => link.addEventListener('click', event => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  navigateHash(link.hash);
}));
window.addEventListener('hashchange', () => navigateHash(location.hash));

let homeHoverFrame = 0;
let homeHoverX = 0;
let homeHoverY = 0;
table.addEventListener('pointermove', event => {
  if (!scene || collection.open || contact.open || !fineHover.matches || motion.matches || event.pointerType === 'touch') return;
  homeHoverX = event.clientX;
  homeHoverY = event.clientY;
  if (!homeHoverFrame) homeHoverFrame = requestAnimationFrame(() => {
    homeHoverFrame = 0;
    scene?.hoverAt(homeHoverX, homeHoverY);
  });
});
function clearHomeHover() {
  cancelAnimationFrame(homeHoverFrame);
  homeHoverFrame = 0;
  scene?.clearHover();
}
table.addEventListener('pointerleave', clearHomeHover);
const stackHotspot = table.querySelector<HTMLElement>('.collection-hotspot')!;
stackHotspot.addEventListener('focus', () => scene?.hoverCollection());
stackHotspot.addEventListener('blur', clearHomeHover);
motion.addEventListener('change', clearHomeHover);

async function initializeScene() {
  try {
    await document.fonts.ready;
    const { createRecordScene } = await import('./record-scene');
    if (leaving) return;
    const loaded = await createRecordScene(host, projects, undefined, initialHomeFrame);
    if (leaving) loaded.dispose();
    else scene = loaded;
  } catch (error) {
    host.dataset.renderState = 'fallback';
    console.warn('Vista 3D no disponible.', error);
  }
}

const url = new URL(location.href);
const requestedSlug = url.searchParams.get('play');
const requestedProject = projects.find(project => project.slug === requestedSlug);
if (requestedProject) location.replace(projectPath(requestedProject));
else {
  if (requestedSlug !== null) {
    url.searchParams.delete('play');
    history.replaceState(history.state, '', url);
  }
  navigateHash(location.hash);
  void initializeScene();
}

window.addEventListener('pagehide', event => {
  leaving = true;
  clearTimeout(snapTimer);
  stopPreviewVideo();
  clearHomeHover();
  if (!event.persisted) scene?.dispose();
});
window.addEventListener('pageshow', event => {
  leaving = false;
  if (event.persisted && collection.open && !closing) showPreview(hovered ?? selected, true);
});
