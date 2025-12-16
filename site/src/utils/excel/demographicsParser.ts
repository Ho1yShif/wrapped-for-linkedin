/**
 * Demographics Parser
 * ===================
 * Parses the "DEMOGRAPHICS" sheet from LinkedIn analytics Excel export.
 *
 * The Demographics sheet contains audience composition breakdown:
 * - Job titles (what people do)
 * - Locations (where people are)
 * - Industries (what industries they work in)
 * - Seniority (career level)
 * - Company size
 * - Top companies
 *
 * Expected Excel Structure:
 * - Sheet name: "DEMOGRAPHICS"
 * - Multiple sections, each with category name and percentage
 * - Structure: Column A=Category, Column B=Item Name, Column C=Percentage
 * - Category repeats for each item in that section
 *
 * Performance Notes:
 * - Single pass through sheet to identify all sections
 * - Minimal memory footprint
 * - ~10-20ms processing time typical
 * - Efficiently handles missing sections
 */
import type { WorkBook, WorkSheet } from 'xlsx';
import type { DemographicInsights, DemographicItem } from '@utils/excel/types';
import { getCellValue, parsePercentage, findSheet } from '@utils/excel/utils';
import { SHEET_NAMES, COLUMN_LAYOUTS, MAX_ROWS } from '@utils/excel/constants';

/**
 * Category name mapping for demographics
 */
const CATEGORY_MAPPINGS: Record<string, RegExp> = {
  job_titles: /^job titles?$/,
  locations: /^locations?$/,
  industries: /^industries?$/,
  seniority: /^seniority$/,
  company_size: /^company size$/,
  companies: /^(specific )?companies?$/,
} as const;

/**
 * Normalize category name to match expected keys
 * @param cellValue - Raw category name from Excel
 * @returns Normalized category key or null if not recognized
 */
function normalizeCategoryName(cellValue: any): string | null {
  if (!cellValue) return null;
  
  const normalized = String(cellValue).toLowerCase().trim();

  for (const [key, pattern] of Object.entries(CATEGORY_MAPPINGS)) {
    if (pattern.test(normalized)) {
      return key;
    }
  }

  return null;
}

/**
 * Check if a value should be skipped as a header
 * @param value - Cell value to check
 * @returns True if this is a header row
 */
function isHeaderValue(value: any): boolean {
  if (!value) return true;
  const str = String(value).toLowerCase().trim();
  return str === 'value' || str === 'percentage';
}

/**
 * Sort demographic items by percentage (descending), then by name (ascending)
 * @param items - Array of demographic items to sort
 * @returns Sorted array
 */
function sortDemographicItems(items: DemographicItem[]): DemographicItem[] {
  return items.sort((a, b) => {
    if (b.percentage !== a.percentage) {
      return b.percentage - a.percentage;
    }
    return a.name.localeCompare(b.name);
  });
}

/**
 * Parse a demographic category section from the sheet
 * @param sheet - Worksheet object from xlsx
 * @param startRow - Starting row of the category
 * @param expectedCategory - The category name we're looking for (e.g., "job_titles")
 * @returns Sorted array of demographic items (highest percentage first)
 */
function parseDemographicCategory(
  sheet: WorkSheet,
  startRow: number,
  expectedCategory: string
): DemographicItem[] {
  const items: DemographicItem[] = [];
  const { CATEGORY: catCol, NAME: nameCol, PERCENTAGE: pctCol } = COLUMN_LAYOUTS.DEMOGRAPHICS;

  // Parse rows starting from startRow
  for (let row = startRow; row <= MAX_ROWS.DATA; row++) {
    const category = getCellValue(sheet, `${catCol}${row}`);
    
    // If category column is empty, we've reached the end
    if (!category) {
      break;
    }

    const currentCategory = normalizeCategoryName(category);

    // If category changed, we're done with this section
    if (currentCategory !== expectedCategory) {
      break;
    }

    const name = getCellValue(sheet, `${nameCol}${row}`);
    const percentageValue = getCellValue(sheet, `${pctCol}${row}`);

    // Skip header rows
    if (isHeaderValue(name)) {
      continue;
    }

    const nameStr = String(name).trim();
    if (!nameStr) {
      continue;
    }

    items.push({
      name: nameStr,
      percentage: parsePercentage(percentageValue),
    });
  }

  return sortDemographicItems(items);
}

/**
 * Parse the Demographics sheet to extract audience demographics
 * Uses single pass to identify all category sections, then parses each
 * @param workbook - Parsed Excel workbook from xlsx library
 * @returns DemographicInsights object with all audience segments, or undefined if sheet not found
 */
export function parseDemographics(workbook: WorkBook): DemographicInsights | undefined {
  const sheet = findSheet(workbook, SHEET_NAMES.DEMOGRAPHICS);
  if (!sheet) {
    console.warn('DEMOGRAPHICS sheet not found');
    return undefined;
  }

  try {
    const demographics: DemographicInsights = {
      job_titles: [],
      locations: [],
      industries: [],
      seniority: [],
      company_size: [],
      companies: [],
    };

    const { CATEGORY: catCol } = COLUMN_LAYOUTS.DEMOGRAPHICS;
    const sectionStarts = new Map<string, number>();

    // Single pass to find where each category section starts
    for (let row = 1; row <= MAX_ROWS.DATA; row++) {
      const category = getCellValue(sheet, `${catCol}${row}`);
      if (!category) continue;

      const normalizedCategory = normalizeCategoryName(category);
      
      // Record the first row where we see this category
      if (normalizedCategory && !sectionStarts.has(normalizedCategory)) {
        sectionStarts.set(normalizedCategory, row);
      }
    }

    // Parse each category that was found
    for (const [category, startRow] of sectionStarts.entries()) {
      const items = parseDemographicCategory(sheet, startRow, category);
      
      // Type-safe assignment to demographics object
      if (category in demographics) {
        demographics[category as keyof DemographicInsights] = items;
      }
    }

    return demographics;
  } catch (error) {
    console.error('Error parsing DEMOGRAPHICS sheet:', error);
    return undefined;
  }
}
