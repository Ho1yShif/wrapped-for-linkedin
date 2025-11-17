import polars as pl
from fastapi import UploadFile
import uuid
from ..models.schemas import DiscoveryData
from ..utils.sheet_parser import parse_discovery_sheet
from ..utils.discovery_parser import extract_discovery_data
from ..utils.top_posts_parser import parse_top_posts_sheet, get_top_5_posts
from .analytics_service import store_file_data
import io


async def process_linkedin_file(file: UploadFile) -> dict:
    # Create a unique ID for the file
    file_id = str(uuid.uuid4())

    # Read the file content
    content = await file.read()

    # Parse discovery data
    discovery_data = None
    try:
        discovery_cells = parse_discovery_sheet(content)
        parser_discovery = extract_discovery_data(discovery_cells)
        # Convert to Pydantic model
        discovery_data = DiscoveryData(
            start_date=parser_discovery.start_date,
            end_date=parser_discovery.end_date,
            total_impressions=parser_discovery.total_impressions,
            members_reached=parser_discovery.members_reached
        )
    except ValueError as e:
        print(f"Warning: Could not parse discovery data: {e}")

    # Parse top posts
    top_posts = None
    try:
        all_posts = parse_top_posts_sheet(content)
        top_posts = get_top_5_posts(all_posts)
    except ValueError as e:
        print(f"Warning: Could not parse top posts: {e}")

    # Store the parsed data for later retrieval
    store_file_data(file_id, {
        "discovery_data": discovery_data,
        "top_posts": top_posts,
        "filename": file.filename,
        "content": content
    })

    # Process with Polars if needed
    try:
        if file.filename.endswith('.xlsx'):
            df = pl.read_excel(io.BytesIO(content))
        elif file.filename.endswith('.csv'):
            df = pl.read_csv(io.BytesIO(content))
    except Exception as e:
        print(f"Warning: Could not parse file with Polars: {e}")

    # Return response format expected by frontend
    return {
        "success": True,
        "fileId": file_id,
        "message": "File processed successfully"
    }

    return ProcessedFileResponse(
        file_id=file_id,
        discovery=discovery_data,
        metrics={
            "total_likes": 0,
            "total_comments": 0,
            "total_shares": 0,
            "peak_engagement_time": None,
            "top_performing_posts": []
        },
        insights={
            "job_titles": [],
            "locations": [],
            "industries": []
        }
    )