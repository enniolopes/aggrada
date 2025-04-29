"""
Tests for the transformers module of the Aggrada package.
"""

import pytest
import pandas as pd
import geopandas as gpd
import numpy as np
from shapely.geometry import Point, Polygon

import aggrada as ag
from aggrada.transformers.spatial import create_geometry
from aggrada.transformers.temporal import create_temporal_range
from aggrada.transformers.flatten import flatten_object, flatten_dataframe


def test_create_geometry_point(sample_point_data):
    """
    Test creating point geometry.
    """
    gdf = create_geometry(
        sample_point_data,
        spatial_column=["latitude", "longitude"],
        spatial_type="point"
    )
    
    assert isinstance(gdf, gpd.GeoDataFrame)
    assert "geometry" in gdf.columns
    assert gdf.crs == "EPSG:4326"
    assert all(isinstance(geom, Point) for geom in gdf.geometry)


def test_create_geometry_polygon():
    """
    Test creating polygon geometry from WKT.
    """
    data = pd.DataFrame({
        "id": [1, 2],
        "wkt": [
            "POLYGON ((0 0, 1 0, 1 1, 0 1, 0 0))",
            "POLYGON ((2 2, 3 2, 3 3, 2 3, 2 2))"
        ]
    })
    
    gdf = create_geometry(
        data,
        spatial_column="wkt",
        spatial_type="polygon"
    )
    
    assert isinstance(gdf, gpd.GeoDataFrame)
    assert "geometry" in gdf.columns
    assert gdf.crs == "EPSG:4326"
    assert all(isinstance(geom, Polygon) for geom in gdf.geometry)


def test_create_geometry_auto_detect(sample_point_data):
    """
    Test auto-detecting spatial type.
    """
    gdf = create_geometry(
        sample_point_data,
        spatial_column=["latitude", "longitude"],
        spatial_type="auto"
    )
    
    assert isinstance(gdf, gpd.GeoDataFrame)
    assert "geometry" in gdf.columns
    assert all(isinstance(geom, Point) for geom in gdf.geometry)


def test_create_temporal_range_single_column(sample_point_data):
    """
    Test creating temporal range from a single column.
    """
    df = create_temporal_range(
        sample_point_data,
        temporal_column="timestamp",
        temporal_format="iso"
    )
    
    assert "time_start" in df.columns
    assert "time_end" in df.columns
    assert pd.api.types.is_datetime64_any_dtype(df["time_start"])
    assert pd.api.types.is_datetime64_any_dtype(df["time_end"])
    assert (df["time_start"] == df["time_end"]).all()


def test_create_temporal_range_two_columns():
    """
    Test creating temporal range from two columns.
    """
    data = pd.DataFrame({
        "id": [1, 2],
        "start": ["2023-01-15", "2023-01-16"],
        "end": ["2023-01-16", "2023-01-17"]
    })
    
    df = create_temporal_range(
        data,
        temporal_column=["start", "end"],
        temporal_format="auto"
    )
    
    assert "time_start" in df.columns
    assert "time_end" in df.columns
    assert pd.api.types.is_datetime64_any_dtype(df["time_start"])
    assert pd.api.types.is_datetime64_any_dtype(df["time_end"])
    assert (df["time_start"] < df["time_end"]).all()


def test_flatten_object():
    """
    Test flattening a nested dictionary.
    """
    nested = {
        "a": 1,
        "b": {
            "c": 2,
            "d": {
                "e": 3
            }
        },
        "f": [{"g": 4}, {"h": 5}]
    }
    
    flattened = flatten_object(nested)
    
    expected = {
        "a": 1,
        "b_c": 2,
        "b_d_e": 3,
        "f_0_g": 4,
        "f_1_h": 5
    }
    
    assert flattened == expected


def test_flatten_dataframe():
    """
    Test flattening nested columns in a DataFrame.
    """
    data = pd.DataFrame({
        "id": [1, 2],
        "info": [
            {"name": "A", "value": 10, "details": {"status": "ok"}},
            {"name": "B", "value": 20, "details": {"status": "error"}}
        ]
    })
    
    flattened_df = flatten_dataframe(data, columns="info")
    
    assert "info_name" in flattened_df.columns
    assert "info_value" in flattened_df.columns
    assert "info_details_status" in flattened_df.columns
    assert "info" not in flattened_df.columns
    assert flattened_df["info_name"].tolist() == ["A", "B"]
    assert flattened_df["info_value"].tolist() == [10, 20]
    assert flattened_df["info_details_status"].tolist() == ["ok", "error"]
