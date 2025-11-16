from ..models.schemas import EngagementMetrics, DemographicInsights, DiscoveryData
from ..utils.discovery_parser import extract_discovery_data, DiscoveryData as ParserDiscoveryData
import polars as pl
from pathlib import Path
from typing import Optional

# In-memory storage for processed file data
_file_data_store: dict = {}


def store_file_data(file_id: str, data: dict) -> None:
    """Store processed file data in memory"""
    _file_data_store[file_id] = data


def get_file_data(file_id: str) -> Optional[dict]:
    """Retrieve stored file data"""
    return _file_data_store.get(file_id)


async def get_discovery_data(file_id: str) -> Optional[DiscoveryData]:
    """Extract and return discovery data for a file"""
    data = get_file_data(file_id)
    if data and "discovery_data" in data:
        discovery = data["discovery_data"]
        if isinstance(discovery, ParserDiscoveryData):
            # Convert parser object to Pydantic model
            return DiscoveryData(
                start_date=discovery.start_date,
                end_date=discovery.end_date,
                total_impressions=discovery.total_impressions,
                members_reached=discovery.members_reached
            )
        return discovery
    return None


async def get_engagement_metrics(file_id: str) -> EngagementMetrics:
    """Get engagement metrics including discovery data"""
    data = get_file_data(file_id)
    discovery = data.get("discovery_data") if data else None

    if discovery:
        return EngagementMetrics(
            total_likes=0,  # TODO: Parse from file
            total_comments=0,  # TODO: Parse from file
            total_shares=0,  # TODO: Parse from file
            peak_engagement_time=None,  # TODO: Calculate from file
            top_performing_posts=[],  # TODO: Extract from file
            discovery_data={
                "start_date": discovery.start_date.isoformat(),
                "end_date": discovery.end_date.isoformat(),
                "total_impressions": discovery.total_impressions,
                "members_reached": discovery.members_reached
            }
        )

    # Fallback if no discovery data
    return EngagementMetrics(
        total_likes=0,
        total_comments=0,
        total_shares=0,
        peak_engagement_time=None,
        top_performing_posts=[]
    )

async def get_demographic_insights(file_id: str) -> DemographicInsights:
    # TODO: Implement demographic insights calculation
    # This is a placeholder that will be expanded
    return DemographicInsights(
        job_titles=[],
        locations=[],
        industries=[]
    )