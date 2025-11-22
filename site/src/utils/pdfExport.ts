/**
 * Utility to export story cards as a PDF document
 * Uses jsPDF with html2canvas for rendering
 */

let jsPDFLib: any = null;
let html2canvas: any = null;

/**
 * Dynamically load jsPDF and html2canvas
 */
async function loadLibraries() {
  try {
    if (!jsPDFLib) {
      const pdfModule = await import('jspdf');
      jsPDFLib = pdfModule.jsPDF;
    }

    if (!html2canvas) {
      const canvasModule = await import('html2canvas');
      html2canvas = canvasModule.default;
    }
  } catch (err) {
    throw new Error('Failed to load PDF export libraries');
  }
}

/**
 * Export all story cards as a PDF document
 * One page per card, sized to fit the page
 *
 * @param cardElements Array of card DOM elements to export
 * @param filename Optional filename for the PDF (default: linkedin-wrapped.pdf)
 */
export async function exportCardsAsPDF(
  cardElements: HTMLElement[],
  filename: string = 'linkedin-wrapped.pdf'
): Promise<void> {
  if (!cardElements || cardElements.length === 0) {
    throw new Error('No cards provided for PDF export');
  }

  await loadLibraries();

  try {
    if (!jsPDFLib || !html2canvas) {
      throw new Error('Failed to load required libraries');
    }

    // Initialize PDF with A4 dimensions
    const PDF = new jsPDFLib({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = PDF.internal.pageSize.getWidth();
    const pageHeight = PDF.internal.pageSize.getHeight();
    const margin = 10; // 10mm margins

    // Process each card on its own page
    for (let i = 0; i < cardElements.length; i++) {
      const cardElement = cardElements[i];

      try {
        // Clone the element
        const clone = cardElement.cloneNode(true) as HTMLElement;

        // Remove share buttons
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
        const rect = cardElement.getBoundingClientRect();
        const width = Math.ceil(rect.width || 400);
        const height = Math.ceil(rect.height || 600);

        // Set up clone styling
        clone.style.width = `${width}px`;
        clone.style.height = `${height}px`;
        clone.style.margin = '0';
        clone.style.padding = window.getComputedStyle(cardElement).padding;
        clone.style.boxSizing = 'border-box';
        clone.style.position = 'relative';
        clone.style.display = 'block';

        // Place in DOM at visible location
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
          // Capture using html2canvas
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

          // Calculate dimensions to fit on page while maintaining aspect ratio
          const maxWidth = pageWidth - 2 * margin;
          const maxHeight = pageHeight - 2 * margin;

          const canvasWidth = canvas.width;
          const canvasHeight = canvas.height;
          const aspectRatio = canvasHeight / canvasWidth;

          let imageWidth = maxWidth;
          let imageHeight = imageWidth * aspectRatio;

          // If height exceeds page, scale down
          if (imageHeight > maxHeight) {
            imageHeight = maxHeight;
            imageWidth = imageHeight / aspectRatio;
          }

          // Center the image on the page
          const xPosition = (pageWidth - imageWidth) / 2;
          const yPosition = (pageHeight - imageHeight) / 2;

          // Convert canvas to image data
          const imageData = canvas.toDataURL('image/png');

          // Add image to PDF
          PDF.addImage(imageData, 'PNG', xPosition, yPosition, imageWidth, imageHeight);

          // Add new page for next card (except for the last card)
          if (i < cardElements.length - 1) {
            PDF.addPage();
          }
        } finally {
          // Clean up container
          if (document.body.contains(container)) {
            document.body.removeChild(container);
          }
        }
      } catch (err) {
        console.error(`Failed to export card ${i + 1}:`, err);
        // Continue with next card even if one fails
      }
    }

    // Save the PDF
    PDF.save(filename);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to export cards as PDF: ${errorMessage}`);
  }
}

/**
 * Export a single card as PDF (wrapper for single card case)
 */
export async function exportCardAsPDF(
  cardElement: HTMLElement,
  filename: string = 'linkedin-wrapped-card.pdf'
): Promise<void> {
  return exportCardsAsPDF([cardElement], filename);
}
