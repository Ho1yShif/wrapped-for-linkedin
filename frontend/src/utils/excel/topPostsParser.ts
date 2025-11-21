/**
 * Top Posts Parser
 * ================
 * Parses the "TOP POSTS" sheet from LinkedIn analytics Excel export.
 *
 * The Top Posts sheet contains individual post performance metrics:
 * - Post URL (unique identifier)
 * - Publish date
 * - Engagement count
 * - Impression count
 *
 * Expected Excel Structure:
 * - Sheet name: "TOP POSTS"
 * - Contains post data with URL, Date, Engagements, Impressions
 * - May have two-column layout (left side for engagements, right side for impressions)
 * - Data rows start after header row
 *
 * Performance Notes:
 * - Uses Map for O(1) URL deduplication
 * - Scans up to 1000 rows (typical exports have 50-200 posts)
 * - ~5-50ms processing time depending on post count
 * - Memory efficient: only stores unique URLs
 */
import type { WorkBook } from 'xlsx';
import type { LinkedInTopPost } from './types';
import { getCellValue, parseDate, parseNumber, parseURL, findSheet } from './utils';

interface PostData {
  url: string;
  date: string;
  engagements?: number;
  impressions?: number;
}

/**
 * Parse the Top Posts sheet to extract top performing posts
 * @param workbook - Parsed Excel workbook from xlsx library
 * @returns Array of LinkedInTopPost objects sorted by engagement (highest first)
 */
export function parseTopPosts(workbook: WorkBook): LinkedInTopPost[] {
  const sheet = findSheet(workbook, 'TOP POSTS');
  if (!sheet) {
    console.warn('TOP POSTS sheet not found');
    return [];
  }

  try {
    // Use Map to deduplicate posts by URL (in case same post appears multiple times)
    const postsMap = new Map<string, PostData>();

    // Find header row (typically row 1, but scan first 10 rows to be safe)
    let headerRow = 1;
    for (let row = 1; row <= 10; row++) {
      const cellA = getCellValue(sheet, `A${row}`);
      const cellB = getCellValue(sheet, `B${row}`);
      if (
        (cellA && String(cellA).toLowerCase().includes('url')) ||
        (cellB && String(cellB).toLowerCase().includes('url'))
      ) {
        headerRow = row;
        break;
      }
    }

    // Parse data rows
    // LinkedIn exports have TWO-COLUMN layout:
    // Left side (Engagements): Columns A=URL, B=Date, C=Engagements
    // Right side (Impressions): Columns D=URL, E=Date, F=Impressions
    // We need to merge both sides by URL
    for (let row = headerRow + 1; row <= 1000; row++) {
      const cellA = getCellValue(sheet, `A${row}`);
      const cellB = getCellValue(sheet, `B${row}`);
      const cellC = getCellValue(sheet, `C${row}`);
      const cellD = getCellValue(sheet, `D${row}`);
      const cellE = getCellValue(sheet, `E${row}`);
      const cellF = getCellValue(sheet, `F${row}`);

      // Stop if we hit a completely empty row on the left side (end of data)
      if (!cellA && !cellB && !cellC && !cellD && !cellE && !cellF) {
        break;
      }

      // Process LEFT SIDE (Engagements)
      if (cellA && String(cellA).includes('linkedin.com')) {
        const url = parseURL(cellA);
        const dateStr = cellB;
        const engagementVal = cellC;

        if (url && url.includes('linkedin.com')) {
          const date = parseDate(dateStr);
          const engagements = parseNumber(engagementVal);

          const key = url;
          if (!postsMap.has(key)) {
            postsMap.set(key, {
              url,
              date,
              engagements: 0,
              impressions: 0,
            });
          }

          const post = postsMap.get(key)!;
          post.engagements = Math.max(post.engagements || 0, engagements);
          // Update date if not set
          if (!post.date) {
            post.date = date;
          }
        }
      }

      // Process RIGHT SIDE (Impressions)
      if (cellD && String(cellD).includes('linkedin.com')) {
        const url = parseURL(cellD);
        const dateStr = cellE;
        const impressionVal = cellF;

        if (url && url.includes('linkedin.com')) {
          const date = parseDate(dateStr);
          const impressions = parseNumber(impressionVal);

          const key = url;
          if (!postsMap.has(key)) {
            postsMap.set(key, {
              url,
              date,
              engagements: 0,
              impressions: 0,
            });
          }

          const post = postsMap.get(key)!;
          post.impressions = Math.max(post.impressions || 0, impressions);
          // Update date if not set
          if (!post.date) {
            post.date = date;
          }
        }
      }
    }

    // Convert map to sorted array, ranked by engagement (highest first)
    const sortedPosts = Array.from(postsMap.values())
      .sort((a, b) => (b.engagements || 0) - (a.engagements || 0))
      .map((post, index) => ({
        rank: index + 1,
        url: post.url,
        publish_date: post.date,
        engagements: post.engagements || 0,
        impressions: post.impressions || 0,
      }));

    return sortedPosts;
  } catch (error) {
    console.error('Error parsing TOP POSTS sheet:', error);
    return [];
  }
}
