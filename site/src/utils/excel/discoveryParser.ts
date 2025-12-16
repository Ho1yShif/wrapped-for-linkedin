/**
 * Discovery Sheet Parser
 * =====================
 * Parses the "DISCOVERY" sheet from LinkedIn analytics Excel export.
 *
 * The Discovery sheet has a fixed structure with 2 columns (A: Label, B: Value):
 *   Row 1: "Overall Performance" | (empty)
 *   Row 2: "MM/DD/YYYY - MM/DD/YYYY" | (empty)
 *   Row 3: "Impressions" | numeric value
 *   Row 4: "Members reached" | numeric value
 *
 * This parser directly reads cells from known positions for maximum efficiency.
 */
import type { WorkBook } from 'xlsx';
import type { DiscoveryData } from '@utils/excel/types';
import { 
  getCellValue, 
  parseDate, 
  parseNumber, 
  findSheet
} from '@utils/excel/utils';
import { SHEET_NAMES } from '@utils/excel/constants';

/**
 * Parse the Discovery sheet to extract overall performance metrics
 * Sheet has fixed structure with all data in column B:
 *   Row 1, Col B: Date range (format: "MM/DD/YYYY - MM/DD/YYYY")
 *   Row 2, Col B: Impressions (numeric value)
 *   Row 3, Col B: Members reached (numeric value)
 * 
 * @param workbook - Parsed Excel workbook from xlsx library
 * @returns DiscoveryData object with performance metrics, or undefined if sheet not found
 */
export function parseDiscovery(workbook: WorkBook): DiscoveryData | undefined {
  const sheet = findSheet(workbook, SHEET_NAMES.DISCOVERY);
  if (!sheet) {
    console.warn('DISCOVERY sheet not found');
    return undefined;
  }

  try {
    // Read date range from B1 (format: "MM/DD/YYYY - MM/DD/YYYY")
    const dateRangeCell = getCellValue(sheet, 'B1');
    const [startStr, endStr] = String(dateRangeCell || '').split('-').map((s: string) => s.trim());
    
    // Read impressions from B2
    const impressionsValue = getCellValue(sheet, 'B2');
    
    // Read members reached from B3
    const membersValue = getCellValue(sheet, 'B3');

    const start_date = parseDate(startStr);
    const end_date = parseDate(endStr);
    const total_impressions = parseNumber(impressionsValue);

    const discoveryData: DiscoveryData = {
      start_date,
      end_date,
      total_impressions,
      members_reached: parseNumber(membersValue),
    };

    // Calculate average impressions per day if we have valid dates
    if (start_date && end_date && total_impressions > 0) {
      const daysDiff = calculateDateRangeDays(start_date, end_date);
      discoveryData.average_impressions_per_day = Math.round(total_impressions / daysDiff);
    }

    return discoveryData;
  } catch (error) {
    console.error('Error parsing DISCOVERY sheet:', error);
    return undefined;
  }
}

/**
 * Calculate the number of days in a date range (inclusive)
 * @param startDate - ISO date string
 * @param endDate - ISO date string
 * @returns Number of days (minimum 1)
 */
function calculateDateRangeDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, daysDiff);
}
