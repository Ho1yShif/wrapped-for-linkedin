export interface AnalyticsData {
  fileId: string;
  engagement?: EngagementMetrics;
  demographics?: DemographicInsights;
}

export interface EngagementMetrics {
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  averageEngagement?: number;
  topPosts?: TopPost[];
  engagementByDay?: EngagementByDay[];
  peakEngagementTime?: string;
  discovery_data?: {
    start_date: string;
    end_date: string;
    total_impressions: number;
    members_reached: number;
  };
  top_posts?: LinkedInTopPost[];
}

export interface LinkedInTopPost {
  rank: number;
  url: string;
  publish_date: string;
  engagements: number;
  impressions?: number;
}

export interface TopPost {
  id: string;
  content: string;
  likes: number;
  comments: number;
  shares: number;
  date: string;
  engagementRate: number;
}

export interface EngagementByDay {
  date: string;
  engagement: number;
}

export interface DemographicInsights {
  jobTitles: JobTitleData[];
  geography: GeographyData[];
  industries: IndustryData[];
  totalFollowers: number;
  followerGrowth: number;
}

export interface JobTitleData {
  title: string;
  count: number;
  percentage: number;
}

export interface GeographyData {
  country: string;
  count: number;
  percentage: number;
}

export interface IndustryData {
  industry: string;
  count: number;
  percentage: number;
}

export interface UploadResponse {
  success: boolean;
  fileId: string;
  message: string;
}
