import { gsap } from 'gsap';

type Tile = {
  element: HTMLElement;
  button: HTMLButtonElement;
  cube: HTMLElement;
  front: HTMLElement;
  next: HTMLElement;
  caption: HTMLElement | null;
  visible: boolean;
  hovered: boolean;
  focused: boolean;
  timer: number;
  tween: gsap.core.Tween | null;
  settling: boolean;
  preparing: boolean;
  cancelPreparation: (() => void) | null;
  version: number;
  turns: number;
  initialDelay: number;
  depth: number;
};

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const controls = [...document.querySelectorAll<HTMLButtonElement>('[data-gallery-motion]')];
const tiles: Tile[] = [];
const cleanup: (() => void)[] = [];
let userPaused = false;
let suspended = false;
let disposed = false;
let activeTurns = 0;
const random = (minimum: number, maximum: number) => minimum + Math.random() * (maximum - minimum);

function listen(target: EventTarget, event: string, handler: EventListener, options?: AddEventListenerOptions) {
  target.addEventListener(event, handler, options);
  cleanup.push(() => target.removeEventListener(event, handler, options));
}

function globallyPaused() {
  return disposed || suspended || document.hidden || reduced.matches || userPaused
    || document.body.classList.contains('menu-open') || Boolean(document.querySelector('dialog[open]'));
}

function eligible(tile: Tile) {
  return !globallyPaused() && tile.visible && !tile.hovered && !tile.focused;
}

function updateContent(tile: Tile) {
  const image = tile.front.querySelector<HTMLImageElement>('img');
  const src = tile.front.dataset.src || image?.getAttribute('src');
  const alt = tile.front.dataset.alt || image?.alt;
  if (src) tile.button.dataset.src = src;
  if (alt) {
    tile.button.dataset.alt = alt;
    if (tile.button.classList.contains('gallery-zoom')) tile.button.setAttribute('aria-label', `Ampliar imagen: ${alt}`);
  }
  if (tile.caption && tile.front.dataset.caption !== undefined) tile.caption.textContent = tile.front.dataset.caption;
  tile.front.setAttribute('aria-hidden', 'false');
  tile.next.setAttribute('aria-hidden', 'true');
}

function exchangeFaces(tile: Tile) {
  tile.front.classList.replace('bento-face--front', 'bento-face--next');
  tile.next.classList.replace('bento-face--next', 'bento-face--front');
  [tile.front, tile.next] = [tile.next, tile.front];
  tile.element.dataset.turns = String(++tile.turns);
  updateContent(tile);
}

function clearTimer(tile: Tile) {
  if (tile.timer) window.clearTimeout(tile.timer);
  tile.timer = 0;
}

function currentAngle(tile: Tile) {
  return Number.parseFloat(String(gsap.getProperty(tile.cube, '--cube-angle'))) || 0;
}

// Click capture uses immediate settlement before site.ts reads data-src. Hover and
// keyboard focus use the short finishing tween below, so they do not snap a cube.
function settle(tile: Tile, nearestFace = true) {
  clearTimer(tile);
  tile.version++;
  tile.cancelPreparation?.();
  tile.cancelPreparation = null;
  tile.preparing = false;
  if (tile.tween) {
    const completeNext = nearestFace && currentAngle(tile) >= 45;
    tile.tween.kill();
    tile.tween = null;
    activeTurns = Math.max(0, activeTurns - 1);
    if (completeNext) exchangeFaces(tile);
  }
  tile.settling = false;
  gsap.set(tile.cube, { '--cube-angle': '0deg' });
  tile.cube.classList.remove('is-turning');
}

function finishTurn(tile: Tile, completeNext: boolean) {
  tile.tween = null;
  tile.settling = false;
  activeTurns = Math.max(0, activeTurns - 1);
  if (completeNext) exchangeFaces(tile);
  gsap.set(tile.cube, { '--cube-angle': '0deg' });
  tile.cube.classList.remove('is-turning');
  schedule(tile);
}

function settleSmoothly(tile: Tile) {
  clearTimer(tile);
  tile.version++;
  tile.cancelPreparation?.();
  tile.cancelPreparation = null;
  tile.preparing = false;
  if (!tile.tween || tile.settling) return;
  const completeNext = currentAngle(tile) >= 45;
  tile.tween.kill();
  // Replacing an active turn keeps its existing concurrency slot until this
  // finishing tween ends or an immediate settlement releases it.
  tile.settling = true;
  tile.tween = gsap.to(tile.cube, {
    '--cube-angle': completeNext ? '90deg' : '0deg',
    duration: .2,
    ease: 'power2.out',
    onComplete: () => finishTurn(tile, completeNext),
  });
}

function schedule(tile: Tile, delay?: number) {
  if (!eligible(tile) || tile.timer || tile.tween || tile.preparing) return;
  const wait = delay ?? (tile.turns === 0 ? tile.initialDelay : random(6000, 15000));
  tile.timer = window.setTimeout(() => {
    tile.timer = 0;
    void turn(tile);
  }, wait);
}

