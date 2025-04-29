"""
Core functionality for the Aggrada package.

This module provides the main functions for indexing, aggregating, and analyzing spatiotemporal data.
"""

import pandas as pd
import geopandas as gpd
from typing import Union, Dict, List, Optional, Tuple, Any
import numpy as np
from datetime import datetime, timedelta

from aggrada.transformers.spatial import create_geometry
from aggrada.transformers.temporal import create_temporal_range
from aggrada.aggregators.spatial import aggregate_spatial
from aggrada.aggregators.temporal import aggregate_temporal
from aggrada.utils.validation import validate_data
from aggrada.utils.visualization import plot_data as _plot_data # Import the utility function


def index(
    data: Union[pd.DataFrame, gpd.GeoDataFrame],
    spatial_column: Union[str, List[str]],
    temporal_column: Union[str, List[str]],
    spatial_type: str = "auto",
    temporal_format: str = "auto",
    crs: str = "EPSG:4326",
) -> gpd.GeoDataFrame:
    """
    Index data spatially and temporally.

    Parameters
    ----------
    data : DataFrame or GeoDataFrame
        The data to index
    spatial_column : str or list of str
        Column name(s) containing spatial information
    temporal_column : str or list of str
        Column name(s) containing temporal information
    spatial_type : str, default "auto"
        Type of spatial data. Options: "auto", "point", "polygon", "address", "code"
    temporal_format : str, default "auto"
        Format of temporal data. Options: "auto", "iso", "timestamp", "custom"
    crs : str, default "EPSG:4326"
        Coordinate reference system

    Returns
    -------
    GeoDataFrame
        Indexed data with geometry and temporal_range columns
    """
    # Validate input data
    validate_data(data, spatial_column, temporal_column)
    
    # Create a copy to avoid modifying the original
    result = data.copy()
    
    # Create geometry from spatial column(s)
    result = create_geometry(result, spatial_column, spatial_type, crs)
    
    # Create temporal range from temporal column(s)
    result = create_temporal_range(result, temporal_column, temporal_format)
    
    return result


def aggregate(
    data: gpd.GeoDataFrame,
    spatial_granularity: str,
    temporal_granularity: str,
    agg_functions: Dict[str, str] = None,
) -> gpd.GeoDataFrame:
    """
    Aggregate data at specified spatial and temporal granularities.

    Parameters
    ----------
    data : GeoDataFrame
        Indexed data with geometry and temporal_range columns
    spatial_granularity : str
        Spatial granularity level (e.g., "country", "state", "municipality", "custom", "grid")
    temporal_granularity : str
        Temporal granularity level (e.g., "year", "month", "week", "day", "custom")
    agg_functions : dict, optional
        Dictionary mapping column names to aggregation functions

    Returns
    -------
    GeoDataFrame
        Aggregated data
    """
    if agg_functions is None:
        agg_functions = {}

    # --- Spatial Aggregation --- 
    spatial_agg_functions = agg_functions.copy()
    # Ensure time columns and geometry are preserved during spatial aggregation
    if "time_start" not in spatial_agg_functions:
        spatial_agg_functions["time_start"] = "first"
    if "time_end" not in spatial_agg_functions:
        spatial_agg_functions["time_end"] = "first"
    if "geometry" not in spatial_agg_functions:
        spatial_agg_functions["geometry"] = "first"
    # If spatial granularity is custom, spatial_group must be in data
    if spatial_granularity.lower() == "custom" and "spatial_group" not in data.columns:
        raise ValueError("For custom spatial granularity, data must have a 'spatial_group' column")

    spatially_aggregated = aggregate_spatial(data, spatial_granularity, spatial_agg_functions)

    # Identify the spatial grouping column created (if any)
    spatial_group_col = None
    if spatial_granularity.lower() == "custom" and "spatial_group" in spatially_aggregated.columns:
        spatial_group_col = "spatial_group"
    elif spatial_granularity.lower() in ["grid", "hexgrid"] and "cell_id" in spatially_aggregated.columns:
        spatial_group_col = "cell_id" # Assuming grid aggregation adds 'cell_id'

    # --- Temporal Aggregation --- 
    temporal_agg_functions = agg_functions.copy()
    # Ensure geometry is preserved if it exists and wasn't specified
    if "geometry" in spatially_aggregated.columns and "geometry" not in temporal_agg_functions:
         temporal_agg_functions["geometry"] = "first"
    # Ensure the spatial grouping column is preserved if it exists and wasn't specified
    if spatial_group_col and spatial_group_col not in temporal_agg_functions:
         temporal_agg_functions[spatial_group_col] = "first"
    # Remove time columns from temporal agg functions as they are used for grouping/indexing
    temporal_agg_functions.pop("time_start", None)
    temporal_agg_functions.pop("time_end", None)

    # If temporal granularity is custom, custom_temporal_group must be in spatially_aggregated
    if temporal_granularity.lower() == "custom" and "custom_temporal_group" not in spatially_aggregated.columns:
         # Try to carry it over from original data if spatial aggregation didn't
         if "custom_temporal_group" in data.columns:
             # This requires merging back based on some ID, which is complex.
             # For now, assume spatial aggregation preserves it if needed or raise error.
             raise ValueError("Custom temporal group column lost during spatial aggregation.")
         else:
             raise ValueError("For custom temporal granularity, data must have a 'custom_temporal_group' column")

    result = aggregate_temporal(spatially_aggregated, temporal_granularity, temporal_agg_functions)
    
    return result


