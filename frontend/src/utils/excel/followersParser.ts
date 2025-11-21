/**
 * Followers Parser
 * ================
 * Parses the "FOLLOWERS" sheet from LinkedIn analytics Excel export.
 *
 * The Followers sheet contains:
 * - Total followers at end of period
 * - Daily new followers breakdown
 *
 * Expected Excel Structure:
 * - Sheet name: "FOLLOWERS"
 * - Contains "Total followers on [DATE]" label with count
 * - Below that: Date column and New followers column
 *
 * Performance Notes:
 * - Single pass through up to 500 rows
 * - Minimal memory footprint
 * - ~5-10ms processing time typical
 */
import type { WorkBook } from 'xlsx';
import { getCellValue, parseNumber, findSheet } from './utils';

/**
 * Parse the Followers sheet to extract total followers and new followers data
 * @param workbook - Parsed Excel workbook from xlsx library
 * @returns Object with total_followers count and new_followers sum, or undefined if sheet not found
 */
export function parseFollowers(workbook: WorkBook): { total_followers: number; new_followers: number } | undefined {
  const sheet = findSheet(workbook, 'FOLLOWERS');
  if (!sheet) {
    console.warn('FOLLOWERS sheet not found');
    return undefined;
  }

  try {
    let total_followers = 0;
    let new_followers = 0;

    // Look for "Total followers on [DATE]" label in first 10 rows
    for (let row = 1; row <= 10; row++) {
      const cellA = getCellValue(sheet, `A${row}`);
      if (cellA && String(cellA).toLowerCase().includes('total followers')) {
        const cellB = getCellValue(sheet, `B${row}`);
        if (cellB) {
          total_followers = parseNumber(cellB);
        }
        break;
      }
    }

    // Find header row for daily followers data (typically contains "Date" and "New followers")
    let headerRow = 1;
    for (let row = 1; row <= 20; row++) {
      const cellA = getCellValue(sheet, `A${row}`);
      const cellB = getCellValue(sheet, `B${row}`);
      if (
        (cellA && String(cellA).toLowerCase().includes('date')) ||
        (cellB && String(cellB).toLowerCase().includes('follower'))
      ) {
        headerRow = row;
        break;
      }
    }

    // Parse daily new followers and sum them
    for (let row = headerRow + 1; row <= 500; row++) {
      const cellA = getCellValue(sheet, `A${row}`);
      const cellB = getCellValue(sheet, `B${row}`);

      // Stop if we hit a completely empty row
      if (!cellA && !cellB) {
        break;
      }

      // Typically: A = Date, B = New followers count
      if (cellB && typeof cellB === 'number') {
        const followerCount = parseNumber(cellB);
        new_followers += followerCount;
      }
    }

    return {
      total_followers,
      new_followers,
    };
  } catch (error) {
    console.error('Error parsing FOLLOWERS sheet:', error);
    return undefined;
  }
}
