/**
 * Utility to export HTML card elements as PNG images
 * Creates a visible screenshot and converts to canvas
 * Removes share buttons before export
 */

/**
 * Load html2canvas library dynamically
 */
async function loadHtml2Canvas() {
  try {
    const module = await import('html2canvas');
    return module.default;
  } catch (err) {
    throw new Error('html2canvas library is required for PNG export');
  }
}

/**
 * Remove highlighting/background effects on text and elements
 * Strips all ::selection, gradients, and highlight effects from CSS
 */
function removeHighlightingEffects(element: HTMLElement): void {
  // Create a global style override that targets all elements without IDs
  const styleId = 'export-no-selection-' + Math.random().toString(36).substr(2, 9);

  // Create new style with aggressive overrides for selection and highlighting
  const style = document.createElement('style');
  style.id = styleId;
  style.innerHTML = `
    /* Global override for all selection highlighting */
    *::selection {
      background: transparent !important;
      color: inherit !important;
    }

    *::-moz-selection {
      background: transparent !important;
      color: inherit !important;
    }

    /* Override pseudo-element selection */
    *::before::selection,
    *::after::selection {
      background: transparent !important;
      color: inherit !important;
    }

    *::-moz-selection::before,
    *::-moz-selection::after {
      background: transparent !important;
      color: inherit !important;
    }
  `;

  document.head.appendChild(style);

  // Aggressive inline style overrides - directly modify element and all children
  const allElements = [element, ...Array.from(element.querySelectorAll('*'))] as HTMLElement[];

  allElements.forEach(el => {
    // Disable user selection completely
    el.style.userSelect = 'none !important' as any;
    (el.style as any).webkitUserSelect = 'none !important';
    (el.style as any).msUserSelect = 'none !important';
    (el.style as any).mozUserSelect = 'none !important';

    // Remove any highlight-related inline styles
    el.style.backgroundColor = '';
    el.style.color = '';

    // Force remove highlight color if set
    if (el.style.cssText.includes('highlight')) {
      el.style.cssText = el.style.cssText.replace(/highlight[^;]*;?/gi, '');
    }
  });
}

/**
 * Export a single card as PNG image
 * @param element The card element to export
 * @returns A blob containing the PNG image
 */
export async function exportCardAsImage(element: HTMLElement): Promise<Blob> {
  try {
    const html2canvas = await loadHtml2Canvas();

    if (!html2canvas) {
      throw new Error('Failed to load html2canvas');
    }

    // Clone the element to prepare it for export
    const clone = element.cloneNode(true) as HTMLElement;

    // Remove share buttons and any interactive elements
    const shareButtons = clone.querySelectorAll('.share-button-wrapper, .share-button, [class*="share"]');
    shareButtons.forEach(btn => btn.remove());

    // Remove iframes (they won't render in canvas anyway) and ensure fallback content shows
    const iframes = clone.querySelectorAll('iframe');
    iframes.forEach((iframe) => {
      (iframe as HTMLElement).style.display = 'none';
    });

    // Ensure fallback elements are visible for peak performer cards
    const fallbacks = clone.querySelectorAll('.peak-post-fallback');
    fallbacks.forEach((fallback) => {
      (fallback as HTMLElement).style.display = 'flex';
    });

    // Ensure clone is visible (in case original element was hidden)
    clone.style.opacity = '1';
    clone.style.transform = 'scale(1)';
    clone.style.visibility = 'visible';
    clone.style.display = 'block';

    // Remove highlighting effects (text selection, highlights, etc.)
    removeHighlightingEffects(clone);

    // Remove border-radius ONLY on the outer card container to prevent black background
    // This removes the rounded corners that would show black behind the card
    clone.style.borderRadius = '0 !important';
    clone.style.overflow = 'hidden !important';

    // Get all elements for background and highlighting fixes
    const allElements = clone.querySelectorAll('*');

    // Fix all text-related elements - remove gradients and highlighting
    // Target all elements with potential gradient or highlight text
    const textElements = clone.querySelectorAll('[style*="background"], [style*="gradient"], [style*="fill-color"], .metric-value, .card-title, .engagement-value, .stat-value, [class*="value"], [class*="title"], [class*="metric"]');
    textElements.forEach(el => {
      const element = el as HTMLElement;

      // Remove all background-related styles that might cause highlighting
      element.style.setProperty('background', 'transparent', 'important');
      element.style.setProperty('backgroundImage', 'none', 'important');
      element.style.setProperty('backgroundClip', 'unset', 'important');

      // Remove webkit-specific gradient text styles
      (element.style as any).setProperty('-webkit-background-clip', 'unset', 'important');
      (element.style as any).setProperty('-webkit-text-fill-color', 'unset', 'important');
      (element.style as any).setProperty('-moz-background-clip', 'unset', 'important');

      // Set explicit white color to override any text color
      element.style.setProperty('color', 'rgba(255, 255, 255, 0.95)', 'important');

      // Remove box-shadow and text-shadow that might create highlighting effect
      element.style.setProperty('textShadow', 'none', 'important');
      element.style.setProperty('boxShadow', 'none', 'important');
    });

    // Extra aggressive pass: target ALL elements and remove highlighting-related properties
    allElements.forEach(el => {
      const htmlEl = el as HTMLElement;

      // Remove any background that isn't transparent or parent-related
      if (htmlEl.style.background && !htmlEl.style.background.includes('transparent') && !htmlEl.style.background.includes('none')) {
        htmlEl.style.background = 'transparent !important';
      }

      // Remove highlight-like colors (common highlight colors in HSL/RGB)
      const computedStyle = window.getComputedStyle(htmlEl);
      const bgColor = computedStyle.backgroundColor;

      // If background is a highlight-like color, remove it
      if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
        const isLightColor = bgColor.includes('rgb(0, 102, 204)') ||
                           bgColor.includes('rgb(10, 102, 194)') ||
                           bgColor.includes('rgb(0, 120, 215)');
        if (isLightColor) {
          htmlEl.style.backgroundColor = 'transparent !important';
        }
      }
    });

    // Get dimensions
    const rect = element.getBoundingClientRect();
    const width = Math.ceil(rect.width || 400);
    const height = Math.ceil(rect.height || 600);

    // Set up clone styling
    clone.style.width = `${width}px`;
    clone.style.height = `${height}px`;
    clone.style.margin = '0';
    clone.style.padding = window.getComputedStyle(element).padding;
    clone.style.boxSizing = 'border-box';
    clone.style.position = 'relative';
    clone.style.display = 'block';

    // Place in DOM at visible location (not off-screen, as that can cause rendering issues)
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '0';
    container.style.top = '0';
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
    container.style.zIndex = '999999';
    container.style.pointerEvents = 'none';
    container.style.opacity = '0';

    container.appendChild(clone);
    document.body.appendChild(container);

    try {
      // Capture using html2canvas with visibility
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0F0F0F',
        logging: false,
        width: width,
        height: height,
        windowHeight: height,
        windowWidth: width,
      });

      // Convert canvas to blob
      return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob: Blob | null) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create image blob'));
            }
          },
          'image/png',
          1
        );
      });
    } finally {
      // Clean up
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to export card as image: ${errorMessage}`);
  }
}/**
 * Get the optimal dimensions for a card export
 * Returns width and height for LinkedIn-friendly aspect ratio
 */
export function getOptimalExportDimensions(): { width: number; height: number } {
  return {
    width: 1080,
    height: 1350,
  };
}
