/**
 * Constants for Excel parsing
 * ============================
 * Centralized configuration values to avoid magic numbers and improve maintainability.
 */

/**
 * Maximum rows to scan for different operations
 */
export const MAX_ROWS = {
  /** Maximum rows to scan when looking for headers */
  HEADER_SCAN: 20,
  /** Maximum rows to scan for labeled values in discovery sheet */
  LABEL_SCAN: 100,
  /** Maximum rows to process for data (posts, metrics, demographics) */
  DATA: 1000,
  /** Maximum rows for follower data */
  FOLLOWERS: 500,
};

/**
 * Criteria for detecting when to stop scanning
 */
export const SCAN_LIMITS = {
  /** Number of consecutive empty rows before stopping iteration */
  CONSECUTIVE_EMPTY_ROWS: 5,
};

/**
 * Sheet name variations that LinkedIn might use
 */
export const SHEET_NAMES = {
  DISCOVERY: ['DISCOVERY'],
  TOP_POSTS: ['Top posts', 'TOP POSTS'],
  FOLLOWERS: ['FOLLOWERS'],
  DEMOGRAPHICS: ['DEMOGRAPHICS'],
  ENGAGEMENT: ['ENGAGEMENT'],
};

/**
 * Column layouts for different sheet types
 */
export const COLUMN_LAYOUTS = {
  /** Top Posts sheet has two-column layout side by side */
  TOP_POSTS: {
    ENGAGEMENTS: {
      URL: 'A',
      DATE: 'B',
      VALUE: 'C',
    },
    IMPRESSIONS: {
      URL: 'E',
      DATE: 'F',
      VALUE: 'G',
    },
  },
  /** Engagement sheet has date, impressions, and engagements in adjacent columns */
  ENGAGEMENT: {
    DATE: 'A',
    IMPRESSIONS: 'B',
    ENGAGEMENTS: 'C',
  },
  /** Demographics sheet has category, name, and percentage */
  DEMOGRAPHICS: {
    CATEGORY: 'A',
    NAME: 'B',
    PERCENTAGE: 'C',
  },
  /** Followers sheet has date and count */
  FOLLOWERS: {
    DATE: 'A',
    NEW_FOLLOWERS: 'B',
  },
  /** Discovery sheet typically has labels in column A and values in column B */
  DISCOVERY: {
    LABEL: 'A',
    VALUE: 'B',
  },
};

/**
 * Keywords for finding specific data in sheets
 */
export const KEYWORDS = {
  HEADERS: {
    URL: ['url'],
    DATE: ['date'],
    FOLLOWER: ['follower', 'followers', 'new follower'],
    ENGAGEMENT: ['engagement'],
    VALUE: ['value'],
  },
  LABELS: {
    OVERALL_PERFORMANCE: ['overall performance'],
    IMPRESSIONS: ['impression'],
    MEMBERS_REACHED: ['member'],
    ENGAGEMENTS: ['engagement'],
    FOLLOWERS: ['follower'],
    TOTAL_FOLLOWERS: ['total followers'],
  },
};

/**
 * Minimum valid percentage value (for "< 1%" cases)
 */
export const MIN_PERCENTAGE = 0.0001;

/**
 * Excel date offset (days between Excel epoch and Unix epoch)
 */
export const EXCEL_DATE_OFFSET = 25569;
export const MS_PER_DAY = 86400 * 1000;

