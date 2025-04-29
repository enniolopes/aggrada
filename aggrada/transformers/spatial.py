"""
Spatial transformer module for the Aggrada package.

This module provides functions for spatial transformations.
"""

import pandas as pd
import geopandas as gpd
from typing import Union, List, Optional, Tuple, Dict, Any
import numpy as np
from shapely.geometry import Point, Polygon, MultiPolygon
import re


def create_geometry(
    data: pd.DataFrame,
    spatial_column: Union[str, List[str]],
    spatial_type: str = "auto",
    crs: str = "EPSG:4326"
) -> gpd.GeoDataFrame:
    """
    Create geometry from spatial column(s).

    Parameters
    ----------
    data : DataFrame
        The data to transform
    spatial_column : str or list of str
        Column name(s) containing spatial information
    spatial_type : str, default "auto"
        Type of spatial data. Options: "auto", "point", "polygon", "address", "code"
    crs : str, default "EPSG:4326"
        Coordinate reference system

    Returns
    -------
    GeoDataFrame
        Data with geometry column
    """
    # Make a copy to avoid modifying the original
    result = data.copy()
    
    # Convert to list if single column
    if isinstance(spatial_column, str):
        spatial_column = [spatial_column]
    
    # Detect spatial type if auto
    if spatial_type == "auto":
        spatial_type = _detect_spatial_type(result, spatial_column)
    
    # Create geometry based on spatial type
    if spatial_type == "point":
        result = _create_point_geometry(result, spatial_column, crs)
    elif spatial_type == "polygon":
        result = _create_polygon_geometry(result, spatial_column, crs)
    elif spatial_type == "address":
        result = _create_geometry_from_address(result, spatial_column, crs)
    elif spatial_type == "code":
        result = _create_geometry_from_code(result, spatial_column, crs)
    else:
        raise ValueError(f"Unsupported spatial type: {spatial_type}")
    
    return result


def _detect_spatial_type(
    data: pd.DataFrame,
    columns: List[str]
) -> str:
    """
    Detect the type of spatial data in the columns.
    
    Parameters
    ----------
    data : DataFrame
        The data to analyze
    columns : list of str
        Column names to check
        
    Returns
    -------
    str
        Detected spatial type
    """
    # Check if data is already a GeoDataFrame
    if isinstance(data, gpd.GeoDataFrame) and 'geometry' in data.columns:
        return "polygon" if any(isinstance(geom, (Polygon, MultiPolygon)) for geom in data.geometry) else "point"
    
    # Check for common patterns in column names
    col_names = " ".join(columns).lower()
    if any(term in col_names for term in ["lat", "latitude", "lon", "longitude", "x", "y"]):
        return "point"
    elif any(term in col_names for term in ["polygon", "geom", "shape", "boundary"]):
        return "polygon"
    elif any(term in col_names for term in ["address", "street", "city", "zip", "postal"]):
        return "address"
    elif any(term in col_names for term in ["code", "id", "fips", "iso", "region"]):
        return "code"
    
    # Check content of first non-null value
    for col in columns:
        if col in data.columns:
            sample = data[col].dropna().iloc[0] if not data[col].dropna().empty else None
            if sample:
                if isinstance(sample, str):
                    # Check for coordinate patterns
                    if re.match(r'^-?\d+\.\d+,\s*-?\d+\.\d+$', sample):
                        return "point"
                    # Check for WKT
                    elif sample.startswith(("POINT", "POLYGON", "MULTIPOLYGON")):
                        return "polygon" if sample.startswith(("POLYGON", "MULTIPOLYGON")) else "point"
                    # Check for address-like strings
                    elif len(sample.split()) > 2:
                        return "address"
                    # Check for code-like strings
                    elif re.match(r'^[A-Z0-9-]+$', sample):
                        return "code"
    
    # Default to point if can't determine
    return "point"


