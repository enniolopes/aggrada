"""
Temporal aggregator module for the Aggrada package.

This module provides functions for temporal aggregation.
"""

import pandas as pd
import geopandas as gpd
from typing import Union, Dict, List, Optional, Tuple, Any
import numpy as np
from datetime import datetime, timedelta


def aggregate_temporal(
    data: Union[pd.DataFrame, gpd.GeoDataFrame],
    temporal_granularity: str,
    agg_functions: Dict[str, str] = None
) -> Union[pd.DataFrame, gpd.GeoDataFrame]:
    """
    Aggregate data at specified temporal granularity.

    Parameters
    ----------
    data : DataFrame or GeoDataFrame
        Indexed data with time_start and time_end columns
    temporal_granularity : str
        Temporal granularity level (e.g., "year", "month", "week", "day")
    agg_functions : dict, optional
        Dictionary mapping column names to aggregation functions

    Returns
    -------
    DataFrame or GeoDataFrame
        Temporally aggregated data
    """
    # Check if data has temporal columns
    if "time_start" not in data.columns or "time_end" not in data.columns:
        raise ValueError("Data must have time_start and time_end columns")
    
    if agg_functions is None:
        # Default aggregation functions
        numeric_cols = data.select_dtypes(include=[np.number]).columns.tolist()
        agg_functions = {col: "mean" for col in numeric_cols}
    
    # Add a count column if it doesn't exist
    if "count" in agg_functions and "count" not in data.columns:
        data = data.copy()
        data["count"] = 1
    
    # Keep geometry if it exists
    if isinstance(data, gpd.GeoDataFrame) and "geometry" in data.columns and "geometry" not in agg_functions:
        agg_functions["geometry"] = "first"
    
    # Preserve spatial_group if it exists
    if "spatial_group" in data.columns and "spatial_group" not in agg_functions:
        agg_functions["spatial_group"] = "first"
    
    # Create a temporal grouping column based on granularity
    data = data.copy() if not isinstance(data, pd.DataFrame) else data.copy()
    
    if temporal_granularity.lower() == "custom":
        # For custom, we use the existing custom_temporal_group column
        if "custom_temporal_group" not in data.columns:
            raise ValueError("For custom temporal granularity, data must have a 'custom_temporal_group' column")
        group_col = "custom_temporal_group"
    else:
        # Create a temporal grouping column based on granularity
        data["temporal_group"] = _create_temporal_groups(data, temporal_granularity)
        group_col = "temporal_group"
    
    # Group by the temporal group and aggregate
    grouped = data.groupby(group_col)
    
    # Apply aggregation functions
    aggregated = grouped.agg(agg_functions)
    
    # Reset index to make grouping column a column
    aggregated = aggregated.reset_index()
    
    # Convert back to GeoDataFrame if input was a GeoDataFrame
    if isinstance(data, gpd.GeoDataFrame) and "geometry" in aggregated.columns:
        return gpd.GeoDataFrame(aggregated, geometry="geometry", crs=data.crs)
    else:
        return aggregated


def _create_temporal_groups(
    data: pd.DataFrame,
    granularity: str
) -> pd.Series:
    """
    Create temporal groups based on granularity.
    
    Parameters
    ----------
    data : DataFrame
        Data with time_start and time_end columns
    granularity : str
        Temporal granularity level
        
    Returns
    -------
    Series
        Series of temporal group labels
    """
    # Use time_start for grouping
    times = data["time_start"]
    
    if granularity.lower() == "year":
        return times.dt.year
    elif granularity.lower() == "quarter":
        return times.dt.to_period("Q").astype(str)
    elif granularity.lower() == "month":
        return times.dt.to_period("M").astype(str)
    elif granularity.lower() == "week":
        return times.dt.to_period("W").astype(str)
    elif granularity.lower() == "day":
        return times.dt.to_period("D").astype(str)
    elif granularity.lower() == "hour":
        return times.dt.to_period("H").astype(str)
    elif granularity.lower() == "custom":
        # This should not be called for custom granularity
        # as we use the existing custom_temporal_group column
        if "custom_temporal_group" not in data.columns:
            raise ValueError("For custom temporal granularity, data must have a 'custom_temporal_group' column")
        return data["custom_temporal_group"]
    else:
        raise ValueError(f"Unsupported temporal granularity: {granularity}")
