#!/usr/bin/env python3
"""
Test script to verify summary metrics calculations with the test Excel file.
"""

from src.utils.summary_metrics_parser import (
    get_total_engagements,
    get_median_daily_impressions,
    get_new_followers,
    calculate_summary_metrics
)
from src.utils.discovery_parser import extract_discovery_data
from src.utils.sheet_parser import parse_discovery_sheet
from pathlib import Path

# Load test file
test_file = Path("test-data/Content_2024-11-11_2025-11-10_ShifraWilliams.xlsx")

if not test_file.exists():
    print(f"Error: Test file not found at {test_file}")
    exit(1)

with open(test_file, 'rb') as f:
    file_content = f.read()

print("=" * 80)
print("TESTING SUMMARY METRICS CALCULATIONS")
print("=" * 80)

# Test 1: Parse discovery data
print("\n1. Testing discovery data parsing...")
try:
    discovery_cells = parse_discovery_sheet(file_content)
    print(f"   Discovery cells: {discovery_cells}")
except Exception as e:
    print(f"   Error: {e}")
    exit(1)

# Test 2: Calculate total engagements
print("\n2. Testing total engagements calculation...")
try:
    total_engagements = get_total_engagements(file_content)
    print(f"   Total engagements: {total_engagements:,}")
except Exception as e:
    print(f"   Error: {e}")

# Test 3: Calculate median daily impressions
print("\n3. Testing median daily impressions calculation...")
try:
    # Extract total impressions from discovery data
    discovery = extract_discovery_data(discovery_cells, file_content)
    total_impressions = discovery.total_impressions
    print(f"   Total impressions: {total_impressions:,}")

    median_daily = get_median_daily_impressions(total_impressions)
    print(f"   median daily impressions: {median_daily:.1f}")
except Exception as e:
    print(f"   Error: {e}")

# Test 4: Calculate new followers
print("\n4. Testing new followers calculation...")
try:
    new_followers = get_new_followers(file_content)
    print(f"   New followers: {new_followers:,}")
except Exception as e:
    print(f"   Error: {e}")

# Test 5: Full summary metrics calculation
print("\n5. Testing full summary metrics calculation...")
try:
    metrics = calculate_summary_metrics(file_content, total_impressions)
    print(f"   Total engagements: {metrics['total_engagements']:,}")
    print(f"   median daily impressions: {metrics['average_impressions_per_day']:.1f}")
    print(f"   New followers: {metrics['new_followers']:,}")
except Exception as e:
    print(f"   Error: {e}")

# Test 6: Full discovery data extraction with all metrics
print("\n6. Testing full discovery data extraction...")
try:
    full_discovery = extract_discovery_data(discovery_cells, file_content)
    print(f"   Start date: {full_discovery.start_date}")
    print(f"   End date: {full_discovery.end_date}")
    print(f"   Total impressions: {full_discovery.total_impressions:,}")
    print(f"   Members reached: {full_discovery.members_reached:,}")
    print(f"   Total engagements: {full_discovery.total_engagements:,}")
    print(f"   median daily impressions: {full_discovery.average_impressions_per_day:.1f}")
    print(f"   New followers: {full_discovery.new_followers:,}")
    print(f"\n   Discovery data dict:\n   {full_discovery.to_dict()}")
except Exception as e:
    print(f"   Error: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 80)
print("TEST COMPLETE")
print("=" * 80)
