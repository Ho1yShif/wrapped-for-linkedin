/**
 * Best Month Calculator
 * =====================
 * Calculates the best performing month based on engagement data.
 *
 * Logic:
 * - Groups engagement data by month/year
 * - Sums engagements for each month
 * - Returns the month with highest total engagement
 * - Returns the month name, total engagement, and count of people engaged
 */

import type { EngagementByDay } from '@utils/excel/types';

export interface BestMonthData {
  month: string; // e.g., "Nov"
  monthYear: string; // e.g., "Nov 2024"
  engagements: number;
  peopleEngaged: number; // Total unique people who engaged
}

/**
 * Calculate the best month based on engagement data
 * @param engagementByDay - Array of daily engagement metrics
 * @returns BestMonthData with best month info, or null if no data
 */
export function calculateBestMonth(engagementByDay: EngagementByDay[]): BestMonthData | null {
  if (!engagementByDay || engagementByDay.length === 0) {
    return null;
  }

  // Group engagement by month/year
  const monthlyEngagement = new Map<
    string,
    { engagements: number; peopleEngaged: number; date: Date }
  >();

  for (const item of engagementByDay) {
    const date = new Date(item.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyEngagement.has(monthKey)) {
      monthlyEngagement.set(monthKey, {
        engagements: 0,
        peopleEngaged: 0,
        date,
      });
    }

    const monthData = monthlyEngagement.get(monthKey)!;
    monthData.engagements += item.engagement;
    // Each day with engagement represents people who engaged
    // Add the engagement count as a proxy for people (conservative estimate)
    if (item.engagement > 0) {
      monthData.peopleEngaged += item.engagement;
    }
  }

  // Find month with highest engagement
  let bestMonth: BestMonthData | null = null;
  let maxEngagement = 0;

  for (const [, data] of monthlyEngagement) {
    if (data.engagements > maxEngagement) {
      maxEngagement = data.engagements;

      const monthFormatter = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        year: 'numeric',
      });
      const formattedMonth = monthFormatter.format(data.date);

      // Extract just the month name
      const monthName = formattedMonth.split(' ')[0];

      bestMonth = {
        month: monthName,
        monthYear: formattedMonth,
        engagements: data.engagements,
        peopleEngaged: data.peopleEngaged,
      };
    }
  }

  return bestMonth;
}
