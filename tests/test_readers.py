"""
Tests for the readers module of the Aggrada package.
"""

import pytest
import pandas as pd
import geopandas as gpd
import numpy as np
import os

import aggrada as ag
from aggrada.readers import read_csv, read_excel, read_shapefile, read_json


def test_read_csv(temp_csv_file):
    """
    Test reading data from a CSV file.
    """
    # Basic reading
    data = read_csv(temp_csv_file)
    assert isinstance(data, pd.DataFrame)
    assert len(data) > 0
    assert "id" in data.columns
    assert "latitude" in data.columns
    assert "longitude" in data.columns
    assert "timestamp" in data.columns
    assert "value" in data.columns
    
    # Reading with indexing
    indexed_data = read_csv(
        temp_csv_file,
        spatial_columns=["latitude", "longitude"],
        temporal_columns="timestamp",
        index_data=True
    )
    
    assert isinstance(indexed_data, gpd.GeoDataFrame)
    assert "geometry" in indexed_data.columns
    assert "time_start" in indexed_data.columns
    assert "time_end" in indexed_data.columns


def test_read_excel(temp_excel_file):
    """
    Test reading data from an Excel file.
    """
    # Basic reading
    data = read_excel(temp_excel_file)
    assert isinstance(data, pd.DataFrame)
    assert len(data) > 0
    assert "id" in data.columns
    assert "latitude" in data.columns
    assert "longitude" in data.columns
    assert "timestamp" in data.columns
    assert "value" in data.columns
    
    # Reading with indexing
    indexed_data = read_excel(
        temp_excel_file,
        spatial_columns=["latitude", "longitude"],
        temporal_columns="timestamp",
        index_data=True
    )
    
    assert isinstance(indexed_data, gpd.GeoDataFrame)
    assert "geometry" in indexed_data.columns
    assert "time_start" in indexed_data.columns
    assert "time_end" in indexed_data.columns


def test_read_shapefile(sample_geo_data, tmp_path):
    """
    Test reading data from a Shapefile.
    """
    # Save sample data to a temporary shapefile
    shapefile_path = os.path.join(tmp_path, "test.shp")
    sample_geo_data.to_file(shapefile_path)
    
    # Read the shapefile
    data = read_shapefile(shapefile_path)
    assert isinstance(data, gpd.GeoDataFrame)
    assert "geometry" in data.columns
    assert len(data) == len(sample_geo_data)
    
    # Read with temporal indexing
    indexed_data = read_shapefile(
        shapefile_path,
        temporal_columns="timestamp",
        index_data=True
    )
    
    assert isinstance(indexed_data, gpd.GeoDataFrame)
    assert "geometry" in indexed_data.columns
    assert "time_start" in indexed_data.columns
    assert "time_end" in indexed_data.columns


def test_read_json(tmp_path):
    """
    Test reading data from a JSON file.
    """
    # Create a temporary JSON file
    json_path = os.path.join(tmp_path, "test.json")
    data = pd.DataFrame({
        "id": [1, 2, 3],
        "location": ["40.712,-74.006", "40.714,-74.012", "40.710,-74.008"],
        "timestamp": ["2023-01-15T08:00:00", "2023-01-15T09:00:00", "2023-01-15T10:00:00"],
        "value": [10, 15, 20]
    })
    data.to_json(json_path, orient="records")
    
    # Read the JSON file
    read_data = read_json(json_path)
    assert isinstance(read_data, pd.DataFrame)
    assert len(read_data) == len(data)
    
    # Read with indexing
    indexed_data = read_json(
        json_path,
        spatial_columns="location",
        temporal_columns="timestamp",
        index_data=True
    )
    
    assert isinstance(indexed_data, gpd.GeoDataFrame)
    assert "geometry" in indexed_data.columns
    assert "time_start" in indexed_data.columns
    assert "time_end" in indexed_data.columns
