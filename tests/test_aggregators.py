"""
Tests for the aggregators module of the Aggrada package.
"""

import pytest
import pandas as pd
import geopandas as gpd
import numpy as np
from shapely.geometry import Point

import aggrada as ag
from aggrada.aggregators.spatial import aggregate_spatial
from aggrada.aggregators.temporal import aggregate_temporal


def test_aggregate_spatial_grid(sample_indexed_data):
    """
    Test spatial aggregation using grid.
    """
    aggregated = aggregate_spatial(
        sample_indexed_data,
        spatial_granularity="grid",
        agg_functions={"value": "mean", "count": "size"}
    )
    
    assert isinstance(aggregated, gpd.GeoDataFrame)
    assert "geometry" in aggregated.columns
    assert "value" in aggregated.columns
    assert "count" in aggregated.columns
    assert aggregated.crs == sample_indexed_data.crs
    # Grid aggregation should reduce the number of rows or keep it the same
    assert len(aggregated) <= len(sample_indexed_data)


def test_aggregate_spatial_custom(sample_indexed_data):
    """
    Test spatial aggregation using custom groups.
    """
    # Add a spatial group column
    sample_indexed_data["spatial_group"] = ["A", "A", "B", "B", "A"]
    
    aggregated = aggregate_spatial(
        sample_indexed_data,
        spatial_granularity="custom",
        agg_functions={"value": "sum", "count": "size"}
    )
    
    assert isinstance(aggregated, gpd.GeoDataFrame)
    assert "spatial_group" in aggregated.columns
    assert "value" in aggregated.columns
    assert "count" in aggregated.columns
    assert len(aggregated) == 2  # Should have 2 groups: A and B
    
    # Check aggregation results
    group_a = aggregated[aggregated["spatial_group"] == "A"]
    group_b = aggregated[aggregated["spatial_group"] == "B"]
    
    assert len(group_a) == 1
    assert len(group_b) == 1
    
    # Group A has 3 points with values 10, 15, and 30
    assert group_a["value"].iloc[0] == 55  # 10 + 15 + 30
    assert group_a["count"].iloc[0] == 3
    
    # Group B has 2 points with values 20 and 25
    assert group_b["value"].iloc[0] == 45  # 20 + 25
    assert group_b["count"].iloc[0] == 2


def test_aggregate_temporal_day(sample_indexed_data):
    """
    Test temporal aggregation by day.
    """
    aggregated = aggregate_temporal(
        sample_indexed_data,
        temporal_granularity="day",
        agg_functions={"value": "mean", "count": "size"}
    )
    
    assert "temporal_group" in aggregated.columns
    assert "value" in aggregated.columns
    assert "count" in aggregated.columns
    assert len(aggregated) == 2  # Should have 2 days
    
    # Check if the aggregation is correct
    # First day has 3 points with values 10, 15, and 20
    # Second day has 2 points with values 25 and 30
    day_groups = aggregated["temporal_group"].unique()
    assert len(day_groups) == 2
    
    # Get the first day's data
    day1 = aggregated[aggregated["temporal_group"] == day_groups[0]]
    # Get the second day's data
    day2 = aggregated[aggregated["temporal_group"] == day_groups[1]]
    
    # Check the aggregated values
    assert abs(day1["value"].iloc[0] - 15) < 0.1  # Mean of 10, 15, 20
    assert day1["count"].iloc[0] == 3
    
    assert abs(day2["value"].iloc[0] - 27.5) < 0.1  # Mean of 25, 30
    assert day2["count"].iloc[0] == 2


def test_aggregate_temporal_year(sample_indexed_data):
    """
    Test temporal aggregation by year.
    """
    aggregated = aggregate_temporal(
        sample_indexed_data,
        temporal_granularity="year",
        agg_functions={"value": "sum", "count": "size"}
    )
    
    assert "temporal_group" in aggregated.columns
    assert "value" in aggregated.columns
    assert "count" in aggregated.columns
    assert len(aggregated) == 1  # Should have 1 year (2023)
    
    # Check if the aggregation is correct
    # All points are in 2023 with values 10, 15, 20, 25, and 30
    assert aggregated["value"].iloc[0] == 100  # Sum of all values
    assert aggregated["count"].iloc[0] == 5  # Count of all points


def test_aggregate_temporal_custom(sample_indexed_data):
    """
    Test temporal aggregation with custom groups.
    """
    # Add a custom temporal group column
    sample_indexed_data["custom_temporal_group"] = ["Morning", "Morning", "Afternoon", "Morning", "Afternoon"]
    
    aggregated = aggregate_temporal(
        sample_indexed_data,
        temporal_granularity="custom",
        agg_functions={"value": "mean", "count": "size"}
    )
    
    assert "custom_temporal_group" in aggregated.columns
    assert "value" in aggregated.columns
    assert "count" in aggregated.columns
    assert len(aggregated) == 2  # Should have 2 groups: Morning and Afternoon
    
    # Check aggregation results
    morning = aggregated[aggregated["custom_temporal_group"] == "Morning"]
    afternoon = aggregated[aggregated["custom_temporal_group"] == "Afternoon"]
    
    assert len(morning) == 1
    assert len(afternoon) == 1
    
    # Morning has 3 points with values 10, 15, and 25
    assert abs(morning["value"].iloc[0] - 16.67) < 0.1  # Mean of 10, 15, 25
    assert morning["count"].iloc[0] == 3
    
    # Afternoon has 2 points with values 20 and 30
    assert abs(afternoon["value"].iloc[0] - 25) < 0.1  # Mean of 20, 30
    assert afternoon["count"].iloc[0] == 2
