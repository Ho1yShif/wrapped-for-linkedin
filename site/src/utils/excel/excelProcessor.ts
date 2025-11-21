/**
 * Excel Processor
 * ===============
 * Main orchestrator for parsing LinkedIn analytics Excel files.
 *
 * This module is the entry point for converting Excel exports into structured data.
 *
 * Workflow:
 * 1. Receive File object from browser
 * 2. Read file as ArrayBuffer
 * 3. Parse using XLSX library
 * 4. Delegate to specific sheet parsers
 * 5. Aggregate and return all parsed data
 *
 * Performance Characteristics:
 * - File reading: ~100-500ms (depends on file size)
 * - Excel parsing: ~50-200ms
 * - Sheet parsing: ~20-100ms (depends on content)
 * - Total: typically <1 second for standard exports
 *
 * Error Handling:
 * - Gracefully handles missing sheets
 * - Validates file format
 * - Returns partial data if some sheets are missing
 *
 * Browser Compatibility:
 * - Modern browsers with FileReader API support
 * - No external network calls
 * - All processing happens in-browser
 *
 * Security:
 * - Files never leave the user's browser
 * - No data transmission to servers
 * - Safe for processing sensitive business data
 */
import * as XLSX from 'xlsx';
import type { ParsedExcelData } from './types';
import { parseDiscovery } from './discoveryParser';
import { parseTopPosts } from './topPostsParser';
import { parseDemographics } from './demographicsParser';
import { parseSummaryMetrics, calculateTotalEngagements, calculateMedianDailyImpressions } from './summaryMetricsParser';
import { parseFollowers } from './followersParser';

/**
 * Process an Excel file and extract all LinkedIn analytics data
 *
 * @param file - The Excel file to process (from file input or drag-drop)
 * @returns Promise resolving to ParsedExcelData with all extracted analytics
 * @throws Error if file is invalid or not a proper Excel format
 *
 * @example
 * const input = document.querySelector('input[type="file"]');
 * input.addEventListener('change', async (e) => {
 *   const file = e.target.files[0];
 *   try {
 *     const data = await processExcelFile(file);
 *     console.log('Parsed posts:', data.top_posts.length);
 *   } catch (error) {
 *     console.error('Failed to process:', error.message);
 *   }
 * });
 */
export async function processExcelFile(file: File): Promise<ParsedExcelData> {
  try {
    // Step 1: Read file as ArrayBuffer
    // FileReader API returns binary data which XLSX can parse
    const arrayBuffer = await file.arrayBuffer();

    // Step 2: Parse workbook using XLSX
    // type: 'array' tells XLSX to expect Uint8Array/ArrayBuffer
    // This reads cell values, not formulas
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    // Validate workbook
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error('Invalid Excel file: no sheets found');
    }

    console.log('Found sheets:', workbook.SheetNames);

    // Step 3: Initialize result object
    const parsedData: ParsedExcelData = {};

    // Step 4: Parse each sheet type (all are optional - some sheets may not exist)

    // Parse discovery data (overall performance metrics)
    const discoveryData = parseDiscovery(workbook);
    if (discoveryData) {
      parsedData.discovery_data = discoveryData;
    }

    // Parse followers data (total and new followers)
    const followersData = parseFollowers(workbook);
    if (followersData && discoveryData) {
      // Merge followers data into discovery data
      discoveryData.new_followers = followersData.new_followers;
    }

    // Parse top posts (individual post metrics)
    const topPosts = parseTopPosts(workbook);
    if (topPosts && topPosts.length > 0) {
      parsedData.top_posts = topPosts;
    }

    // Parse demographics (audience composition)
    const demographics = parseDemographics(workbook);
    if (demographics) {
      parsedData.demographics = demographics;
    }

    // Parse summary metrics (engagement time series with impressions)
    const engagementByDay = parseSummaryMetrics(workbook);
    if (engagementByDay && engagementByDay.length > 0) {
      parsedData.engagement_by_day = engagementByDay;

      // Update discovery data with metrics calculated from engagement data
      // This is more accurate than the discovery sheet values
      if (discoveryData) {
        discoveryData.total_engagements = calculateTotalEngagements(engagementByDay);
        discoveryData.average_impressions_per_day = Math.round(calculateMedianDailyImpressions(engagementByDay));
      }
    }

    return parsedData;
  } catch (error) {
    console.error('Error processing Excel file:', error);
    throw new Error(
      `Failed to process Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
