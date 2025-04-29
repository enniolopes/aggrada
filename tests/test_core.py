"""
Tests for the core module of the Aggrada package.
"""

import pytest
import pandas as pd
import geopandas as gpd
import numpy as np
from shapely.geometry import Point
import matplotlib.pyplot as plt

import aggrada as ag
from aggrada.core import index, aggregate, evaluate_consistency, plot


def test_index_point_data(sample_point_data):
    """
    Test indexing with point data.
    """
    indexed = index(
        sample_point_data,
        spatial_column=["latitude", "longitude"],
        temporal_column="timestamp",
        spatial_type="point",
        temporal_format="iso"
    )
    
    assert isinstance(indexed, gpd.GeoDataFrame)
    assert "geometry" in indexed.columns
    assert "time_start" in indexed.columns
    assert "time_end" in indexed.columns
    assert not indexed.geometry.isna().any()
    assert not indexed.time_start.isna().any()
    assert not indexed.time_end.isna().any()
    assert indexed.crs == "EPSG:4326"
    assert len(indexed) == len(sample_point_data)


def test_index_invalid_data(sample_point_data):
    """
    Test indexing with invalid parameters.
    """
    with pytest.raises(ValueError):
        index(sample_point_data, spatial_column="invalid_col", temporal_column="timestamp")
    
    with pytest.raises(ValueError):
        index(sample_point_data, spatial_column=["latitude", "longitude"], temporal_column="invalid_col")


def test_aggregate_grid_day(sample_indexed_data):
    """
    Test aggregation by grid and day.
    """
    aggregated = aggregate(
        sample_indexed_data,
        spatial_granularity="grid",
        temporal_granularity="day",
        agg_functions={"value": "mean", "count": "size"}
    )
    
    assert isinstance(aggregated, gpd.GeoDataFrame)
    assert "geometry" in aggregated.columns
    assert "temporal_group" in aggregated.columns
    assert "value" in aggregated.columns
    assert "count" in aggregated.columns
    # Check if aggregation reduced the number of rows (depends on data and grid)
    assert len(aggregated) <= len(sample_indexed_data)


def test_aggregate_custom_year(sample_indexed_data):
    """
    Test aggregation by custom spatial group and year.
    """
    # Create a copy to avoid modifying the original
    data_with_group = sample_indexed_data.copy()
    # Add custom spatial group
    data_with_group["spatial_group"] = ["A", "A", "B", "B", "A"]
    
    aggregated = aggregate(
        data_with_group,
        spatial_granularity="custom",
        temporal_granularity="year",
        agg_functions={"value": "sum", "count": "size"}
    )
    
    assert isinstance(aggregated, gpd.GeoDataFrame)
    assert "spatial_group" in aggregated.columns
    assert "temporal_group" in aggregated.columns
    assert "value" in aggregated.columns
    assert "count" in aggregated.columns
    assert len(aggregated) <= len(data_with_group)


def test_evaluate_consistency(sample_indexed_data):
    """
    Test consistency evaluation.
    """
    # Aggregate first
    aggregated = aggregate(
        sample_indexed_data,
        spatial_granularity="grid",
        temporal_granularity="day",
        agg_functions={"value": "mean"}
    )
    
    metrics = evaluate_consistency(aggregated)
    
    assert isinstance(metrics, dict)
    assert "completeness" in metrics
    assert "variance" in metrics
    assert "density" in metrics
    assert 0 <= metrics["completeness"] <= 1


def test_plot_map(sample_indexed_data):
    """
    Test plotting a map.
    """
    # Aggregate first
    aggregated = aggregate(
        sample_indexed_data,
        spatial_granularity="grid",
        temporal_granularity="day",
        agg_functions={"value": "mean"}
    )
    
    # Test if plotting runs without errors
    try:
        fig = plot(aggregated, column="value", kind="choropleth")
        assert isinstance(fig, plt.Figure)
    finally:
        plt.close("all") # Close the plot to avoid display issues in tests


def test_plot_timeseries(sample_indexed_data):
    """
    Test plotting a time series.
    """
    # Test if plotting runs without errors
    try:
        fig = plot(sample_indexed_data, column="value", kind="timeseries")
        assert isinstance(fig, plt.Figure)
    finally:
        plt.close("all") # Close the plot to avoid display issues in tests