def _create_point_geometry(
    data: pd.DataFrame,
    columns: List[str],
    crs: str
) -> gpd.GeoDataFrame:
    """
    Create point geometry from columns.
    
    Parameters
    ----------
    data : DataFrame
        The data to transform
    columns : list of str
        Column names containing point information
    crs : str
        Coordinate reference system
        
    Returns
    -------
    GeoDataFrame
        Data with point geometry
    """
    # If already a GeoDataFrame with point geometry, return as is
    if isinstance(data, gpd.GeoDataFrame) and 'geometry' in data.columns:
        if all(not isinstance(geom, (Polygon, MultiPolygon)) for geom in data.geometry.dropna()):
            return data
    
    # Try to identify latitude and longitude columns
    lat_col = None
    lon_col = None
    
    # Check for common latitude/longitude column names
    for col in columns:
        col_lower = col.lower()
        if any(term in col_lower for term in ["lat", "latitude", "y"]):
            lat_col = col
        elif any(term in col_lower for term in ["lon", "longitude", "lng", "x"]):
            lon_col = col
    
    # If lat/lon columns identified, create points
    if lat_col and lon_col and lat_col in data.columns and lon_col in data.columns:
        geometry = [Point(xy) for xy in zip(data[lon_col], data[lat_col])]
        return gpd.GeoDataFrame(data, geometry=geometry, crs=crs)
    
    # If single column with coordinate pairs, parse them
    if len(columns) == 1 and columns[0] in data.columns:
        col = columns[0]
        if data[col].dtype == object:  # String column
            try:
                # Try to parse "lat,lon" format
                coords = data[col].str.split(',', expand=True).astype(float)
                geometry = [Point(xy) for xy in zip(coords[1], coords[0])]
                return gpd.GeoDataFrame(data, geometry=geometry, crs=crs)
            except:
                pass
    
    # If can't create points, raise error
    raise ValueError("Could not create point geometry from the provided columns")


def _create_polygon_geometry(
    data: pd.DataFrame,
    columns: List[str],
    crs: str
) -> gpd.GeoDataFrame:
    """
    Create polygon geometry from columns.
    
    Parameters
    ----------
    data : DataFrame
        The data to transform
    columns : list of str
        Column names containing polygon information
    crs : str
        Coordinate reference system
        
    Returns
    -------
    GeoDataFrame
        Data with polygon geometry
    """
    # If already a GeoDataFrame with polygon geometry, return as is
    if isinstance(data, gpd.GeoDataFrame) and 'geometry' in data.columns:
        if any(isinstance(geom, (Polygon, MultiPolygon)) for geom in data.geometry.dropna()):
            return data
    
    # If single column with WKT, parse it
    if len(columns) == 1 and columns[0] in data.columns:
        col = columns[0]
        if data[col].dtype == object:  # String column
            try:
                # Try to parse WKT format
                from shapely import wkt
                geometry = data[col].apply(wkt.loads)
                return gpd.GeoDataFrame(data, geometry=geometry, crs=crs)
            except:
                pass
    
    # If can't create polygons, raise error
    raise ValueError("Could not create polygon geometry from the provided columns")


def _create_geometry_from_address(
    data: pd.DataFrame,
    columns: List[str],
    crs: str
) -> gpd.GeoDataFrame:
    """
    Create geometry from address columns using geocoding.
    
    Parameters
    ----------
    data : DataFrame
        The data to transform
    columns : list of str
        Column names containing address information
    crs : str
        Coordinate reference system
        
    Returns
    -------
    GeoDataFrame
        Data with geometry from geocoded addresses
    """
    # This is a simplified implementation
    # In a real implementation, you would use a geocoding service
    # such as Nominatim, Google Geocoding API, etc.
    
    # For demonstration purposes, we'll just create a warning
    import warnings
    warnings.warn(
        "Address geocoding is not fully implemented. "
        "In a production environment, you would use a geocoding service. "
        "Returning data with placeholder points."
    )
    
    # Create placeholder points at (0, 0)
    geometry = [Point(0, 0) for _ in range(len(data))]
    return gpd.GeoDataFrame(data, geometry=geometry, crs=crs)


def _create_geometry_from_code(
    data: pd.DataFrame,
    columns: List[str],
    crs: str
) -> gpd.GeoDataFrame:
    """
    Create geometry from code columns using a lookup table.
    
    Parameters
    ----------
    data : DataFrame
        The data to transform
    columns : list of str
        Column names containing code information
    crs : str
        Coordinate reference system
        
    Returns
    -------
    GeoDataFrame
        Data with geometry from code lookup
    """
    # This is a simplified implementation
    # In a real implementation, you would use a lookup table
    # such as a shapefile of administrative boundaries
    
    # For demonstration purposes, we'll just create a warning
    import warnings
    warnings.warn(
        "Code-based geometry lookup is not fully implemented. "
        "In a production environment, you would use a lookup table. "
        "Returning data with placeholder points."
    )
    
    # Create placeholder points at (0, 0)
    geometry = [Point(0, 0) for _ in range(len(data))]
    return gpd.GeoDataFrame(data, geometry=geometry, crs=crs)
