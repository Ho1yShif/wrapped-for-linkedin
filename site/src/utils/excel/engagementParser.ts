/**
 * Engagement Parser
 * =================
 * Parses engagement metrics and time-series data from LinkedIn analytics Excel export.
 *
 * The ENGAGEMENT sheet contains time-series engagement data:
 * - Date (timestamp)
 * - Impressions count
 * - Engagement count (interactions per day)
 *
 * Expected Excel Structure:
 * - Sheet name: "ENGAGEMENT"
 * - Column A: Date (unique values)
 * - Column B: Impressions
 * - Column C: Engagements
 *
 * Performance Notes:
 * - Single pass through rows
 * - ~5-15ms processing time typical
 * - Memory efficient
 *
 * Use Cases:
 * - Trend analysis: see engagement patterns over time
 * - Peak performance: identify best performing days
 * - Consistency tracking: measure posting consistency
 */
import type { WorkBook } from 'xlsx';
import type { EngagementByDay } from '@utils/excel/types';
import { 
  parseDate, 
  parseNumber, 
  findSheet,
  findRowWithKeywords,
  iterateRowsUntilEmpty,
  getRowValues
} from '@utils/excel/utils';
import { SHEET_NAMES, COLUMN_LAYOUTS, KEYWORDS, MAX_ROWS } from '@utils/excel/constants';

/**
 * Parse engagement by day/time data from the ENGAGEMENT sheet
 * @param workbook - Parsed Excel workbook from xlsx library
 * @returns Array of engagement metrics by date, sorted chronologically
 */
export function parseEngagement(workbook: WorkBook): EngagementByDay[] {
  const sheet = findSheet(workbook, SHEET_NAMES.ENGAGEMENT);
  
  if (!sheet) {
    console.warn('ENGAGEMENT sheet not found');
    return [];
  }

  try {
    const layout = COLUMN_LAYOUTS.ENGAGEMENT;
    const columns = [layout.DATE, layout.IMPRESSIONS, layout.ENGAGEMENTS];
    
    const engagementData: EngagementByDay[] = [];

    // Find header row
    const headerRow = findRowWithKeywords(sheet, columns, KEYWORDS.HEADERS.DATE);
    if (!headerRow) {
      console.warn('Could not find header row in ENGAGEMENT sheet');
      return [];
    }

    // Parse data rows using iterator
    for (const row of iterateRowsUntilEmpty(sheet, headerRow + 1, columns, MAX_ROWS.DATA)) {
      const values = getRowValues(sheet, row, columns);
      
      const date = parseDate(values[layout.DATE]);
      if (!date) continue;

      engagementData.push({
        date,
        engagement: parseNumber(values[layout.ENGAGEMENTS]),
        impressions: parseNumber(values[layout.IMPRESSIONS]),
      });
    }

    return engagementData;
  } catch (error) {
    console.error('Error parsing ENGAGEMENT sheet:', error);
    return [];
  }
}

/**
 * Calculate total engagements from engagement by day data
 * @param engagementByDay - Array of engagement metrics by date
 * @returns Total sum of all engagements
 */
export function calculateTotalEngagements(engagementByDay: EngagementByDay[]): number {
  return engagementByDay.reduce((sum, item) => sum + item.engagement, 0);
}

/**
 * Calculate median daily impressions from engagement by day data
 * @param engagementByDay - Array of engagement metrics by date
 * @returns Median of impressions (middle value or average of two middle values for even count)
 */
export function calculateMedianDailyImpressions(engagementByDay: EngagementByDay[]): number {
  if (engagementByDay.length === 0) {
    return 0;
  }

  // Extract impressions from the engagementByDay data, filtering out any undefined or negative values
  const impressions = engagementByDay
    .map(item => item.impressions || 0)
    .filter(val => val >= 0)
    .sort((a, b) => a - b);

  if (impressions.length === 0) {
    return 0;
  }

  const middle = Math.floor(impressions.length / 2);

  // If odd number of values, return the middle value
  if (impressions.length % 2 === 1) {
    return impressions[middle];
  }

  // If even number of values, return average of two middle values
  return (impressions[middle - 1] + impressions[middle]) / 2;
}

