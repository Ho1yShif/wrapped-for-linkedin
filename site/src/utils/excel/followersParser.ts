/**
 * Followers Parser
 * ================
 * Parses the "FOLLOWERS" sheet from LinkedIn analytics Excel export.
 *
 * The Followers sheet contains:
 * - Daily new followers breakdown (column B, starting at row 4)
 *
 * Expected Excel Structure:
 * - Sheet name: "FOLLOWERS"
 * - Row 1-3: Headers (e.g., "Total followers on [DATE]")
 * - Row 4+: New followers data in column B
 *
 * Parsing Strategy:
 * - Sum all values in column B from row 4 onwards to get new followers gained during the period
 */
import type { WorkBook } from 'xlsx';
import { 
  getCellValue, 
  parseNumber, 
  findSheet
} from '@utils/excel/utils';
import { SHEET_NAMES, COLUMN_LAYOUTS } from '@utils/excel/constants';

/**
 * Parse the Followers sheet to extract new followers count
 * @param workbook - Parsed Excel workbook from xlsx library
 * @returns Number of new followers gained during the period, or undefined if sheet not found
 */
export function parseFollowers(workbook: WorkBook): number | undefined {
  const sheet = findSheet(workbook, SHEET_NAMES.FOLLOWERS);
  if (!sheet) {
    console.warn('FOLLOWERS sheet not found');
    return undefined;
  }

  try {
    const { NEW_FOLLOWERS: followerCol } = COLUMN_LAYOUTS.FOLLOWERS;
    
    // Sum new followers from column B
    // LinkedIn exports typically have:
    // - Row 1: Total followers label
    // - Row 2: Empty
    // - Row 3: Headers (Date | New followers)
    // - Row 4+: Daily data (typically 365-368 rows for a year)
    const DATA_START_ROW = 4;
    const DATA_END_ROW = DATA_START_ROW + 368; // Read up to 368 rows of data
    
    let new_followers = 0;
    let rowsProcessed = 0;
    
    for (let row = DATA_START_ROW; row <= DATA_END_ROW; row++) {
      const count = getCellValue(sheet, `${followerCol}${row}`);
      
      // Stop if we hit an undefined cell (end of data)
      if (count === undefined || count === null) {
        break;
      }
      
      // Sum all values (including 0s - days with no new followers)
      const parsed = parseNumber(count);
      new_followers += parsed;
      rowsProcessed++;
    }

    return new_followers;
  } catch (error) {
    console.error('Error parsing FOLLOWERS sheet:', error);
    return undefined;
  }
}
