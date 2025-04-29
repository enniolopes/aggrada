"""
Test configuration and fixtures for Aggrada tests.
"""

import pytest
import pandas as pd
import geopandas as gpd
import numpy as np
from shapely.geometry import Point
import os
import tempfile
from datetime import datetime

@pytest.fixture
def sample_point_data():
    """
    Create a sample DataFrame with point data.
    """
    data = pd.DataFrame({
        "id": [1, 2, 3, 4, 5],
        "latitude": [40.712, 40.714, 40.710, 40.718, 40.715],
        "longitude": [-74.006, -74.012, -74.008, -74.004, -74.010],
        "timestamp": [
            "2023-01-15T08:00:00", 
            "2023-01-15T09:00:00", 
            "2023-01-15T10:00:00", 
            "2023-01-16T08:00:00", 
            "2023-01-16T09:00:00"
        ],
        "value": [10, 15, 20, 25, 30]
    })
    return data

@pytest.fixture
def sample_geo_data():
    """
    Create a sample GeoDataFrame with point geometry.
    """
    data = pd.DataFrame({
        "id": [1, 2, 3, 4, 5],
        "timestamp": [
            "2023-01-15T08:00:00", 
            "2023-01-15T09:00:00", 
            "2023-01-15T10:00:00", 
            "2023-01-16T08:00:00", 
            "2023-01-16T09:00:00"
        ],
        "value": [10, 15, 20, 25, 30]
    })
    
    # Create point geometries
    geometry = [
        Point(-74.006, 40.712),
        Point(-74.012, 40.714),
        Point(-74.008, 40.710),
        Point(-74.004, 40.718),
        Point(-74.010, 40.715)
    ]
    
    return gpd.GeoDataFrame(data, geometry=geometry, crs="EPSG:4326")

@pytest.fixture
def sample_indexed_data():
    """
    Create a sample indexed GeoDataFrame with time_start and time_end columns.
    """
    data = pd.DataFrame({
        "id": [1, 2, 3, 4, 5],
        "value": [10, 15, 20, 25, 30]
    })
    
    # Create point geometries
    geometry = [
        Point(-74.006, 40.712),
        Point(-74.012, 40.714),
        Point(-74.008, 40.710),
        Point(-74.004, 40.718),
        Point(-74.010, 40.715)
    ]
    
    # Create time columns
    time_start = pd.to_datetime([
        "2023-01-15T08:00:00", 
        "2023-01-15T09:00:00", 
        "2023-01-15T10:00:00", 
        "2023-01-16T08:00:00", 
        "2023-01-16T09:00:00"
    ])
    
    time_end = time_start.copy()
    
    gdf = gpd.GeoDataFrame(data, geometry=geometry, crs="EPSG:4326")
    gdf["time_start"] = time_start
    gdf["time_end"] = time_end
    
    return gdf

@pytest.fixture
def temp_csv_file():
    """
    Create a temporary CSV file with sample data.
    """
    with tempfile.NamedTemporaryFile(suffix='.csv', delete=False) as tmp:
        data = pd.DataFrame({
            "id": [1, 2, 3],
            "latitude": [40.712, 40.714, 40.710],
            "longitude": [-74.006, -74.012, -74.008],
            "timestamp": [
                "2023-01-15T08:00:00", 
                "2023-01-15T09:00:00", 
                "2023-01-15T10:00:00"
            ],
            "value": [10, 15, 20]
        })
        data.to_csv(tmp.name, index=False)
        tmp_name = tmp.name
    
    yield tmp_name
    
    # Cleanup
    if os.path.exists(tmp_name):
        os.unlink(tmp_name)

@pytest.fixture
def temp_excel_file():
    """
    Create a temporary Excel file with sample data.
    """
    with tempfile.NamedTemporaryFile(suffix='.xlsx', delete=False) as tmp:
        data = pd.DataFrame({
            "id": [1, 2, 3],
            "latitude": [40.712, 40.714, 40.710],
            "longitude": [-74.006, -74.012, -74.008],
            "timestamp": [
                "2023-01-15T08:00:00", 
                "2023-01-15T09:00:00", 
                "2023-01-15T10:00:00"
            ],
            "value": [10, 15, 20]
        })
        data.to_excel(tmp.name, index=False)
        tmp_name = tmp.name
    
    yield tmp_name
    
    # Cleanup
    if os.path.exists(tmp_name):
        os.unlink(tmp_name)