async function turn(tile: Tile) {
  if (!eligible(tile) || tile.tween || tile.preparing) return;
  // Two simultaneous turns are enough for an irregular rhythm, without asking the
  // browser to composite all eight large faces together.
  if (activeTurns >= 2) { schedule(tile, random(650, 1700)); return; }
  const version = ++tile.version;
  tile.preparing = true;
  const images = [...tile.next.querySelectorAll<HTMLImageElement>('img')];
  for (const image of images) image.loading = 'eager';
  let preparationTimer = 0;
  let cancelPreparation: () => void;
  const preparationExpired = new Promise<boolean>(resolve => {
    cancelPreparation = () => {
      window.clearTimeout(preparationTimer);
      resolve(false);
    };
    tile.cancelPreparation = cancelPreparation;
    preparationTimer = window.setTimeout(() => resolve(false), 5000);
  });
  const loaded = await Promise.race([
    Promise.all(images.map(image => image.decode().then(() => image.naturalWidth > 0, () => false))).then(values => values.every(Boolean)),
    preparationExpired,
  ]);
  if (preparationTimer) window.clearTimeout(preparationTimer);
  if (tile.cancelPreparation === cancelPreparation!) tile.cancelPreparation = null;
  if (disposed || tile.version !== version) return;
  tile.preparing = false;
  if (!loaded || !eligible(tile)) { schedule(tile, random(6500, 12000)); return; }
  if (activeTurns >= 2) { schedule(tile, random(650, 1700)); return; }
  activeTurns++;
  tile.cube.classList.add('is-turning');
  tile.tween = gsap.to(tile.cube, {
    '--cube-angle': '90deg',
    duration: random(.9, 1.2),
    ease: 'power2.inOut',
    onComplete: () => finishTurn(tile, true),
  });
}

function sync(smooth = false) {
  const wantsMotion = !userPaused && !reduced.matches;
  for (const control of controls) {
    control.hidden = false;
    control.disabled = reduced.matches;
    control.setAttribute('aria-pressed', String(wantsMotion));
    const label = control.querySelector<HTMLElement>('[data-gallery-motion-label]') || control;
    label.textContent = reduced.matches ? 'Movimiento reducido' : wantsMotion ? 'Pausar animación' : 'Activar animación';
  }
  for (const tile of tiles) {
    if (eligible(tile)) schedule(tile);
    else if (smooth && tile.visible && !document.hidden && !suspended && !disposed && !reduced.matches) settleSmoothly(tile);
    else settle(tile);
  }
}

for (const [index, element] of [...document.querySelectorAll<HTMLElement>('.bento-gallery .bento-tile')].entries()) {
  const button = element.querySelector<HTMLButtonElement>('button');
  const cube = button?.querySelector<HTMLElement>('.bento-cube');
  const front = cube?.querySelector<HTMLElement>('.bento-face--front');
  const next = cube?.querySelector<HTMLElement>('.bento-face--next');
  if (!button || !cube || !front || !next) continue;
  const tile: Tile = {
    element, button, cube, front, next,
    caption: element.querySelector('[data-bento-caption]'),
    visible: false, hovered: false, focused: false,
    timer: 0, tween: null, settling: false, preparing: false, cancelPreparation: null, version: 0, turns: 0, depth: 0,
    initialDelay: 5000 + (index * 1973) % 7200 + random(0, 2600),
  };
  tiles.push(tile);
  updateContent(tile);
  listen(button, 'pointerenter', event => {
    if ((event as PointerEvent).pointerType === 'touch') return;
    tile.hovered = true;
    settleSmoothly(tile);
  });
  listen(button, 'pointerleave', () => { tile.hovered = false; schedule(tile); });
  listen(button, 'focusin', () => { tile.focused = true; settleSmoothly(tile); });
  listen(button, 'focusout', () => { tile.focused = false; schedule(tile); });
  listen(button, 'click', () => { settle(tile); updateContent(tile); }, { capture: true });
}

const intersection = new IntersectionObserver(entries => {
  for (const entry of entries) {
    const tile = tiles.find(item => item.element === entry.target);
    if (!tile) continue;
    tile.visible = entry.isIntersecting && entry.intersectionRatio > .08;
    if (eligible(tile)) schedule(tile);
    else settle(tile);
  }
}, { threshold: [.08, .25], rootMargin: '0px' });

const resize = new ResizeObserver(entries => {
  for (const entry of entries) {
    const tile = tiles.find(item => item.button === entry.target);
    if (!tile) continue;
    const depth = tile.button.clientHeight / 2;
    if (depth > 0 && Math.abs(depth - tile.depth) >= .5) {
      tile.depth = depth;
      tile.cube.style.setProperty('--cube-depth', `${depth}px`);
    }
  }
});
for (const tile of tiles) { intersection.observe(tile.element); resize.observe(tile.button); }

const modalObserver = new MutationObserver(() => sync());
document.querySelectorAll('dialog').forEach(dialog => modalObserver.observe(dialog, { attributes: true, attributeFilter: ['open'] }));
modalObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
for (const control of controls) listen(control, 'click', () => { userPaused = !userPaused; sync(true); });
listen(document, 'visibilitychange', () => sync());
listen(reduced, 'change', () => sync());

function dispose() {
  disposed = true;
  for (const tile of tiles) settle(tile, false);
  intersection.disconnect();
  resize.disconnect();
  modalObserver.disconnect();
  cleanup.forEach(remove => remove());
}
listen(window, 'pagehide', event => {
  suspended = true;
  sync();
  if (!(event as PageTransitionEvent).persisted) dispose();
});
listen(window, 'pageshow', () => { suspended = false; sync(); });
sync();
