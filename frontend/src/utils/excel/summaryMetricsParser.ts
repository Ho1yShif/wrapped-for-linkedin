/**
 * Summary Metrics Parser
 * ======================
 * Parses summary metrics and engagement data from LinkedIn analytics Excel export.
 *
 * The Summary Metrics sheet contains time-series engagement data:
 * - Date (timestamp)
 * - Engagement count (interactions per day)
 * - May include engagement breakdown by time of day
 *
 * Expected Excel Structure:
 * - Sheet name could be: "SUMMARY METRICS", "SUMMARY", "METRICS", "ENGAGEMENT", or "ENGAGEMENT BY DAY"
 * - First column typically contains dates
 * - Second or third column contains engagement count
 *
 * Performance Notes:
 * - Single pass through up to 500 rows
 * - Uses Map for deduplication of dates
 * - ~5-15ms processing time typical
 * - Minimal memory footprint
 *
 * Use Cases:
 * - Trend analysis: see engagement patterns over time
 * - Peak performance: identify best performing days/times
 * - Consistency tracking: measure posting consistency
 */
import type { WorkBook } from 'xlsx';
import type { EngagementByDay } from './types';
import { getCellValue, parseDate, parseNumber, findSheet } from './utils';

interface EngagementEntry {
  date: string;
  engagement: number;
  impressions: number;
}

/**
 * Parse engagement by day/time data
 * Searches for summary metrics sheet with multiple possible names
 * @param workbook - Parsed Excel workbook from xlsx library
 * @returns Array of engagement metrics by date, sorted chronologically
 */
export function parseSummaryMetrics(workbook: WorkBook): EngagementByDay[] {
  // Try multiple sheet names since LinkedIn may use different names
  const possibleSheets = ['SUMMARY METRICS', 'SUMMARY', 'METRICS', 'ENGAGEMENT', 'ENGAGEMENT BY DAY'];
  let sheet = null;

  for (const sheetName of possibleSheets) {
    sheet = findSheet(workbook, sheetName);
    if (sheet) {
      console.log(`Found engagement sheet: ${sheetName}`);
      break;
    }
  }

  if (!sheet) {
    console.warn('Summary metrics sheet not found - tried:', possibleSheets);
    return [];
  }

  try {
    // Use Map to deduplicate and store engagement and impression data for each date
    const dateEngagementMap = new Map<string, EngagementEntry>();

    // Find header row (typically in first 10 rows)
    let headerRow = 1;
    for (let row = 1; row <= 10; row++) {
      const cellA = getCellValue(sheet, `A${row}`);
      const cellB = getCellValue(sheet, `B${row}`);
      if (
        (cellA && String(cellA).toLowerCase().includes('date')) ||
        (cellB && String(cellB).toLowerCase().includes('date'))
      ) {
        headerRow = row;
        break;
      }
    }

    // Parse data rows
    // Expected layout: A = Date, B = Impressions, C = Engagements
    for (let row = headerRow + 1; row <= 500; row++) {
      const cellA = getCellValue(sheet, `A${row}`);
      const cellB = getCellValue(sheet, `B${row}`);
      const cellC = getCellValue(sheet, `C${row}`);

      // Stop if we hit completely empty row
      if (!cellA && !cellB && !cellC) {
        break;
      }

      if (!cellA) continue;

      // Parse the date
      const date = parseDate(cellA);
      if (!date) continue;

      // Parse impressions (column B) and engagements (column C)
      const impressions = parseNumber(cellB);
      const engagement = parseNumber(cellC);

      // Store data for this date
      // For now, we'll track one entry per date - use the first non-zero values we encounter
      if (!dateEngagementMap.has(date)) {
        dateEngagementMap.set(date, { date, engagement, impressions });
      }
    }

    // Convert map to sorted array, chronologically ordered
    const sorted = Array.from(dateEngagementMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(entry => ({
        date: entry.date,
        engagement: entry.engagement,
        impressions: entry.impressions,
      }));

    return sorted;
  } catch (error) {
    console.error('Error parsing summary metrics sheet:', error);
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
