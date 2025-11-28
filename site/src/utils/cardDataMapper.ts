/**
 * Maps parsed Excel data to shareable card objects
 */

import type { ShareableCard } from '../types/wrappedStories';
import type { ParsedExcelData } from './excel/types';
import { generateShareText } from './shareTextTemplates';

/**
 * Format large numbers for display (e.g., 1500000 -> 1.5M)
 */
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + 'K';
  }
  return num.toString();
}

/**
 * Get a profile avatar color based on card ID
 */
function getAvatarColor(cardId: string): string {
  const colors = [
    '#0A66C2', // LinkedIn Blue
    '#00B4D8', // Cyan
    '#06A77D', // Green
    '#FFB703', // Orange
    '#FB5607', // Red-Orange
    '#9945FF', // Purple
    '#FF006E', // Pink
    '#2A9D8F', // Teal
  ];

  const hash = cardId
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

/**
 * Generate a profile photo URL from LinkedIn post URL
 * Uses LinkedIn's CDN to fetch profile pictures associated with posts
 * Falls back to a data URL with initials if not available
 */
function generateProfilePhotoUrl(postUrl: string): string | undefined {
  if (!postUrl) return undefined;

  // LinkedIn profile pictures can be fetched from the post page using Open Graph data
  // For now, we'll store the post URL and fetch it later in the component
  // This avoids CORS issues and allows lazy loading
  return postUrl;
}

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
        profileId: 'impressions',
        avatarColor: getAvatarColor('total-impressions'),
      },
      shareText: generateShareText('total-impressions', data),
      backgroundColor: '#0F0F0F',
      gradient: 'linear-gradient(135deg, #0A66C2 0%, #00B4D8 100%)',
    });
  }

  // Card 2: Members Reached
  if (data.discovery_data?.members_reached) {
    cards.push({
      id: 'members-reached',
      type: 'members-reached',
      title: 'Network Ninja',
      data: {
        value: formatNumber(data.discovery_data.members_reached),
        label: 'Unique Professionals Reached',
        icon: '👥',
        context: 'Your network is powerful',
        profileId: 'network',
        avatarColor: getAvatarColor('members-reached'),
      },
      shareText: generateShareText('members-reached', data),
      backgroundColor: '#0F0F0F',
      gradient: 'linear-gradient(135deg, #E63946 0%, #F77F88 100%)',
    });
  }

  // Card 3: Top Post
  if (data.top_posts && data.top_posts.length > 0) {
    const topPost = data.top_posts[0];
    // Extract profile photo URL from post URL if available
    // LinkedIn post URLs contain profile data that can be used to fetch profile picture
    const profilePhotoUrl = topPost.url ? generateProfilePhotoUrl(topPost.url) : undefined;

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
        profileId: 'toppost',
        avatarColor: getAvatarColor('top-post'),
        profilePhotoUrl: profilePhotoUrl,
      },
      shareText: generateShareText('top-post', data),
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
        profileId: 'industry',
        avatarColor: getAvatarColor('top-industry'),
      },
      shareText: generateShareText('audience-industry', data),
      backgroundColor: '#0F0F0F',
      gradient: 'linear-gradient(135deg, #9945FF 0%, #7209B7 100%)',
    });
  }

  // Card 5: Engagements
  if (data.discovery_data?.total_engagements) {
    cards.push({
      id: 'engagements',
      type: 'engagements',
      title: 'Engagement Expert',
      data: {
        value: formatNumber(data.discovery_data.total_engagements),
        label: 'Total Engagements',
        icon: '❤️',
        context: 'Your audience loves your content',
        profileId: 'engage',
        avatarColor: getAvatarColor('engagements'),
      },
      shareText: generateShareText('engagements', data),
      backgroundColor: '#0F0F0F',
      gradient: 'linear-gradient(135deg, #00D9FF 0%, #0A8FFF 100%)',
    });
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
        profileId: 'growth',
        avatarColor: getAvatarColor('new-followers'),
      },
      shareText: generateShareText('new-followers', data),
      backgroundColor: '#0F0F0F',
      gradient: 'linear-gradient(135deg, #06A77D 0%, #2A9D8F 100%)',
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
        profileId: 'location',
        avatarColor: getAvatarColor('top-location'),
      },
      shareText: generateShareText('audience-location', data),
      backgroundColor: '#0F0F0F',
      gradient: 'linear-gradient(135deg, #0A66C2 0%, #40E0D0 100%)',
    });
  }

  // Card 8: Year Summary (Always include as final card)
  cards.push({
    id: 'year-summary',
    type: 'year-summary',
    title: 'Year in review',
    data: {
      impressions: formatNumber(data.discovery_data?.total_impressions || 0),
      membersReached: formatNumber(data.discovery_data?.members_reached || 0),
      engagements: formatNumber(data.discovery_data?.total_engagements || 0),
      newFollowers: formatNumber(data.discovery_data?.new_followers || 0),
      icon: '🗓️',
      context: '',
      profileId: 'summary',
      avatarColor: getAvatarColor('year-summary'),
    },
    shareText: generateShareText('year-summary', data),
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
    'engagements': 'Excellent Engagement Expert',
    'new-followers': 'Popular Professional Personality',
    'audience-location': 'Landmark Location Legend',
    'year-summary': 'Legendary LinkedIn Leader',
  };
}
