/**
 * Excel Parsing Module
 * ====================
 * Main entry point for parsing LinkedIn analytics Excel files.
 * 
 * Usage:
 * ```typescript
 * import { processExcelFile } from '@utils/excel';
 * 
 * const data = await processExcelFile(file);
 * console.log('Parsed data:', data);
 * ```
 */

// Main processor
export { processExcelFile } from '@utils/excel/excelProcessor';

// Types
export type {
  ParsedExcelData,
  DiscoveryData,
  DemographicInsights,
  DemographicItem,
  EngagementByDay,
} from '@utils/excel/types';

// Individual parsers (for advanced usage)
export { parseDiscovery } from '@utils/excel/discoveryParser';
export { parseTopPosts } from '@utils/excel/topPostsParser';
export { parseDemographics } from '@utils/excel/demographicsParser';
export { parseEngagement, calculateTotalEngagements, calculateMedianDailyImpressions } from '@utils/excel/engagementParser';
export { parseFollowers } from '@utils/excel/followersParser';

// Utility functions (for advanced usage)
export {
  getCellValue,
  parsePercentage,
  parseDate,
  parseNumber,
  parseURL,
  findSheet,
  containsKeyword,
  findRowWithKeywords,
  iterateRowsUntilEmpty,
  getRowValues,
} from '@utils/excel/utils';

// Constants (for reference or customization)
export { MAX_ROWS, SCAN_LIMITS, SHEET_NAMES, COLUMN_LAYOUTS, KEYWORDS } from '@utils/excel/constants';

