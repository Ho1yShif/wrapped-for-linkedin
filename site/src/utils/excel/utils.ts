/**
 * Utility functions for Excel parsing
 */
import type { WorkSheet } from 'xlsx';

/**
 * Get cell value safely from a worksheet
 */
export function getCellValue(sheet: WorkSheet, cellAddress: string): any {
  if (!sheet[cellAddress]) {
    return undefined;
  }
  return sheet[cellAddress].v;
}

/**
 * Parse percentage strings like \"25.5%\" or \"< 1%\"
 * Returns percentage as a decimal (0-1 range) for consistent UI handling
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

  // Handle \"< 1%\" or similar by returning a small value (0.01%)
  if (lowerValue.includes('<')) {
    return 0.01;
  }

  // Extract all digits and decimal points
  const cleaned = value.replace(/[^\d.]/g, '');
  const parsed = parseFloat(cleaned);

  // Convert percentage to decimal (e.g., "1" → 0.01, "50" → 0.5)
  return isNaN(parsed) ? 0 : parsed / 100;
}

/**
 * Parse date strings in various formats
 */
export function parseDate(value: any): string {
  if (!value) return '';

  // If it's already a date, format it
  if (value instanceof Date) {
    return value.toISOString().split('T')[0];
  }

  // If it's a string, try to parse it
  if (typeof value === 'string') {
    // Try to parse as ISO date first
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    return value;
  }

  // If it's a number (Excel serial date), convert it
  if (typeof value === 'number') {
    // Excel stores dates as number of days since 1900-01-01
    const excelDate = new Date((value - 25569) * 86400 * 1000);
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
 */
export function findSheet(workbook: any, sheetName: string): WorkSheet | null {
  const sheets = workbook.SheetNames;
  const found = sheets.find((name: string) => name.toLowerCase() === sheetName.toLowerCase());
  return found ? workbook.Sheets[found] : null;
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
 * Get row range for data in a sheet (skip headers)
 */
export function getDataRange(sheet: WorkSheet): { start: number; end: number } {
  let maxRow = 1;
  for (const key in sheet) {
    if (key[0] !== '!') {
      const rowMatch = key.match(/\d+$/);
      if (rowMatch) {
        const rowNum = parseInt(rowMatch[0], 10);
        if (rowNum > maxRow) maxRow = rowNum;
      }
    }
  }
  return { start: 2, end: maxRow }; // Skip header row (row 1)
}
