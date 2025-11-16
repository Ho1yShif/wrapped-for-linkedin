from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date

class DiscoveryData(BaseModel):
    """Overall performance metrics from the DISCOVERY sheet"""
    start_date: date
    end_date: date
    total_impressions: int
    members_reached: int

class EngagementMetrics(BaseModel):
    total_likes: int
    total_comments: int
    total_shares: int
    peak_engagement_time: Optional[datetime] = None
    top_performing_posts: List[dict]
    discovery_data: Optional[dict] = None  # Contains impressions and reach data

class DemographicInsights(BaseModel):
    job_titles: List[dict]
    locations: List[dict]
    industries: List[dict]

class ProcessedFileResponse(BaseModel):
    file_id: str
    discovery: Optional[DiscoveryData] = None
    metrics: EngagementMetrics
    insights: DemographicInsights