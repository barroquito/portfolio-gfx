import type { Project } from './projects';

type GalleryImage = Project['gallery'][number];
export type BentoFace = GalleryImage & { position: string; width?: number; height?: number };
export type BentoTile = { front: BentoFace; next: BentoFace };

const sizes: Record<string, [number, number]> = {
  '/images/bulk-drink.webp': [832, 1248],
  '/images/bulk-billboard.webp': [1200, 1800],
  '/images/bulk-burger.webp': [832, 1248],
  '/images/bulk-bag.webp': [832, 1248],
  '/images/bulk-hero.webp': [517, 343],
};

// Eight views of the five original pieces, including details. The small facade
// image is reserved for the smaller tiles rather than enlarged across the grid.
const bulkViews = [
  [0, 2, '50% 50%', '50% 50%'],
  [2, 4, '50% 48%', '50% 50%'],
  [3, 1, '50% 50%', '50% 58%'],
  [4, 0, '50% 50%', '50% 65%'],
  [1, 3, '50% 58%', '50% 42%'],
  [2, 0, '50% 50%', '50% 50%'],
  [0, 2, '50% 66%', '50% 65%'],
  [3, 1, '50% 42%', '50% 56%'],
] as const;

export function getBentoGallery(project: Project): BentoTile[] {
  if (!project.gallery.length) return [];
  const face = (index: number, position = '50% 50%'): BentoFace => {
    const item = project.gallery[index % project.gallery.length];
    const [width, height] = sizes[item.src] || [];
    return { ...item, position, width, height };
  };
  if (project.slug === 'bulk') return bulkViews.map(([front, next, a, b]) => ({ front: face(front, a), next: face(next, b) }));
  // Other cases become ready as soon as their own original images are added.
  return Array.from({ length: 8 }, (_, index) => ({ front: face(index), next: face(index + 1) }));
}
