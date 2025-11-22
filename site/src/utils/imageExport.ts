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

    // Fix metric values by overriding only the problematic gradient properties
    const metricValues = clone.querySelectorAll('.metric-value');
    metricValues.forEach(el => {
      const element = el as HTMLElement;
      // Keep the class for other CSS properties, but override the gradient/transparency
      element.style.setProperty('background', 'transparent', 'important');
      (element.style as any).setProperty('-webkit-background-clip', 'unset', 'important');
      (element.style as any).setProperty('-webkit-text-fill-color', 'unset', 'important');
      element.style.setProperty('background-clip', 'unset', 'important');
      element.style.setProperty('color', 'rgba(255, 255, 255, 0.95)', 'important');
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
