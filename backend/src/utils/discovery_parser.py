"""
Parser for LinkedIn DISCOVERY sheet data.
Handles extraction and validation of overall performance metrics.
"""

from datetime import datetime, date
from typing import Dict, Any, Tuple, Optional
import re


class DiscoveryData:
    """Overall performance metrics from the DISCOVERY sheet"""
    def __init__(
        self,
        start_date: date,
        end_date: date,
        total_impressions: int,
        members_reached: int,
        total_engagements: Optional[int] = None,
        average_impressions_per_day: Optional[float] = None,
        new_followers: Optional[int] = None
    ):
        self.start_date = start_date
        self.end_date = end_date
        self.total_impressions = total_impressions
        self.members_reached = members_reached
        self.total_engagements = total_engagements
        self.average_impressions_per_day = average_impressions_per_day
        self.new_followers = new_followers

    def to_dict(self):
        return {
            "start_date": self.start_date.isoformat(),
            "end_date": self.end_date.isoformat(),
            "total_impressions": self.total_impressions,
            "members_reached": self.members_reached,
            "total_engagements": self.total_engagements,
            "average_impressions_per_day": self.average_impressions_per_day,
            "new_followers": self.new_followers
        }


def parse_date_range(date_range_str: str) -> Tuple[date, date]:
    """
    Parse a date range string in format "MM/DD/YYYY - MM/DD/YYYY"

    Args:
        date_range_str: Date range string from Excel

    Returns:
        Tuple of (start_date, end_date)

    Raises:
        ValueError: If date range format is invalid
    """
    try:
        # Split on " - " (with spaces)
        dates = date_range_str.strip().split(" - ")
        if len(dates) != 2:
            raise ValueError(f"Expected format 'MM/DD/YYYY - MM/DD/YYYY', got '{date_range_str}'")

        start_date = datetime.strptime(dates[0].strip(), "%m/%d/%Y").date()
        end_date = datetime.strptime(dates[1].strip(), "%m/%d/%Y").date()

        return start_date, end_date
    except (ValueError, AttributeError) as e:
        raise ValueError(f"Failed to parse date range '{date_range_str}': {str(e)}")


def parse_integer_value(value: Any) -> int:
    """
    Parse an integer value from Excel cell (could be float, string, or int)

    Args:
        value: Value from Excel cell

    Returns:
        Parsed integer value

    Raises:
        ValueError: If value cannot be converted to int
    """
    try:
        if isinstance(value, str):
            # Remove commas and whitespace
            value = value.replace(",", "").strip()

        return int(float(value))
    except (ValueError, TypeError) as e:
        raise ValueError(f"Failed to parse integer value '{value}': {str(e)}")


def extract_discovery_data(
    discovery_cells: Dict[str, Any],
    file_content: Optional[bytes] = None
) -> DiscoveryData:
    """
    Extract discovery data from the 4 cells in the DISCOVERY sheet.

    Expected structure:
    {
        "Overall Performance": "11/11/2024 - 11/10/2025",
        "Impressions": 857000.0,
        "Members reached": 297771.0
    }

    Args:
        discovery_cells: Dictionary with discovery data keys and values
        file_content: Optional binary content of Excel file for calculating summary metrics

    Returns:
        DiscoveryData object with all calculated metrics

    Raises:
        ValueError: If required fields are missing or invalid
    """
    required_fields = {"Overall Performance", "Impressions", "Members reached"}

    if not all(field in discovery_cells for field in required_fields):
        missing = required_fields - set(discovery_cells.keys())
        raise ValueError(f"Missing required discovery fields: {missing}")

    try:
        # Parse date range
        date_range_str = str(discovery_cells["Overall Performance"])
        start_date, end_date = parse_date_range(date_range_str)

        # Parse integer values
        impressions = parse_integer_value(discovery_cells["Impressions"])
        members_reached = parse_integer_value(discovery_cells["Members reached"])

        # Calculate summary metrics if file content is provided
        total_engagements = None
        average_impressions_per_day = None
        new_followers = None

        if file_content:
            from .summary_metrics_parser import calculate_summary_metrics
            try:
                metrics = calculate_summary_metrics(file_content)
                total_engagements = metrics["total_engagements"]
                average_impressions_per_day = metrics["median_daily_impressions"]
                new_followers = metrics["new_followers"]
            except ValueError as e:
                # Log warning but don't fail - continue with None values
                print(f"Warning: Could not calculate summary metrics: {e}")

        return DiscoveryData(
            start_date=start_date,
            end_date=end_date,
            total_impressions=impressions,
            members_reached=members_reached,
            total_engagements=total_engagements,
            average_impressions_per_day=average_impressions_per_day,
            new_followers=new_followers
        )
    except ValueError as e:
        raise ValueError(f"Failed to extract discovery data: {str(e)}")