import type { Photo, AlbumPage } from "./types";
import {
  uniquifySVGIds,
  injectImagesIntoSVG,
  extractFrameCoordinates,
} from "./svgUtils";
import layoutsMetadata from "./layouts.json";

// Import all layout SVG files
import layout8 from "@/assets/layouts/layout8.svg?raw";
import layout9 from "@/assets/layouts/layout9.svg?raw";
import layout10 from "@/assets/layouts/layout10.svg?raw";
import layout11 from "@/assets/layouts/layout11.svg?raw";
import layout12 from "@/assets/layouts/layout12.svg?raw";
import layout13 from "@/assets/layouts/layout13.svg?raw";
import layout14 from "@/assets/layouts/layout14.svg?raw";
import layout15 from "@/assets/layouts/layout15.svg?raw";
import layout16 from "@/assets/layouts/layout16.svg?raw";
import layout17 from "@/assets/layouts/layout17.svg?raw";
import layout18 from "@/assets/layouts/layout18.svg?raw";
import layout19 from "@/assets/layouts/layout19.svg?raw";
import layout20 from "@/assets/layouts/layout20.svg?raw";
import layout21 from "@/assets/layouts/layout21.svg?raw";
import layout22 from "@/assets/layouts/layout22.svg?raw";
import layout23 from "@/assets/layouts/layout23.svg?raw";
import layout24 from "@/assets/layouts/layout24.svg?raw";

const layoutTemplates: Record<string, string> = {
  "layout8.svg": layout8,
  "layout9.svg": layout9,
  "layout10.svg": layout10,
  "layout11.svg": layout11,
  "layout12.svg": layout12,
  "layout13.svg": layout13,
  "layout14.svg": layout14,
  "layout15.svg": layout15,
  "layout16.svg": layout16,
  "layout17.svg": layout17,
  "layout18.svg": layout18,
  "layout19.svg": layout19,
  "layout20.svg": layout20,
  "layout21.svg": layout21,
  "layout22.svg": layout22,
  "layout23.svg": layout23,
  "layout24.svg": layout24,
};

// --- Helper: quick check that injected SVG contains expected number of images ---
function svgHasAllImages(svgContent: string, expectedCount: number): boolean {
  try {
    const imageTagRegex =
      /<image\b[^>]*?(?:href|xlink:href)\s*=\s*["']([^"']+)["'][^>]*>/g;
    let match;
    let validCount = 0;
    while ((match = imageTagRegex.exec(svgContent)) !== null) {
      const hrefVal = (match[1] || "").trim();
      if (hrefVal && hrefVal !== "data:," && !hrefVal.includes("undefined")) {
        validCount++;
      }
    }
    return validCount >= expectedCount;
  } catch (e) {
    console.warn("svgHasAllImages failed", e);
    return false;
  }
}

function isGoodAspectMatch(photoAspect: number, frameAspect: number): boolean {
  const diff = Math.abs(photoAspect - frameAspect);

  // Allow 35% difference in aspect ratio
  if (diff > 0.35) return false;

  // Check orientation mismatch
  const isPortraitPhoto = photoAspect < 0.9;
  const isLandscapePhoto = photoAspect > 1.1;
  const isPortraitFrame = frameAspect < 0.9;
  const isLandscapeFrame = frameAspect > 1.1;

  // Reject if orientations are opposite
  if (
    (isPortraitPhoto && isLandscapeFrame) ||
    (isLandscapePhoto && isPortraitFrame)
  ) {
    return false;
  }

  return true;
}

function assignPhotosToFrames(
  photos: Photo[],
  frames: Array<{ id: number; aspect_ratio: number }>,
  usedPhotoIds: Set<string>
): Array<{ frameNumber: number; photoId: string }> | null {
  const assignments: Array<{ frameNumber: number; photoId: string }> = [];
  const availablePhotos = photos.filter((p) => !usedPhotoIds.has(p.id));

  if (availablePhotos.length < frames.length) {
    return null; // Not enough photos for this layout
  }

  // Score each photo for each frame
  const scores: Array<{ frameIdx: number; photoIdx: number; score: number }> =
    [];

  frames.forEach((frame, frameIdx) => {
    for (let photoIdx = 0; photoIdx < availablePhotos.length; photoIdx++) {
      const photo = availablePhotos[photoIdx];

      const photoAspect = photo.aspectRatio || 1;
      const frameAspect = frame.aspect_ratio || 1;
      const aspectDiff = Math.abs(photoAspect - frameAspect);

      const isLandscapePhoto = photoAspect > 1.2;
      const isPortraitFrame = frameAspect < 0.85;

      // Reject landscape photos in very narrow portrait frames
      if (isLandscapePhoto && isPortraitFrame) {
        continue;
      }

      // Scoring logic:
      // Base score: closer aspect ratio is better
      let score = 1 / (1 + aspectDiff);

      // Boost score for matching orientations
      const isPortraitPhoto = photoAspect < 1;
      const isPortraitFrameLoose = frameAspect < 1;
      if (
        (isPortraitPhoto && isPortraitFrameLoose) ||
        (!isPortraitPhoto && !isPortraitFrameLoose)
      ) {
        score *= 1.2; // Stronger boost for orientation match
      }

      // Penalize severe mismatches
      if (aspectDiff > 0.5) score *= 0.3;
      if (aspectDiff > 1.0) score *= 0.1;

      scores.push({ frameIdx, photoIdx, score });
    }
  });

  // Greedy assignment: best matches first
  scores.sort((a, b) => b.score - a.score);

  const assignedFrames = new Set<number>();
  const assignedPhotos = new Set<number>();

  for (const { frameIdx, photoIdx } of scores) {
    if (assignedFrames.has(frameIdx) || assignedPhotos.has(photoIdx)) continue;

    assignments.push({
      frameNumber: frames[frameIdx].id,
      photoId: availablePhotos[photoIdx].id,
    });

    assignedFrames.add(frameIdx);
    assignedPhotos.add(photoIdx);

    if (assignments.length === frames.length) break;
  }

  // Only return if we filled all frames
  return assignments.length === frames.length ? assignments : null;
}

