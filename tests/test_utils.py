"""
Tests for the utils module of the Aggrada package.
"""

import pytest
import pandas as pd
import geopandas as gpd
import numpy as np
import matplotlib.pyplot as plt
from shapely.geometry import Point

import aggrada as ag
from aggrada.utils.validation import validate_data, validate_aggregation_parameters
from aggrada.utils.visualization import plot_data


def test_validate_data_valid(sample_point_data):
    """
    Test data validation with valid data.
    """
    # Should not raise any exceptions
    result = validate_data(
        sample_point_data,
        spatial_column=["latitude", "longitude"],
        temporal_column="timestamp"
    )
    assert result is True


def test_validate_data_invalid_columns(sample_point_data):
    """
    Test data validation with invalid columns.
    """
    with pytest.raises(ValueError):
        validate_data(
            sample_point_data,
            spatial_column=["invalid_column"],
            temporal_column="timestamp"
        )
    
    with pytest.raises(ValueError):
        validate_data(
            sample_point_data,
            spatial_column=["latitude", "longitude"],
            temporal_column="invalid_column"
        )


def test_validate_data_empty():
    """
    Test data validation with empty data.
    """
    empty_df = pd.DataFrame()
    
    with pytest.raises(ValueError):
        validate_data(empty_df)


def test_validate_aggregation_parameters_valid():
    """
    Test validation of aggregation parameters with valid parameters.
    """
    # Should not raise any exceptions
    result = validate_aggregation_parameters(
        spatial_granularity="grid",
        temporal_granularity="day",
        agg_functions={"value": "mean", "count": "size"}
    )
    assert result is True


def test_validate_aggregation_parameters_invalid():
    """
    Test validation of aggregation parameters with invalid parameters.
    """
    with pytest.raises(ValueError):
        validate_aggregation_parameters(
            spatial_granularity="invalid_granularity"
        )
    
    with pytest.raises(ValueError):
        validate_aggregation_parameters(
            temporal_granularity="invalid_granularity"
        )
    
    with pytest.raises(ValueError):
        validate_aggregation_parameters(
            agg_functions={"value": "invalid_function"}
        )


def test_plot_data_choropleth(sample_geo_data):
    """
    Test plotting data as a choropleth map.
    """
    try:
        fig = plot_data(sample_geo_data, column="value", kind="choropleth")
        assert isinstance(fig, plt.Figure)
    finally:
        plt.close("all")  # Close the plot to avoid display issues in tests


def test_plot_data_timeseries(sample_indexed_data):
    """
    Test plotting data as a time series.
    """
    try:
        fig = plot_data(sample_indexed_data, column="value", kind="timeseries")
        assert isinstance(fig, plt.Figure)
    finally:
        plt.close("all")


def test_plot_data_histogram(sample_point_data):
    """
    Test plotting data as a histogram.
    """
    try:
        fig = plot_data(sample_point_data, column="value", kind="histogram")
        assert isinstance(fig, plt.Figure)
    finally:
        plt.close("all")


def test_plot_data_scatter(sample_point_data):
    """
    Test plotting data as a scatter plot.
    """
    try:
        fig = plot_data(
            sample_point_data, 
            column="value", 
            kind="scatter", 
            x="latitude", 
            y="longitude"
        )
        assert isinstance(fig, plt.Figure)
    finally:
        plt.close("all")


def test_plot_data_auto(sample_indexed_data):
    """
    Test plotting data with auto-detected kind.
    """
    try:
        fig = plot_data(sample_indexed_data, column="value")
        assert isinstance(fig, plt.Figure)
    finally:
        plt.close("all")
