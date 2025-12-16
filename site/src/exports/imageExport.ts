/**
 * Utility to export HTML card elements as PNG images
 * Uses html-to-image for efficient rendering
 * Removes share buttons and replaces iframes before export
 *
 * Performance optimizations:
 * - Element cloning to avoid DOM mutations
 * - Batched DOM operations
 * - Direct conversion to PNG via html-to-image
 * - Clean separation of concerns with imageExport and pdfExport
 * - Image caching to avoid re-rendering unchanged cards
 * - Content hashing for cache invalidation
 */

// Export configuration constants
const EXPORT_PIXEL_RATIO = 1.5;
const TEXT_COLOR_OPACITY = 0.95;
const EXPORT_ZINDEX = 999999;
const EXPORT_DIMENSIONS_WIDTH = 1080;
const EXPORT_DIMENSIONS_HEIGHT = 1350;

import { toPng } from 'html-to-image';
import { imageCache } from '@exports/imageCache';
import hashSum from 'hash-sum';

/**
 * Prepare a cloned element for export by cleaning up styles and removing unwanted elements
 * @param clone The cloned element to prepare
 * @returns Object with prepared clone and style element for cleanup
 */
function prepareElementForExport(clone: HTMLElement): { clone: HTMLElement; styleElement: HTMLStyleElement } {
  // Batch DOM cleanup - remove unwanted elements
  const shareButtons = clone.querySelectorAll('.share-button-wrapper, .share-button, [class*="share"]');
  const iframeContainers = clone.querySelectorAll('.peak-post-embed-container');

  // Remove share buttons
  shareButtons.forEach(btn => btn.remove());

  // Replace iframes with trophy emoji for peak performer card exports
  iframeContainers.forEach((container) => {
    const trophyDiv = document.createElement('div');
    trophyDiv.style.cssText = 'display: flex; align-items: center; justify-content: center; min-height: 200px; font-size: 3.5rem;';
    trophyDiv.textContent = '🏆';
    container.replaceWith(trophyDiv);
  });

  // Ensure clone is visible and properly formatted
  clone.style.opacity = '1';
  clone.style.transform = 'scale(1)';
  clone.style.visibility = 'visible';
  clone.style.display = 'block';
  clone.style.borderRadius = '0';
  clone.style.overflow = 'hidden';

  // Remove selection highlighting styles via global CSS injection
  const styleId = 'png-export-styles-' + Math.random().toString(36).slice(2, 11);
  const styleElement = document.createElement('style');
  styleElement.id = styleId;
  styleElement.innerHTML = `
    *::selection {
      background: transparent !important;
      color: inherit !important;
    }
    *::-moz-selection {
      background: transparent !important;
      color: inherit !important;
    }
  `;
  document.head.appendChild(styleElement);

  // Single comprehensive pass through all elements for style normalization
  const allElements = [clone, ...Array.from(clone.querySelectorAll('*'))] as HTMLElement[];
  allElements.forEach((el) => {
    // Disable user selection
    el.style.userSelect = 'none';
    (el.style as any).webkitUserSelect = 'none';
    (el.style as any).msUserSelect = 'none';
    (el.style as any).mozUserSelect = 'none';

    // Remove background-related styles from child elements only (preserve root gradient)
    // Skip the clone element itself to keep the card's gradient background
    if (el !== clone) {
      el.style.setProperty('background', 'transparent', 'important');
      el.style.setProperty('backgroundImage', 'none', 'important');
      el.style.setProperty('backgroundClip', 'unset', 'important');
    }

    // Remove webkit-specific gradient text styles
    (el.style as any).setProperty('-webkit-background-clip', 'unset', 'important');
    (el.style as any).setProperty('-webkit-text-fill-color', 'unset', 'important');
    (el.style as any).setProperty('-moz-background-clip', 'unset', 'important');

    // Set explicit white color
    el.style.setProperty(`color`, `rgba(255, 255, 255, ${TEXT_COLOR_OPACITY})`, 'important');

    // Remove shadows that might create highlighting effect
    el.style.setProperty('textShadow', 'none', 'important');
    el.style.setProperty('boxShadow', 'none', 'important');
  });

  return { clone, styleElement };
}

/**
 * Export a single card as PNG image using html-to-image
 * Checks cache first to avoid re-rendering unchanged cards
 * @param element The card element to export
 * @param backgroundColor Optional background color for the PNG (defaults to dark)
 * @param useCache Optional flag to enable caching (default: true)
 * @param cardId Optional card ID for cache key (uses element ID if available)
 * @returns A promise that resolves to a data URL string
 */
export async function exportCardAsImage(
  element: HTMLElement,
  backgroundColor: string = '#0F0F0F',
  useCache: boolean = true,
  cardId?: string
): Promise<string> {
  try {
    // Generate stable cache key using element content hash
    let id = cardId || element.id;
    if (!id) {
      // Use element's innerHTML hash for stable identification
      const contentHash = hashSum(element.innerHTML);
      id = `card-${contentHash}`;
    }
    const cacheKey = `${id}-${backgroundColor.replace('#', '')}`;

    // Check cache first
    if (useCache) {
      const cachedImage = imageCache.get(cacheKey);
      if (cachedImage) {
        return cachedImage.dataUrl;
      }
    }

    // Clone the element to avoid modifying the original
    const clone = element.cloneNode(true) as HTMLElement;

    // Prepare the clone for export
    const { clone: preparedClone, styleElement } = prepareElementForExport(clone);

    // Get dimensions
    const rect = element.getBoundingClientRect();
    const width = Math.ceil(rect.width || 400);
    const height = Math.ceil(rect.height || 600);

    // Set up clone styling
    preparedClone.style.width = `${width}px`;
    preparedClone.style.height = `${height}px`;
    preparedClone.style.margin = '0';
    preparedClone.style.padding = window.getComputedStyle(element).padding;
    preparedClone.style.boxSizing = 'border-box';
    preparedClone.style.position = 'relative';
    preparedClone.style.display = 'block';

    // Place in DOM at visible location
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '0';
    container.style.top = '0';
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
    container.style.zIndex = EXPORT_ZINDEX.toString();
    container.style.pointerEvents = 'none';
    container.style.opacity = '0';

    container.appendChild(preparedClone);
    document.body.appendChild(container);

    try {
      // Convert to PNG using html-to-image with high resolution
      const dataUrl = await toPng(preparedClone, {
        cacheBust: true,
        pixelRatio: EXPORT_PIXEL_RATIO,
        backgroundColor,
      });

      // Store in cache
      if (useCache) {
        const size = dataUrl.length; // Approximate size in bytes
        imageCache.set(cacheKey, {
          dataUrl,
          timestamp: Date.now(),
          backgroundColor,
          size,
        });
      }

      return dataUrl;
    } finally {
      // Clean up DOM elements
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
      // Clean up style element to prevent memory leak
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to export card as image: ${errorMessage}`);
  }
}

/**
 * Get the optimal dimensions for a card export
 * Returns width and height for LinkedIn-friendly aspect ratio
 */
export function getOptimalExportDimensions(): { width: number; height: number } {
  return {
    width: EXPORT_DIMENSIONS_WIDTH,
    height: EXPORT_DIMENSIONS_HEIGHT,
  };
}

