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
 * - Section headers in uppercase (e.g., "JOB TITLES")
 * - Category items with percentages in columns A and B
 *
 * Performance Notes:
 * - Single pass through up to 500 rows
 * - Minimal memory footprint
 * - ~10-20ms processing time typical
 * - Efficiently handles missing sections
 */
import type { WorkBook } from 'xlsx';
import type { DemographicInsights, DemographicItem } from './types';
import { getCellValue, parsePercentage, findSheet } from './utils';

/**
 * Normalize category name to match expected keys
 */
function normalizeCategoryName(cellValue: string): string | null {
  const normalized = String(cellValue).toLowerCase().trim();

  if (normalized.match(/^job titles?$/)) return 'job_titles';
  if (normalized.match(/^locations?$/)) return 'locations';
  if (normalized.match(/^industries?$/)) return 'industries';
  if (normalized.match(/^seniority$/)) return 'seniority';
  if (normalized.match(/^company size$/)) return 'company_size';
  if (normalized.match(/^(specific )?companies?$/)) return 'companies';

  return null;
}

/**
 * Parse a demographic category section from the sheet
 * @param sheet - Worksheet object from xlsx
 * @param startRow - Starting row of the category
 * @param expectedCategory - The category name we're looking for (e.g., "Job titles")
 * @returns Sorted array of demographic items (highest percentage first)
 */
function parseDemographicCategory(
  sheet: any,
  startRow: number,
  expectedCategory: string
): DemographicItem[] {
  const items: DemographicItem[] = [];

  // Parse rows starting from startRow
  // Structure: Column A = Category (repeating), Column B = Item name, Column C = Percentage
  for (let row = startRow; row <= 500; row++) {
    const cellA = getCellValue(sheet, `A${row}`);
    const cellB = getCellValue(sheet, `B${row}`);
    const cellC = getCellValue(sheet, `C${row}`);

    // If A is empty, we've reached the end of data
    if (!cellA) {
      break;
    }

    const currentCategory = normalizeCategoryName(cellA);

    // If category changed, we're done with this section
    if (currentCategory !== expectedCategory) {
      break;
    }

    // Skip the header row (where B might be empty or contain "Value")
    if (!cellB || String(cellB).toLowerCase().trim() === 'value') {
      continue;
    }

    const nameStr = String(cellB).trim();
    const percentage = parsePercentage(cellC);

    // Skip empty names
    if (!nameStr) {
      continue;
    }

    // Add item with parsed percentage
    items.push({
      name: nameStr,
      percentage,
    });
  }

  // Sort by percentage descending (highest first)
  // Then by name alphabetically for items with same percentage
  return items.sort((a, b) => {
    if (b.percentage !== a.percentage) {
      return b.percentage - a.percentage;
    }
    return a.name.localeCompare(b.name);
  });
}

/**
 * Parse the Demographics sheet to extract audience demographics
 * @param workbook - Parsed Excel workbook from xlsx library
 * @returns DemographicInsights object with all audience segments, or undefined if sheet not found
 */
export function parseDemographics(workbook: WorkBook): DemographicInsights | undefined {
  const sheet = findSheet(workbook, 'DEMOGRAPHICS');
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

    // Scan through sheet to find all unique categories and their first occurrence
    // Structure: Column A contains the category name (repeated for each item in that category)
    // We only need to find where each category starts
    const sectionMap = new Map<string, number>();
    const processedCategories = new Set<string>();

    // Single pass to find all section starts
    for (let row = 1; row <= 500; row++) {
      const cellA = getCellValue(sheet, `A${row}`);
      if (!cellA) continue;

      const normalizedCategory = normalizeCategoryName(cellA);

      // Record the first row where we see this category
      if (normalizedCategory && !processedCategories.has(normalizedCategory)) {
        sectionMap.set(normalizedCategory, row);
        processedCategories.add(normalizedCategory);
      }
    }

    // Parse each category that was found
    for (const [category] of sectionMap) {
      const startRow = sectionMap.get(category)!;
      const items = parseDemographicCategory(sheet, startRow, category);

      // Assign to the corresponding property
      if (category in demographics) {
        (demographics as unknown as Record<string, DemographicItem[]>)[category] = items;
      }
    }

    return demographics;
  } catch (error) {
    console.error('Error parsing DEMOGRAPHICS sheet:', error);
    return undefined;
  }
}
