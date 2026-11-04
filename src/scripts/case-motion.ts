import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
  document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}