def evaluate_consistency(
    data: gpd.GeoDataFrame,
    metrics: List[str] = None,
) -> Dict[str, float]:
    """
    Evaluate the consistency of aggregated data.

    Parameters
    ----------
    data : GeoDataFrame
        Aggregated data
    metrics : list of str, optional
        List of metrics to calculate. Default: ["completeness", "variance", "density"]

    Returns
    -------
    dict
        Dictionary of consistency metrics
    """
    if metrics is None:
        metrics = ["completeness", "variance", "density"]
    
    results = {}
    
    if "completeness" in metrics:
        # Calculate data completeness (percentage of non-null values)
        non_null = data.count().sum()
        total = data.size
        results["completeness"] = non_null / total if total > 0 else 0
    
    if "variance" in metrics:
        # Calculate average variance across numeric columns
        numeric_cols = data.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) > 0:
            results["variance"] = data[numeric_cols].var(skipna=True).mean()
        else:
            results["variance"] = 0
    
    if "density" in metrics:
        # Calculate spatial density (if applicable)
        if isinstance(data, gpd.GeoDataFrame) and not data.geometry.is_empty.all():
            try:
                # Use union_all() instead of deprecated unary_union
                total_area = data.geometry.union_all().area 
            except Exception:
                 total_area = 0 # Handle potential issues with union
            results["density"] = len(data) / total_area if total_area > 0 else 0
        else:
            results["density"] = 0
    
    return results


def plot(
    data: Union[pd.DataFrame, gpd.GeoDataFrame],
    column: str = None,
    kind: str = "auto",
    title: str = None,
    figsize: Tuple[int, int] = (10, 8),
    **kwargs
) -> Any:
    """
    Plot aggregated data.

    Parameters
    ----------
    data : DataFrame or GeoDataFrame
        Data to plot
    column : str, optional
        Column to visualize
    kind : str, default "auto"
        Type of plot. Options: "auto", "choropleth", "timeseries", "histogram", "scatter"
    title : str, optional
        Plot title
    figsize : tuple, optional
        Figure size
    **kwargs
        Additional arguments to pass to the plotting function

    Returns
    -------
    matplotlib.figure.Figure
        The plot figure
    """
    # Use the visualization utility function
    return _plot_data(data, column=column, kind=kind, title=title, figsize=figsize, **kwargs)
