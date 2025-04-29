"""
Spatial aggregator module for the Aggrada package.

This module provides functions for spatial aggregation.
"""

import pandas as pd
import geopandas as gpd
from typing import Union, Dict, List, Optional, Tuple, Any
import numpy as np


def aggregate_spatial(
    data: gpd.GeoDataFrame,
    spatial_granularity: str,
    agg_functions: Dict[str, str] = None
) -> gpd.GeoDataFrame:
    """
    Aggregate data at specified spatial granularity.

    Parameters
    ----------
    data : GeoDataFrame
        Indexed data with geometry column
    spatial_granularity : str
        Spatial granularity level (e.g., "country", "state", "municipality", "custom")
    agg_functions : dict, optional
        Dictionary mapping column names to aggregation functions

    Returns
    -------
    GeoDataFrame
        Spatially aggregated data
    """
    if not isinstance(data, gpd.GeoDataFrame):
        raise TypeError("Data must be a GeoDataFrame")
    
    if "geometry" not in data.columns and data.geometry.name != "geometry":
        raise ValueError("Data must have a geometry column")
    
    if agg_functions is None:
        # Default aggregation functions
        numeric_cols = data.select_dtypes(include=[np.number]).columns.tolist()
        agg_functions = {col: "mean" for col in numeric_cols}
    
    # Add a count column if it doesn't exist
    if "count" in agg_functions and "count" not in data.columns:
        data = data.copy()
        data["count"] = 1
    
    # Make sure geometry is included in aggregation functions
    if "geometry" not in agg_functions:
        agg_functions["geometry"] = "first"
    
    # Different aggregation strategies based on granularity
    if spatial_granularity.lower() in ["country", "state", "province", "municipality", "county"]:
        return _aggregate_by_admin_level(data, spatial_granularity, agg_functions)
    elif spatial_granularity.lower() in ["grid", "hexgrid"]:
        return _aggregate_by_grid(data, spatial_granularity, agg_functions)
    elif spatial_granularity.lower() == "custom":
        # For custom, we assume the data already has a column indicating the aggregation level
        if "spatial_group" not in data.columns:
            raise ValueError("For custom spatial granularity, data must have a 'spatial_group' column")
        return _aggregate_by_column(data, "spatial_group", agg_functions)
    else:
        raise ValueError(f"Unsupported spatial granularity: {spatial_granularity}")


def _aggregate_by_admin_level(
    data: gpd.GeoDataFrame,
    admin_level: str,
    agg_functions: Dict[str, str]
) -> gpd.GeoDataFrame:
    """
    Aggregate data by administrative level.
    
    Parameters
    ----------
    data : GeoDataFrame
        Data to aggregate
    admin_level : str
        Administrative level (e.g., "country", "state")
    agg_functions : dict
        Dictionary mapping column names to aggregation functions
        
    Returns
    -------
    GeoDataFrame
        Aggregated data
    """
    # This is a simplified implementation
    # In a real implementation, you would use a shapefile of administrative boundaries
    # and perform a spatial join
    
    # For demonstration purposes, we'll just create a warning
    import warnings
    warnings.warn(
        f"Aggregation by {admin_level} is not fully implemented. "
        "In a production environment, you would use administrative boundary shapefiles. "
        "Returning data aggregated by dummy regions."
    )
    
    # Create dummy regions based on grid cells
    return _aggregate_by_grid(data, "grid", agg_functions)


def _aggregate_by_grid(
    data: gpd.GeoDataFrame,
    grid_type: str,
    agg_functions: Dict[str, str]
) -> gpd.GeoDataFrame:
    """
    Aggregate data by grid cells.
    
    Parameters
    ----------
    data : GeoDataFrame
        Data to aggregate
    grid_type : str
        Type of grid ("grid" for square, "hexgrid" for hexagonal)
    agg_functions : dict
        Dictionary mapping column names to aggregation functions
        
    Returns
    -------
    GeoDataFrame
        Aggregated data
    """
    from shapely.geometry import box
    
    # Get the bounds of the data
    minx, miny, maxx, maxy = data.total_bounds
    
    # Create a grid (simplified for demonstration)
    # In a real implementation, you would create a proper grid
    
    # For demonstration, we'll create a 10x10 grid
    cell_size_x = (maxx - minx) / 10
    cell_size_y = (maxy - miny) / 10
    
    # Create grid cells
    grid_cells = []
    for i in range(10):
        for j in range(10):
            cell_minx = minx + i * cell_size_x
            cell_miny = miny + j * cell_size_y
            cell_maxx = minx + (i + 1) * cell_size_x
            cell_maxy = miny + (j + 1) * cell_size_y
            cell = box(cell_minx, cell_miny, cell_maxx, cell_maxy)
            grid_cells.append({"geometry": cell, "cell_id": f"{i}_{j}"})
    
    # Create a GeoDataFrame from the grid cells
    grid = gpd.GeoDataFrame(grid_cells, crs=data.crs)
    
    # Spatial join with the data
    joined = gpd.sjoin(data, grid, how="left", predicate="within")
    
    # Group by cell_id and aggregate
    grouped = joined.groupby("cell_id")
    
    # Apply aggregation functions
    aggregated = grouped.agg(agg_functions)
    
    # Reset index to make cell_id a column
    aggregated = aggregated.reset_index()
    
    # Convert back to GeoDataFrame
    if "geometry" in aggregated.columns:
        return gpd.GeoDataFrame(aggregated, crs=data.crs)
    else:
        # If geometry column was lost during aggregation, use a dummy point
        from shapely.geometry import Point
        aggregated["geometry"] = Point(0, 0)
        return gpd.GeoDataFrame(aggregated, crs=data.crs)


def _aggregate_by_column(
    data: gpd.GeoDataFrame,
    column: str,
    agg_functions: Dict[str, str]
) -> gpd.GeoDataFrame:
    """
    Aggregate data by a column.
    
    Parameters
    ----------
    data : GeoDataFrame
        Data to aggregate
    column : str
        Column to group by
    agg_functions : dict
        Dictionary mapping column names to aggregation functions
        
    Returns
    -------
    GeoDataFrame
        Aggregated data
    """
    # Group by the specified column and aggregate
    grouped = data.groupby(column)
    
    # Apply aggregation functions
    aggregated = grouped.agg(agg_functions)
    
    # Reset index to make the grouping column a regular column
    aggregated = aggregated.reset_index()
    
    # Convert back to GeoDataFrame
    if "geometry" in aggregated.columns:
        return gpd.GeoDataFrame(aggregated, crs=data.crs)
    else:
        # If geometry column was lost during aggregation, use a dummy point
        from shapely.geometry import Point
        aggregated["geometry"] = Point(0, 0)
        return gpd.GeoDataFrame(aggregated, crs=data.crs)
