/**
 * Utility functions for Excel parsing
 * ====================================
 * Common patterns and helpers used across all sheet parsers.
 */
import type { WorkSheet, WorkBook } from 'xlsx';
import { MAX_ROWS, SCAN_LIMITS, EXCEL_DATE_OFFSET, MS_PER_DAY, MIN_PERCENTAGE } from '@utils/excel/constants';

/**
 * Get cell value safely from a worksheet
 * @param sheet - The worksheet to read from
 * @param cellAddress - Cell address in A1 notation (e.g., "A1", "B5")
 * @returns The cell value or undefined if cell doesn't exist
 * @note Returns `any` because Excel cells can contain various types (string, number, Date, etc.)
 */
export function getCellValue(sheet: WorkSheet, cellAddress: string): any {
  return sheet[cellAddress]?.v;
}

/**
 * Parse percentage strings like "25.5%" or "< 1%"
 * @param value - Percentage value (number or string)
 * @returns Percentage as a decimal (0-1 range) for consistent UI handling
 */
export function parsePercentage(value: any): number {
  if (typeof value === 'number') {
    // If it's already a number between 0-100, convert to decimal
    if (value > 1 && value <= 100) {
      return value / 100;
    }
    // If it's already in decimal form (0-1), return as-is
    if (value >= 0 && value <= 1) {
      return value;
    }
    return value;
  }
  
  if (typeof value !== 'string') {
    return 0;
  }

  const lowerValue = value.toLowerCase().trim();

  // Handle "< 1%" or similar by returning a small value
  if (lowerValue.includes('<')) {
    return MIN_PERCENTAGE;
  }

  // Extract all digits and decimal points
  const cleaned = value.replace(/[^\d.]/g, '');
  const parsed = parseFloat(cleaned);

  // Convert percentage to decimal (e.g., "1" → 0.01, "50" → 0.5)
  return isNaN(parsed) ? 0 : parsed / 100;
}

/**
 * Parse date strings in various formats
 * @param value - Date value (can be Date object, string, or Excel serial number)
 * @returns ISO date string (YYYY-MM-DD) or empty string if invalid
 */
export function parseDate(value: any): string {
  if (!value) return '';

  // If it's already a date, format it
  if (value instanceof Date) {
    return value.toISOString().split('T')[0];
  }

  // If it's a string, try to parse it
  if (typeof value === 'string') {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    return value;
  }

  // If it's a number (Excel serial date), convert it
  if (typeof value === 'number') {
    // Excel stores dates as number of days since 1900-01-01
    const excelDate = new Date((value - EXCEL_DATE_OFFSET) * MS_PER_DAY);
    return excelDate.toISOString().split('T')[0];
  }

  return '';
}

/**
 * Parse number values safely
 */
export function parseNumber(value: any): number {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseInt(value.replace(/[^\d]/g, ''), 10);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * Find a sheet by name (case-insensitive)
 * Supports multiple possible sheet names
 * @param workbook - The Excel workbook
 * @param sheetNames - Single sheet name or array of possible names
 * @returns The worksheet if found, null otherwise
 */
export function findSheet(workbook: WorkBook, sheetNames: string | string[]): WorkSheet | null {
  const namesToTry = Array.isArray(sheetNames) ? sheetNames : [sheetNames];
  
  for (const sheetName of namesToTry) {
    const found = workbook.SheetNames.find(
      (name: string) => name.toLowerCase() === sheetName.toLowerCase()
    );
    if (found) {
      return workbook.Sheets[found];
    }
  }
  
  return null;
}

/**
 * Parse a URL from a cell (may contain formula or link)
 */
export function parseURL(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') {
    // Try to extract URL if it's in a common format
    const urlMatch = value.match(/https?:\/\/[^\s"]+/);
    return urlMatch ? urlMatch[0] : value;
  }
  return String(value);
}

/**
 * Check if a cell value contains any of the given keywords (case-insensitive)
 * @param value - The cell value to check
 * @param keywords - Array of keywords to search for
 * @returns True if any keyword is found
 */
export function containsKeyword(value: any, keywords: string[]): boolean {
  if (!value) return false;
  const text = String(value).toLowerCase().trim();
  return keywords.some(keyword => text.includes(keyword));
}

/**
 * Find the first row that contains specific keywords in any of the specified columns
 * Used for finding header rows or section starts
 * @param sheet - The worksheet to search
 * @param columns - Array of column letters to check (e.g., ['A', 'B'])
 * @param keywords - Array of keywords to search for
 * @param maxRow - Maximum row to scan (default from constants)
 * @returns Row number if found, or null
 */
export function findRowWithKeywords(
  sheet: WorkSheet,
  columns: string[],
  keywords: string[],
  maxRow: number = MAX_ROWS.HEADER_SCAN
): number | null {
  for (let row = 1; row <= maxRow; row++) {
    for (const col of columns) {
      const value = getCellValue(sheet, `${col}${row}`);
      if (containsKeyword(value, keywords)) {
        return row;
      }
    }
  }
  return null;
}

/**
 * Iterator that yields rows until a stopping condition is met
 * Stops after encountering consecutive empty rows
 * @param sheet - The worksheet to iterate
 * @param startRow - Starting row number
 * @param columns - Array of column letters to check for emptiness
 * @param maxRow - Maximum row to scan
 * @param maxEmptyRows - Number of consecutive empty rows before stopping
 */
export function* iterateRowsUntilEmpty(
  sheet: WorkSheet,
  startRow: number,
  columns: string[],
  maxRow: number = MAX_ROWS.DATA,
  maxEmptyRows: number = SCAN_LIMITS.CONSECUTIVE_EMPTY_ROWS
): Generator<number> {
  let emptyRowCount = 0;

  for (let row = startRow; row <= maxRow; row++) {
    // Check if all specified columns are empty
    const isEmpty = columns.every(col => !getCellValue(sheet, `${col}${row}`));

    if (isEmpty) {
      emptyRowCount++;
      if (emptyRowCount >= maxEmptyRows) {
        break;
      }
      continue;
    }

    emptyRowCount = 0;
    yield row;
  }
}

/**
 * Get values from multiple columns in a single row
 * @param sheet - The worksheet to read from
 * @param row - Row number
 * @param columns - Array of column letters
 * @returns Object mapping column letters to their values
 */
export function getRowValues(
  sheet: WorkSheet,
  row: number,
  columns: string[]
): Record<string, any> {
  const result: Record<string, any> = {};
  for (const col of columns) {
    result[col] = getCellValue(sheet, `${col}${row}`);
  }
  return result;
}
