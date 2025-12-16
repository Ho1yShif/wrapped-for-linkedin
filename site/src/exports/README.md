# Export system

High-performance export system for converting story cards to PNG and PDF formats with caching and parallel processing.

## Architecture overview

```
┌─────────────────┐
│  imageCache.ts  │  LRU cache for rendered images
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ imageExport.ts  │  Core: Single card → PNG using html-to-image
└────────┬────────┘
         │
         ▼
┌──────────────────────┐
│ batchImageExporter.ts│  Orchestrates parallel batch rendering
└────────┬─────────────┘
         │
         ▼
┌─────────────────┐
│  pdfExport.ts   │  Assembles images into multi-page PDF
└─────────────────┘
```

## File responsibilities

### 1. `imageCache.ts` - Image caching layer
**Purpose:** Reduce re-rendering time by caching previously exported images

**Key Features:**
- LRU (Least Recently Used) eviction strategy
- Memory-aware cache (15MB default, max 8 images)
- Content-based cache keys (hash of element content + background color)
- Cache hit/miss tracking and statistics

**API:**
- `imageCache.get(key)` - Retrieve cached image
- `imageCache.set(key, image)` - Store rendered image
- `imageCache.invalidate(key)` - Remove specific entry
- `imageCache.clear()` - Clear all cached images
- `imageCache.getStats()` - Get cache performance metrics

---

### 2. `imageExport.ts` - Core image rendering
**Purpose:** Convert a single HTML card element to PNG image

**Key Features:**
- Uses `html-to-image` library (toPng) for high-quality rendering
- Clones elements to avoid DOM mutations
- Removes share buttons and replaces iframes before export
- Normalizes styles (removes selection highlights, text gradients)
- 1.5x pixel ratio for sharp exports (1080×1350px target)
- Automatic cache integration

**Process:**
1. Check cache for existing render
2. Clone the card element
3. Clean up styles (remove share buttons, normalize colors)
4. Temporarily append to DOM for rendering
5. Convert to PNG data URL via html-to-image
6. Cache the result
7. Clean up temporary DOM elements

**API:**
- `exportCardAsImage(element, backgroundColor?, useCache?, cardId?)` → `Promise<string>`
- `getOptimalExportDimensions()` → `{ width: 1080, height: 1350 }`

---

### 3. `batchImageExporter.ts` - Parallel processing
**Purpose:** Export multiple cards concurrently for 6-8x speed improvement

**Key Features:**
- Parallel batch processing (default: 8 concurrent renders)
- Progress callbacks for UI feedback
- Error handling per card (continues on individual failures)
- Maintains original card order in results

**Process:**
1. Split cards into batches (size = concurrency level)
2. Process each batch in parallel using `exportCardAsImage`
3. Collect results in original order
4. Return array of image data URLs

**API:**
- `exportCardsAsImagesBatch(cardElements, options)` → `Promise<string[]>`

**Options:**
```typescript
{
  concurrency?: number;          // Parallel renders (default: 8)
  onProgress?: (n, total) => void; // Progress callback
  cacheBust?: boolean;          // Force re-render
  backgroundColor?: string;     // PNG background color
}
```

---

### 4. `pdfExport.ts` - PDF assembly
**Purpose:** Create multi-page PDF documents from card images

**Key Features:**
- One card = one A4 page (portrait)
- Leverages batch image exporter for parallel rendering
- PDF-specific layout optimizations (font size adjustments)
- Automatic image centering and aspect ratio preservation
- Compression disabled during assembly for speed (applied on save)
- Minimal 1mm page margins for maximum card size
- Sharp corners for full-page utilization

**Process:**
1. Apply PDF-specific style optimizations (e.g., reduce font sizes)
2. Batch render all cards to PNG using `exportCardsAsImagesBatch`
3. Initialize jsPDF (A4 portrait, no compression during assembly)
4. Calculate image placement (centered, fit to page)
5. Add each image as a new page
6. Save PDF with compression

**API:**
- `exportCardsAsPDFBatch(cardElements, filename?)` → `Promise<void>`

---

## Usage examples

### Export single card as PNG
```typescript
import { exportCardAsImage } from '@exports/imageExport';

const cardElement = document.getElementById('my-card');
const dataUrl = await exportCardAsImage(cardElement, '#FFFFFF');
// Use dataUrl to download or display
```

### Export multiple cards as PNG (parallel)
```typescript
import { exportCardsAsImagesBatch } from '@exports/batchImageExporter';

const cards = document.querySelectorAll('.story-card');
const images = await exportCardsAsImagesBatch(Array.from(cards), {
  concurrency: 8,
  backgroundColor: '#0F0F0F',
  onProgress: (current, total) => {
    console.log(`Rendering ${current}/${total}`);
  }
});
// images is array of data URLs in original order
```

### Export cards as PDF
```typescript
import { exportCardsAsPDFBatch } from '@exports/pdfExport';

const cards = document.querySelectorAll('.story-card');
await exportCardsAsPDFBatch(
  Array.from(cards),
  'my-wrapped-2024.pdf'
);
// PDF automatically downloads
```

---

## Performance optimizations

1. **Parallel Processing**: Batch exporter processes 8 cards concurrently (6-8x faster)
2. **Image Caching**: Avoids re-rendering unchanged cards (instant retrieval)
3. **Content Hashing**: Stable cache keys based on element content, not just ID
4. **Memory Management**: LRU eviction prevents excessive memory usage
5. **DOM Cloning**: Avoids side effects on live UI elements
6. **Streaming Assembly**: PDF pages added as images complete
7. **Lazy Loading**: jsPDF loaded dynamically only when needed

---

## Configuration constants

### Image export
- `EXPORT_PIXEL_RATIO`: 1.5 (higher = sharper but larger files)
- `EXPORT_DIMENSIONS`: 1080×1350px (LinkedIn-friendly)
- `TEXT_COLOR_OPACITY`: 0.95

### Batch processing
- `DEFAULT_CONCURRENCY`: 8 parallel renders

### Caching
- `DEFAULT_IMAGE_CACHE_SIZE_MB`: 15MB total cache size
- `MAX_CACHED_IMAGES`: 8 images maximum

### PDF export
- `PDF_PAGE_MARGIN_MM`: 2mm (1mm each side)
- Format: A4 portrait
- Compression: Disabled during assembly, enabled on save
- Border radius: 0 (sharp corners for full-page utilization)

---

## Error handling

All export functions throw descriptive errors:
- Missing/empty card elements
- html-to-image rendering failures
- jsPDF library loading failures
- Individual card render failures in batch (reported with counts)

Errors include context about which operation failed and why.

---

## Technical dependencies

- **html-to-image**: DOM → PNG conversion (`toPng`)
- **jsPDF**: PNG images → multi-page PDF
- **hash-sum**: Content hashing for cache keys

---

## Design philosophy

1. **Separation of Concerns**: Each file has a single clear responsibility
2. **Composition**: Higher-level exporters build on lower-level primitives
3. **Performance First**: Caching and parallelization throughout
4. **Non-Destructive**: Cloning prevents UI mutations during export
5. **User Experience**: Progress callbacks and predictable behavior

