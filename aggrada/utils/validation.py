"""
Validation utility module for the Aggrada package.

This module provides functions for data validation.
"""

import pandas as pd
import geopandas as gpd
from typing import Union, List, Optional, Tuple, Dict, Any


def validate_data(
    data: Union[pd.DataFrame, gpd.GeoDataFrame],
    spatial_column: Optional[Union[str, List[str]]] = None,
    temporal_column: Optional[Union[str, List[str]]] = None
) -> bool:
    """
    Validate data for use with Aggrada.

    Parameters
    ----------
    data : DataFrame or GeoDataFrame
        The data to validate
    spatial_column : str or list of str, optional
        Column name(s) containing spatial information
    temporal_column : str or list of str, optional
        Column name(s) containing temporal information

    Returns
    -------
    bool
        True if data is valid, raises ValueError otherwise
    """
    # Check if data is a DataFrame or GeoDataFrame
    if not isinstance(data, (pd.DataFrame, gpd.GeoDataFrame)):
        raise TypeError("Data must be a pandas DataFrame or GeoPandas GeoDataFrame")
    
    # Check if data is empty
    if data.empty:
        raise ValueError("Data is empty")
    
    # Check spatial columns if provided
    if spatial_column is not None:
        if isinstance(spatial_column, str):
            spatial_column = [spatial_column]
        
        # Check if all spatial columns exist
        missing_cols = [col for col in spatial_column if col not in data.columns]
        if missing_cols:
            raise ValueError(f"Missing spatial columns: {missing_cols}")
    
    # Check temporal columns if provided
    if temporal_column is not None:
        if isinstance(temporal_column, str):
            temporal_column = [temporal_column]
        
        # Check if all temporal columns exist
        missing_cols = [col for col in temporal_column if col not in data.columns]
        if missing_cols:
            raise ValueError(f"Missing temporal columns: {missing_cols}")
    
    # If data is a GeoDataFrame, check if it has a valid geometry column
    if isinstance(data, gpd.GeoDataFrame):
        if "geometry" not in data.columns:
            raise ValueError("GeoDataFrame must have a geometry column")
        
        # Check if geometry column has valid geometries
        if data.geometry.isna().any():
            raise ValueError("Geometry column contains null values")
    
    return True


def validate_aggregation_parameters(
    spatial_granularity: Optional[str] = None,
    temporal_granularity: Optional[str] = None,
    agg_functions: Optional[Dict[str, str]] = None
) -> bool:
    """
    Validate parameters for aggregation.

    Parameters
    ----------
    spatial_granularity : str, optional
        Spatial granularity level
    temporal_granularity : str, optional
        Temporal granularity level
    agg_functions : dict, optional
        Dictionary mapping column names to aggregation functions

    Returns
    -------
    bool
        True if parameters are valid, raises ValueError otherwise
    """
    # Check spatial granularity if provided
    if spatial_granularity is not None:
        valid_spatial = ["country", "state", "province", "municipality", "county", "grid", "hexgrid", "custom"]
        if spatial_granularity.lower() not in valid_spatial:
            raise ValueError(f"Invalid spatial granularity: {spatial_granularity}. "
                            f"Valid options are: {', '.join(valid_spatial)}")
    
    # Check temporal granularity if provided
    if temporal_granularity is not None:
        valid_temporal = ["year", "quarter", "month", "week", "day", "hour", "custom"]
        if temporal_granularity.lower() not in valid_temporal:
            raise ValueError(f"Invalid temporal granularity: {temporal_granularity}. "
                            f"Valid options are: {', '.join(valid_temporal)}")
    
    # Check aggregation functions if provided
    if agg_functions is not None:
        if not isinstance(agg_functions, dict):
            raise TypeError("agg_functions must be a dictionary")
        
        # Check if all values are valid pandas aggregation functions
        valid_aggs = ["sum", "mean", "median", "min", "max", "count", "std", "var", "first", "last", "size"]
        invalid_aggs = [agg for agg in agg_functions.values() if agg not in valid_aggs]
        if invalid_aggs:
            raise ValueError(f"Invalid aggregation functions: {invalid_aggs}. "
                            f"Valid options are: {', '.join(valid_aggs)}")
    
    return True
