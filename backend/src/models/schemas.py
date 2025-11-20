from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date

class DiscoveryData(BaseModel):
    """Overall performance metrics from the DISCOVERY sheet"""
    start_date: date
    end_date: date
    total_impressions: int
    members_reached: int

class TopPost(BaseModel):
    """Top performing post data"""
    rank: int
    url: str
    publish_date: str
    engagements: float
    impressions: Optional[float] = 0

class EngagementMetrics(BaseModel):
    peak_engagement_time: Optional[datetime] = None
    top_performing_posts: List[dict]
    discovery_data: Optional[dict] = None  # Contains impressions and reach data
    top_posts: Optional[List[TopPost]] = None  # Top 5 posts by engagements

class DemographicInsights(BaseModel):
    job_titles: List[dict]
    locations: List[dict]
    industries: List[dict]
    seniority: Optional[List[dict]] = None
    company_size: Optional[List[dict]] = None
    companies: Optional[List[dict]] = None

class ProcessedFileResponse(BaseModel):
    file_id: str
    discovery: Optional[DiscoveryData] = None
    metrics: EngagementMetrics
    insights: DemographicInsights