/**
 * Maps parsed Excel data to shareable card objects
 */

import type { ShareableCard } from '@/types/wrappedStories';
import type { ParsedExcelData } from '@utils/excel/types';
import { calculateBestMonth } from '@utils/bestMonthCalculator';
import { getVenueComparison, formatVenueComparison } from '@utils/venueComparison';
import { formatNumber } from '@utils/formatters';

/**
 * Generate all shareable cards from parsed Excel data
 * Cards are ordered by virality potential
 */
export function generateShareableCards(data: ParsedExcelData): ShareableCard[] {
  const cards: ShareableCard[] = [];

  // Card 1: Total impressions
  if (data.discovery_data?.total_impressions) {
    cards.push({
      id: 'total-impressions',
      type: 'total-impressions',
      title: 'Impression Icon',
      data: {
        value: formatNumber(data.discovery_data.total_impressions),
        label: 'Total impressions',
        icon: '✨',
        context: 'Your posts were seen this many times',
      },
      backgroundColor: '#0F0F0F',
      gradient: 'linear-gradient(135deg, #0A66C2 0%, #00B4D8 100%)',
    });
  }

  // Card 2: Members Reached
  if (data.discovery_data?.members_reached) {
    const membersReached = data.discovery_data.members_reached;
    const venueComparison = getVenueComparison(membersReached) || undefined;
    const venueFormatted = formatVenueComparison(membersReached);
    const contextMessage =
      venueFormatted
        ? `You reached ${formatNumber(membersReached)} people. ${venueFormatted}!`
        : 'Your network is powerful';

    cards.push({
      id: 'members-reached',
      type: 'members-reached',
      title: 'Network Ninja',
      data: {
        value: formatNumber(membersReached),
        label: 'Unique Professionals Reached',
        icon: '👥',
        context: contextMessage,
        venueComparison,
      },
      backgroundColor: '#0F0F0F',
      gradient: 'linear-gradient(135deg, #E63946 0%, #F77F88 100%)',
    });
  }

  // Card 3: Top Post
  if (data.top_posts && data.top_posts.length > 0) {
    const topPost = data.top_posts[0];

    cards.push({
      id: 'top-post',
      type: 'top-post',
      title: 'Peak Performer',
      data: {
        value: formatNumber(topPost.engagements),
        impressions: topPost.impressions ? formatNumber(topPost.impressions) : undefined,
        label: 'Engagements on Your Top Post',
        context: 'Your highest-performing content',
        url: topPost.url,
        date: topPost.publish_date,
      },
      backgroundColor: '#0F0F0F',
      gradient: 'linear-gradient(135deg, #FFB703 0%, #FB5607 100%)',
    });
  }

  // Card 4: Top Industry
  if (data.demographics?.industries && data.demographics.industries.length > 0) {
    const topIndustry = data.demographics.industries[0];
    const percentage = Math.round((topIndustry.percentage || 0) * 100);
    cards.push({
      id: 'top-industry',
      type: 'audience-industry',
      title: 'Industry Insider',
      data: {
        value: topIndustry.name,
        label: `${percentage}% of Your Audience`,
        icon: '💼',
        context: 'Your primary professional industry',
        percentage: topIndustry.percentage,
      },
      backgroundColor: '#0F0F0F',
      gradient: 'linear-gradient(135deg, #9945FF 0%, #7209B7 100%)',
    });
  }

  // Card 5: Best Month
  if (data.engagement_by_day && data.engagement_by_day.length > 0) {
    const bestMonth = calculateBestMonth(data.engagement_by_day);
    if (bestMonth) {
      cards.push({
        id: 'best-month',
        type: 'best-month',
        title: 'Engagement Expert',
        data: {
          value: bestMonth.monthYear,
          label: `was your month`,
          icon: '🗓️',
          context: `${bestMonth.peopleEngaged.toLocaleString()} people interacted with your content`,
        },
        backgroundColor: '#0F0F0F',
        gradient: 'linear-gradient(135deg, #06A77D 0%, #2A9D8F 100%)',
      });
    }
  }

  // Card 6: New Followers
  if (data.discovery_data?.new_followers) {
    cards.push({
      id: 'new-followers',
      type: 'new-followers',
      title: 'Popular Professional',
      data: {
        value: `+${formatNumber(data.discovery_data.new_followers)}`,
        label: 'New Followers this year',
        icon: '🎉',
        context: 'Your community is growing!',
      },
      backgroundColor: '#0F0F0F',
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)',
    });
  }

  // Card 7: Top Location
  if (data.demographics?.locations && data.demographics.locations.length > 0) {
    const topLocation = data.demographics.locations[0];
    const percentage = Math.round((topLocation.percentage || 0) * 100);
    cards.push({
      id: 'top-location',
      type: 'audience-location',
      title: 'Local Legend',
      data: {
        value: topLocation.name,
        label: `${percentage}% of Your Audience`,
        icon: '📍',
        context: 'Your primary geographic reach',
        percentage: topLocation.percentage,
      },
      backgroundColor: '#0F0F0F',
      gradient: 'linear-gradient(135deg, #0A66C2 0%, #40E0D0 100%)',
    });
  }

  // Card 8: Year Summary (final card)
  cards.push({
    id: 'year-summary',
    type: 'year-summary',
    title: 'Year in review',
    data: {
      impressions: formatNumber(data.discovery_data?.total_impressions || 0),
      membersReached: formatNumber(data.discovery_data?.members_reached || 0),
      engagements: formatNumber(data.discovery_data?.total_engagements || 0),
      newFollowers: formatNumber(data.discovery_data?.new_followers || 0),
      context: '',
    },
    backgroundColor: '#0F0F0F',
    gradient: 'linear-gradient(135deg, #FF006E 0%, #9945FF 50%, #0A66C2 100%)',
  });

  return cards;
}

/**
 * Get a list of card titles for reference
 */
export function getCardTitles(): Record<string, string> {
  return {
    'total-impressions': 'Impressive Influencer',
    'top-post': 'Pinnacle Post Producer',
    'members-reached': 'Magnificent Member Magnetizer',
    'audience-industry': 'Incredible Industry Insider',
    'new-followers': 'Popular Professional Personality',
    'audience-location': 'Landmark Location Legend',
    'year-summary': 'Legendary LinkedIn Leader',
  };
}
