"""
CSV reader module for the Aggrada package.

This module provides functions for reading data from CSV files.
"""

import pandas as pd
import geopandas as gpd
from typing import Union, Optional, Dict, Any, List


def read_csv(
    filepath_or_buffer: str,
    spatial_columns: Optional[Union[str, List[str]]] = None,
    temporal_columns: Optional[Union[str, List[str]]] = None,
    spatial_type: str = "auto",
    temporal_format: str = "auto",
    crs: str = "EPSG:4326",
    index_data: bool = False,
    **kwargs
) -> Union[pd.DataFrame, gpd.GeoDataFrame]:
    """
    Read a CSV file into a DataFrame or GeoDataFrame.

    Parameters
    ----------
    filepath_or_buffer : str
        Path to the CSV file or URL
    spatial_columns : str or list of str, optional
        Column name(s) containing spatial information
    temporal_columns : str or list of str, optional
        Column name(s) containing temporal information
    spatial_type : str, default "auto"
        Type of spatial data. Options: "auto", "point", "polygon", "address", "code"
    temporal_format : str, default "auto"
        Format of temporal data. Options: "auto", "iso", "timestamp", "custom"
    crs : str, default "EPSG:4326"
        Coordinate reference system
    index_data : bool, default False
        Whether to automatically index the data spatially and temporally
    **kwargs
        Additional arguments to pass to pandas.read_csv()

    Returns
    -------
    DataFrame or GeoDataFrame
        Data from the CSV file
    """
    # Read the CSV file using pandas
    data = pd.read_csv(filepath_or_buffer, **kwargs)
    
    # If spatial and temporal columns are provided and index_data is True,
    # index the data spatially and temporally
    if index_data and spatial_columns and temporal_columns:
        from aggrada.core import index
        data = index(
            data,
            spatial_column=spatial_columns,
            temporal_column=temporal_columns,
            spatial_type=spatial_type,
            temporal_format=temporal_format,
            crs=crs
        )
    
    return data
