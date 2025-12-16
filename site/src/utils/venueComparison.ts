/**
 * Venue comparison utility for visualizing reach
 * Helps creators understand their reach by comparing to famous venues
 */

// All venues organized by capacity in ascending order
const VENUES = [
  { name: 'Madison Square Garden', capacity: 22000 },
  { name: 'Fenway Park', capacity: 37755 },
  { name: 'Yankee Stadium', capacity: 47309 },
  { name: 'Dodger Stadium', capacity: 56000 },
  { name: 'SoFi Stadium', capacity: 70240 },
  { name: 'AT&T Stadium', capacity: 80000 },
  { name: 'Wembley Stadium', capacity: 90000 },
  { name: 'Coachella', capacity: 125000 },
  { name: 'Times Square', capacity: 300000 },
  { name: 'Grand Central Terminal', capacity: 750000 },
] as const;

export interface VenueComparison {
  venue: string;
  times: number;
}

/**
 * Get a venue comparison for a given reach number
 * Uses threshold-based matching: finds the appropriate venue at or below the reach
 * @param membersReached - The number of members reached
 * @returns Object with venue name and number of times it would fill, or null if too small
 */
export function getVenueComparison(membersReached: number): VenueComparison | null {
  // Smallest venue threshold - if below this, don't show comparison
  if (membersReached < VENUES[0].capacity) {
    return null;
  }

  // Find the largest venue that fits within the reach
  // Start from the end and work backwards to find the appropriate venue
  let selectedVenue = VENUES[0];
  for (let i = VENUES.length - 1; i >= 0; i--) {
    if (membersReached >= VENUES[i].capacity) {
      selectedVenue = VENUES[i];
      break;
    }
  }

  const times = Math.round((membersReached / selectedVenue.capacity) * 10) / 10;
  return {
    venue: selectedVenue.name,
    times: Math.max(times, 1),
  };
}

/**
 * Format the venue comparison as a readable string
 * @param membersReached - The number of members reached
 * @returns Formatted string like "That's like filling Madison Square Garden 1.5 times" or null if too small
 */
export function formatVenueComparison(membersReached: number): string | null {
  const comparison = getVenueComparison(membersReached);

  if (!comparison) {
    return null;
  }

  if (comparison.times === 1) {
    return `That's like filling ${comparison.venue}`;
  }

  if (comparison.times >= 2 && comparison.times < 3) {
    return `That's like filling ${comparison.venue} twice`;
  }

  const flooredTimes = Math.floor(comparison.times);
  const formattedTimes = flooredTimes.toLocaleString('en-US');

  return `That's like filling ${comparison.venue} ${formattedTimes} times`;
}