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
 * @returns Array of LinkedInTopPost objects in the order they appear in the spreadsheet (already sorted by engagement)
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

    // Helper function to process post data from cells
    const processPostData = (
      url: string | undefined,
      dateStr: any,
      metricValue: any,
      metricType: 'engagements' | 'impressions'
    ): void => {
      if (!url || !String(url).includes('linkedin.com')) return;

      const cleanUrl = parseURL(url);
      if (!cleanUrl || !cleanUrl.includes('linkedin.com')) return;

      const date = parseDate(dateStr);
      const metric = parseNumber(metricValue);

      if (!postsMap.has(cleanUrl)) {
        postsMap.set(cleanUrl, {
          url: cleanUrl,
          date,
          engagements: 0,
          impressions: 0,
        });
      }

      const post = postsMap.get(cleanUrl)!;
      post[metricType] = Math.max(post[metricType] || 0, metric);
      if (!post.date) {
        post.date = date;
      }
    };

    // Parse data rows
    // LinkedIn exports have TWO-COLUMN layout:
    // Left side (Engagements): Columns A=URL, B=Date, C=Engagements
    // Right side (Impressions): Columns E=URL, F=Date, G=Impressions (Column D is blank separator)
    // We need to merge both sides by URL
    let emptyRowCount = 0;
    const MAX_EMPTY_ROWS = 5; // Stop after 5 consecutive empty rows

    for (let row = headerRow + 1; row <= 1000; row++) {
      const cellA = getCellValue(sheet, `A${row}`);
      const cellB = getCellValue(sheet, `B${row}`);
      const cellC = getCellValue(sheet, `C${row}`);
      const cellE = getCellValue(sheet, `E${row}`);
      const cellF = getCellValue(sheet, `F${row}`);
      const cellG = getCellValue(sheet, `G${row}`);

      // Check if row is completely empty
      if (!cellA && !cellB && !cellC && !cellE && !cellF && !cellG) {
        emptyRowCount++;
        if (emptyRowCount >= MAX_EMPTY_ROWS) {
          break; // Exit loop after multiple empty rows
        }
        continue;
      }

      emptyRowCount = 0; // Reset counter if row has data

      // Process LEFT SIDE (Engagements)
      processPostData(cellA, cellB, cellC, 'engagements');

      // Process RIGHT SIDE (Impressions)
      processPostData(cellE, cellF, cellG, 'impressions');
    }

    // Convert map to array, preserving the order from the spreadsheet
    // The spreadsheet is already sorted by engagement, so we maintain that order
    // Single pass: create output array while assigning ranks
    const posts = Array.from(postsMap.values())
      .map((post, index) => ({
        rank: index + 1,
        url: post.url,
        publish_date: post.date,
        engagements: post.engagements || 0,
        impressions: post.impressions || 0,
      } as LinkedInTopPost));

    return posts;
  } catch (error) {
    console.error('Error parsing TOP POSTS sheet:', error);
    return [];
  }
}
