import { Photo, AlbumPage } from './types';
import { uniquifySVGIds, injectImagesIntoSVG } from './svgUtils';
import layoutsMetadata from './layouts.json';

// Import all layout SVG files
import layout1 from '@/assets/layouts/layout1.svg?raw';
import layout2 from '@/assets/layouts/layout2.svg?raw';
import layout3 from '@/assets/layouts/layout3.svg?raw';
import layout4 from '@/assets/layouts/layout4.svg?raw';
import layout5 from '@/assets/layouts/layout5.svg?raw';
import layout6 from '@/assets/layouts/layout6.svg?raw';
import layout7 from '@/assets/layouts/layout7.svg?raw';
import layout8 from '@/assets/layouts/layout8.svg?raw';
import layout9 from '@/assets/layouts/layout9.svg?raw';
import layout10 from '@/assets/layouts/layout10.svg?raw';

const layoutTemplates: Record<string, string> = {
  'layout1.svg': layout1,
  'layout2.svg': layout2,
  'layout3.svg': layout3,
  'layout4.svg': layout4,
  'layout5.svg': layout5,
  'layout6.svg': layout6,
  'layout7.svg': layout7,
  'layout8.svg': layout8,
  'layout9.svg': layout9,
  'layout10.svg': layout10,
};

/**
 * Simple client-side layout generation
 * Distributes photos across layouts based on available frames
 */
export function generateAlbumPages(photos: Photo[]): AlbumPage[] {
  const pages: AlbumPage[] = [];
  const layoutKeys = Object.keys(layoutsMetadata);
  let photoIndex = 0;
  let pageNumber = 0;

  while (photoIndex < photos.length) {
    // Cycle through layouts
    const layoutName = layoutKeys[pageNumber % layoutKeys.length];
    const layout = layoutsMetadata[layoutName as keyof typeof layoutsMetadata];
    const templateSvg = layoutTemplates[layoutName];

    if (!templateSvg) {
      console.error(`Template not found: ${layoutName}`);
      continue;
    }

    // Determine how many photos to use for this page
    const photosForPage = Math.min(layout.frameCount, photos.length - photoIndex);
    const photoAssignments: Array<{ frameNumber: number; photoId: string }> = [];

    // Assign photos to frames
    for (let i = 0; i < photosForPage; i++) {
      photoAssignments.push({
        frameNumber: i + 1,
        photoId: photos[photoIndex + i].id
      });
    }

    // Create photos map
    const photosMap = new Map(photos.map(p => [p.id, p]));

    // Generate SVG with images
    let svgContent = templateSvg;
    svgContent = uniquifySVGIds(svgContent, `page${pageNumber}`);
    svgContent = injectImagesIntoSVG(svgContent, photoAssignments, photosMap);

    pages.push({
      id: `page-${pageNumber}`,
      pageNumber,
      svgContent,
      layoutName
    });

    photoIndex += photosForPage;
    pageNumber++;
  }

  return pages;
}
