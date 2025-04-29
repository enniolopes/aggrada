"""
Shapefile reader module for the Aggrada package.

This module provides functions for reading data from Shapefiles.
"""

import geopandas as gpd
from typing import Union, Optional, Dict, Any, List


def read_shapefile(
    filepath_or_buffer: str,
    temporal_columns: Optional[Union[str, List[str]]] = None,
    temporal_format: str = "auto",
    index_data: bool = False,
    **kwargs
) -> gpd.GeoDataFrame:
    """
    Read a Shapefile into a GeoDataFrame.

    Parameters
    ----------
    filepath_or_buffer : str
        Path to the Shapefile or URL
    temporal_columns : str or list of str, optional
        Column name(s) containing temporal information
    temporal_format : str, default "auto"
        Format of temporal data. Options: "auto", "iso", "timestamp", "custom"
    index_data : bool, default False
        Whether to automatically index the data temporally
    **kwargs
        Additional arguments to pass to geopandas.read_file()

    Returns
    -------
    GeoDataFrame
        Data from the Shapefile
    """
    # Read the Shapefile using geopandas
    data = gpd.read_file(filepath_or_buffer, **kwargs)
    
    # If temporal columns are provided and index_data is True,
    # index the data temporally
    if index_data and temporal_columns:
        from aggrada.transformers.temporal import create_temporal_range
        data = create_temporal_range(data, temporal_columns, temporal_format)
    
    return data
