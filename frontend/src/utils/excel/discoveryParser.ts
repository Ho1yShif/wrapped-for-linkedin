/**
 * Discovery Sheet Parser
 * =====================
 * Parses the "DISCOVERY" sheet from LinkedIn analytics Excel export.
 *
 * The Discovery sheet contains overall performance metrics:
 * - Date range of the analytics period
 * - Total impressions across the period
 * - Members reached
 * - Total engagements
 *
 * Expected Excel Structure:
 * - Sheet name: "DISCOVERY"
 * - Contains labeled metrics with values in adjacent cells
 * - Labels typically include: "Overall Performance", "Impressions", "Members Reached", "Engagements"
 *
 * Performance Notes:
 * - Single pass through up to 100 rows
 * - Minimal memory footprint
 * - ~1-5ms processing time typical
 */
import type { WorkBook } from 'xlsx';
import type { DiscoveryData } from './types';
import { getCellValue, parseDate, parseNumber, findSheet } from './utils';

/**
 * Parse the Discovery sheet to extract overall performance metrics
 * @param workbook - Parsed Excel workbook from xlsx library
 * @returns DiscoveryData object with performance metrics, or undefined if sheet not found
 */
export function parseDiscovery(workbook: WorkBook): DiscoveryData | undefined {
  const sheet = findSheet(workbook, 'DISCOVERY');
  if (!sheet) {
    console.warn('DISCOVERY sheet not found');
    return undefined;
  }

  try {
    const discoveryData: DiscoveryData = {
      start_date: '',
      end_date: '',
      total_impressions: 0,
      members_reached: 0,
    };

    // Look for "Overall Performance" section and extract date range
    // Usually structured like: "Overall Performance" with dates below (e.g., "Jan 1 - Dec 31, 2024")
    for (let row = 1; row < 50; row++) {
      const cellA = getCellValue(sheet, `A${row}`);
      if (cellA && String(cellA).toLowerCase().includes('overall performance')) {
        // Extract date range from next rows
        const dateCell = getCellValue(sheet, `A${row + 1}`);
        if (dateCell && String(dateCell).includes('-')) {
          const [startStr, endStr] = String(dateCell).split('-').map((s: string) => s.trim());
          discoveryData.start_date = parseDate(startStr);
          discoveryData.end_date = parseDate(endStr);
        }
        break;
      }
    }

    // Look for impressions count (usually in format: "Impressions" label with numeric value in next cell)
    for (let row = 1; row < 100; row++) {
      const cellA = getCellValue(sheet, `A${row}`);
      if (cellA && String(cellA).toLowerCase().includes('impression')) {
        const cellB = getCellValue(sheet, `B${row}`);
        if (cellB) {
          discoveryData.total_impressions = parseNumber(cellB);
          break;
        }
      }
    }

    // Look for members reached (audience size metric)
    for (let row = 1; row < 100; row++) {
      const cellA = getCellValue(sheet, `A${row}`);
      if (cellA && String(cellA).toLowerCase().includes('member')) {
        const cellB = getCellValue(sheet, `B${row}`);
        if (cellB) {
          discoveryData.members_reached = parseNumber(cellB);
          break;
        }
      }
    }

    // Look for total engagements count
    for (let row = 1; row < 100; row++) {
      const cellA = getCellValue(sheet, `A${row}`);
      if (cellA && String(cellA).toLowerCase().includes('engagement')) {
        const cellB = getCellValue(sheet, `B${row}`);
        if (cellB) {
          discoveryData.total_engagements = parseNumber(cellB);
          break;
        }
      }
    }

    // Look for new followers count (this should be read from FOLLOWERS sheet primarily)
    // But check DISCOVERY sheet first in case it's here
    for (let row = 1; row < 100; row++) {
      const cellA = getCellValue(sheet, `A${row}`);
      if (cellA && String(cellA).toLowerCase().includes('follower')) {
        const cellB = getCellValue(sheet, `B${row}`);
        if (cellB && typeof cellB === 'number') {
          discoveryData.new_followers = parseNumber(cellB);
          break;
        }
      }
    }

    // Calculate average impressions per day if we have both dates
    // This derived metric helps understand impression consistency
    if (discoveryData.start_date && discoveryData.end_date && discoveryData.total_impressions > 0) {
      const startDate = new Date(discoveryData.start_date);
      const endDate = new Date(discoveryData.end_date);
      const daysDiff = Math.max(1, Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      discoveryData.average_impressions_per_day = Math.round(discoveryData.total_impressions / daysDiff);
    }

    return discoveryData;
  } catch (error) {
    console.error('Error parsing DISCOVERY sheet:', error);
    return undefined;
  }
}