/**
 * AI-powered layout generation with robust fallback
 */
export async function generateAlbumPagesWithAI(
  photos: Photo[]
): Promise<AlbumPage[]> {
  return generateAlbumPagesDeterministic(photos);
}

function createPage(
  pageNumber: number,
  layoutName: string,
  templateSvg: string,
  photoAssignments: Array<{ frameNumber: number; photoId: string }>,
  photosMap: Map<string, Photo>
): AlbumPage | null {
  try {
    let svgContent = templateSvg;
    svgContent = uniquifySVGIds(svgContent, `page${pageNumber}`);
    svgContent = injectImagesIntoSVG(svgContent, photoAssignments, photosMap);

    const frameCoordinates = extractFrameCoordinates(svgContent);
    const photoIds = photoAssignments.map((a) => a.photoId);

    return {
      id: `page-${pageNumber}`,
      pageNumber,
      svgContent,
      layoutName,
      photoIds,
      frameCoordinates,
    };
  } catch (error) {
    console.error(`❌ Error creating page ${pageNumber}:`, error);
    return null;
  }
}

/**
 * Deterministic fallback layout generation
 * Guarantees all photos are used exactly once
 */
export function generateAlbumPagesDeterministic(photos: Photo[]): AlbumPage[] {
  console.log(`\n🔧 ========== DETERMINISTIC GENERATION ==========`);
  console.log(`📸 Photos to process: ${photos.length}`);

  const pages: AlbumPage[] = [];
  const usedPhotoIds = new Set<string>();
  const photosMap = new Map(photos.map((p) => [p.id, p]));

  // Sort layouts by frame count (prefer larger layouts)
  const sortedLayouts = Object.entries(layoutsMetadata).sort(
    (a, b) => b[1].frameCount - a[1].frameCount
  );

  let attempts = 0;
  const maxAttempts = photos.length * 2;

  while (usedPhotoIds.size < photos.length && attempts < maxAttempts) {
    attempts++;

    const remainingPhotos = photos.filter((p) => !usedPhotoIds.has(p.id));

    if (remainingPhotos.length === 0) break;

    let pageCreated = false;
    for (const [layoutName, layout] of sortedLayouts) {
      if (remainingPhotos.length < layout.frameCount) continue;

      const templateSvg = layoutTemplates[layoutName];
      if (!templateSvg) continue;

      const assignments = assignPhotosToFrames(
        remainingPhotos,
        layout.frames,
        usedPhotoIds
      );

      if (assignments) {
        const page = createPage(
          pages.length,
          layoutName,
          templateSvg,
          assignments,
          photosMap
        );
        if (page) {
          pages.push(page);
          assignments.forEach((a) => usedPhotoIds.add(a.photoId));
          pageCreated = true;
          break; // Move to next attempt
        }
      }
    }

    if (!pageCreated) {
      // If no layout was found, break and proceed to single-page generation
      break;
    }
  }

  // Final step: create single-photo pages for any remaining photos
  const remainingPhotos = photos.filter((p) => !usedPhotoIds.has(p.id));
  if (remainingPhotos.length > 0) {
    for (const photo of remainingPhotos) {
      const layoutName = "layout19.svg"; // A reliable single-photo layout
      const templateSvg = layoutTemplates[layoutName];
      const page = createPage(
        pages.length,
        layoutName,
        templateSvg,
        [{ frameNumber: 1, photoId: photo.id }],
        photosMap
      );
      if (page) {
        pages.push(page);
        usedPhotoIds.add(photo.id);
      }
    }
  }

  console.log(`\n📊 Deterministic Generation Complete:`);
  console.log(`   - Pages created: ${pages.length}`);
  console.log(`   - Photos used: ${usedPhotoIds.size}/${photos.length}`);
  console.log(`   - Attempts: ${attempts}`);

  return pages;
}
