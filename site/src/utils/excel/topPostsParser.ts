/**
 * Top posts Parser
 * ================
 * Parses the "Top posts" sheet from LinkedIn analytics Excel export.
 *
 * The Top posts sheet contains individual post performance metrics:
 * - Post URL (unique identifier)
 * - Publish date
 * - Engagement count
 * - Impression count
 *
 * Expected Excel Structure:
 * - Sheet name: "Top posts"
 * - Two-column layout: left side (engagements) and right side (impressions)
 * - Left: Columns A=URL, B=Date, C=Engagements
 * - Right: Columns E=URL, F=Date, G=Impressions
 * - Data rows start after header row
 *
 * Performance Notes:
 * - Uses Map for O(1) URL deduplication
 * - Single pass through rows
 * - ~5-50ms processing time depending on post count
 * - Memory efficient: only stores unique URLs
 */
import type { WorkBook } from 'xlsx';
import type { TopPost } from '@types';
import { 
  parseDate, 
  parseNumber, 
  parseURL, 
  findSheet,
  findRowWithKeywords,
  iterateRowsUntilEmpty,
  getRowValues
} from '@utils/excel/utils';
import { SHEET_NAMES, COLUMN_LAYOUTS, KEYWORDS, MAX_ROWS } from '@utils/excel/constants';

interface PostData {
  url: string;
  date: string;
  engagements: number;
  impressions: number;
}

/**
 * Type for specifying which metric type is being processed
 */
type MetricType = 'engagements' | 'impressions';

/**
 * Column configuration for a metric side (left or right)
 */
interface MetricColumns {
  URL: string;
  DATE: string;
  VALUE: string;
}

/**
 * Process a single post entry and update the posts map
 * @param postsMap - Map storing all posts indexed by URL
 * @param columns - Column configuration for this metric type
 * @param rowValues - Values from the current row
 * @param metricType - Type of metric being processed
 */
function processPostEntry(
  postsMap: Map<string, PostData>,
  columns: MetricColumns,
  rowValues: Record<string, any>,
  metricType: MetricType
): void {
  const url = parseURL(rowValues[columns.URL]);
  if (!url) return;

  const date = parseDate(rowValues[columns.DATE]);
  const metric = parseNumber(rowValues[columns.VALUE]);

  // Get or create post entry
  if (!postsMap.has(url)) {
    postsMap.set(url, {
      url,
      date,
      engagements: 0,
      impressions: 0,
    });
  }

  // Update post with new metric (use max value if duplicate)
  const post = postsMap.get(url)!;
  post[metricType] = Math.max(post[metricType], metric);
  
  // Update date if not already set
  if (!post.date && date) {
    post.date = date;
  }
}

/**
 * Parse the Top posts sheet to extract top performing posts
 * @param workbook - Parsed Excel workbook from xlsx library
 * @returns Array of TopPost objects in the order they appear in the spreadsheet (already sorted by engagement)
 */
export function parseTopPosts(workbook: WorkBook): TopPost[] {
  const sheet = findSheet(workbook, SHEET_NAMES.TOP_POSTS);
  if (!sheet) {
    console.warn('Top posts sheet not found');
    return [];
  }

  try {
    // Use Map to deduplicate posts by URL
    const postsMap = new Map<string, PostData>();

    // Find header row
    const headerRow = findRowWithKeywords(sheet, ['A', 'B'], KEYWORDS.HEADERS.URL);
    if (!headerRow) {
      console.warn('Could not find header row in top posts sheet');
      return [];
    }

    const layout = COLUMN_LAYOUTS.TOP_POSTS;
    const allColumns = [
      layout.ENGAGEMENTS.URL, 
      layout.ENGAGEMENTS.DATE, 
      layout.ENGAGEMENTS.VALUE,
      layout.IMPRESSIONS.URL, 
      layout.IMPRESSIONS.DATE, 
      layout.IMPRESSIONS.VALUE
    ];

    // Process data rows using iterator
    for (const row of iterateRowsUntilEmpty(sheet, headerRow + 1, allColumns, MAX_ROWS.DATA)) {
      const values = getRowValues(sheet, row, allColumns);

      // Process left side (Engagements)
      processPostEntry(postsMap, layout.ENGAGEMENTS, values, 'engagements');

      // Process right side (Impressions)
      processPostEntry(postsMap, layout.IMPRESSIONS, values, 'impressions');
    }

    // Convert map to array with ranks
    return Array.from(postsMap.values()).map((post, index) => ({
      rank: index + 1,
      url: post.url,
      publish_date: post.date,
      engagements: post.engagements,
      impressions: post.impressions,
    }));
  } catch (error) {
    console.error('Error parsing Top posts sheet:', error);
    return [];
  }
}
