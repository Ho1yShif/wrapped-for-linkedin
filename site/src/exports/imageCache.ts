/**
 * Image cache service for storing exported card images
 * Reduces re-rendering time for cards that haven't changed
 * Uses LRU eviction strategy with memory limits
 */

// Cache configuration constants
const DEFAULT_IMAGE_CACHE_SIZE_MB = 15;
const MAX_CACHED_IMAGES = 8;

export interface CachedImage {
  dataUrl: string;
  timestamp: number;
  backgroundColor: string;
  size: number; // Approximate size in bytes
}

export interface CacheStats {
  entries: number;
  totalSize: number;
  maxSize: number;
  hitRate: number;
  hitCount: number;
  missCount: number;
}

/**
 * ImageCache: LRU cache for exported card images
 * Stores data URLs of rendered cards to avoid re-rendering
 * Automatically evicts old entries when size/count limits exceeded
 */
class ImageCache {
  private cache: Map<string, CachedImage> = new Map();
  private accessOrder: string[] = []; // Track access order for LRU
  private maxSize: number = DEFAULT_IMAGE_CACHE_SIZE_MB * 1024 * 1024;
  private maxEntries: number = MAX_CACHED_IMAGES;
  private currentSize: number = 0;
  private hitCount: number = 0;
  private missCount: number = 0;

  /**
   * Get an image from cache
   * Returns null if not found or expired
   * @param key Cache key
   * @returns Cached image or null
   */
  public get(key: string): CachedImage | null {
    const image = this.cache.get(key);

    if (!image) {
      this.missCount++;
      return null;
    }

    // Update access order for LRU
    this.updateAccessOrder(key);
    this.hitCount++;

    return image;
  }

  /**
   * Set an image in cache
   * May evict old entries if size/count limits exceeded
   * @param key Cache key
   * @param image Image data to cache
   */
  public set(key: string, image: CachedImage): void {
    // If key already exists, remove old size
    if (this.cache.has(key)) {
      const oldImage = this.cache.get(key);
      if (oldImage) {
        this.currentSize -= oldImage.size;
      }
    }

    // Add new image
    this.cache.set(key, image);
    this.currentSize += image.size;
    this.updateAccessOrder(key);

    // Evict if needed
    this.evictIfNeeded();
  }

  /**
   * Invalidate a specific cache entry
   * @param key Cache key to invalidate
   */
  public invalidate(key: string): void {
    const image = this.cache.get(key);
    if (image) {
      this.cache.delete(key);
      this.currentSize -= image.size;
      this.accessOrder = this.accessOrder.filter(k => k !== key);
    }
  }

  /**
   * Clear all cache entries
   */
  public clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.currentSize = 0;
    this.hitCount = 0;
    this.missCount = 0;
  }

  /**
   * Get cache statistics
   * @returns Cache statistics object
   */
  public getStats(): CacheStats {
    const total = this.hitCount + this.missCount;
    const hitRate = total === 0 ? 0 : (this.hitCount / total) * 100;

    return {
      entries: this.cache.size,
      totalSize: this.currentSize,
      maxSize: this.maxSize,
      hitRate: Math.round(hitRate * 100) / 100,
      hitCount: this.hitCount,
      missCount: this.missCount,
    };
  }

  /**
   * Update access order for LRU tracking
   * Moves key to end of order (most recent)
   */
  private updateAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);
  }

  /**
   * Evict entries if size or count limits exceeded
   * Uses LRU strategy (removes least recently used first)
   */
  private evictIfNeeded(): void {
    let evictionCount = 0;

    // Check size limit
    while (this.currentSize > this.maxSize && this.cache.size > 0) {
      this.evictLRU();
      evictionCount++;
    }

    // Check entry count limit
    while (this.cache.size > this.maxEntries) {
      this.evictLRU();
      evictionCount++;
    }

    if (evictionCount > 0) {
      console.log(`[CACHE] Evicted ${evictionCount} entries. Current: ${this.cache.size} entries, ${(this.currentSize / 1024 / 1024).toFixed(2)}MB`);
    }
  }

  /**
   * Evict the least recently used entry
   */
  private evictLRU(): void {
    const oldestKey = this.accessOrder.shift();
    if (oldestKey) {
      const image = this.cache.get(oldestKey);
      if (image) {
        this.currentSize -= image.size;
        console.log(`[CACHE] Evicted: ${oldestKey} (${(image.size / 1024).toFixed(2)}KB)`);
      }
      this.cache.delete(oldestKey);
    }
  }
}

// Singleton instance
export const imageCache = new ImageCache();
