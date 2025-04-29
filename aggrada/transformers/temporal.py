"""
Temporal transformer module for the Aggrada package.

This module provides functions for temporal transformations.
"""

import pandas as pd
from typing import Union, List, Optional, Tuple, Dict, Any
from datetime import datetime, timedelta


def create_temporal_range(
    data: pd.DataFrame,
    temporal_column: Union[str, List[str]],
    temporal_format: str = "auto"
) -> pd.DataFrame:
    """
    Create temporal range from temporal column(s).

    Parameters
    ----------
    data : DataFrame
        The data to transform
    temporal_column : str or list of str
        Column name(s) containing temporal information
    temporal_format : str, default "auto"
        Format of temporal data. Options: "auto", "iso", "timestamp", "custom"

    Returns
    -------
    DataFrame
        Data with temporal_range column
    """
    # Make a copy to avoid modifying the original
    result = data.copy()
    
    # Convert to list if single column
    if isinstance(temporal_column, str):
        temporal_column = [temporal_column]
    
    # Check if columns exist
    missing_cols = [col for col in temporal_column if col not in result.columns]
    if missing_cols:
        raise ValueError(f"Missing temporal columns: {missing_cols}")
    
    # Try to parse temporal columns
    start_time = None
    end_time = None
    
    if len(temporal_column) == 1:
        col = temporal_column[0]
        # Try parsing as single datetime column
        try:
            if temporal_format == "iso":
                # Use ISO8601 format for ISO strings
                parsed_time = pd.to_datetime(result[col], format="ISO8601")
            else:
                parsed_time = pd.to_datetime(result[col], format=None if temporal_format == "auto" else temporal_format)
            start_time = parsed_time
            end_time = parsed_time
        except Exception as e1:
            # Try parsing as range string (e.g., "2023-01-01/2023-01-31")
            try:
                ranges = result[col].str.split("[/,-]", expand=True)
                start_time = pd.to_datetime(ranges[0].str.strip())
                end_time = pd.to_datetime(ranges[1].str.strip())
            except Exception as e2:
                raise ValueError(f"Could not parse temporal column '{col}': {e1}. {e2}")
    elif len(temporal_column) == 2:
        # Assume start and end columns
        start_col, end_col = temporal_column
        try:
            if temporal_format == "iso":
                # Use ISO8601 format for ISO strings
                start_time = pd.to_datetime(result[start_col], format="ISO8601")
                end_time = pd.to_datetime(result[end_col], format="ISO8601")
            else:
                start_time = pd.to_datetime(result[start_col], format=None if temporal_format == "auto" else temporal_format)
                end_time = pd.to_datetime(result[end_col], format=None if temporal_format == "auto" else temporal_format)
        except Exception as e:
            raise ValueError(f"Could not parse temporal columns '{start_col}', '{end_col}': {e}")
    else:
        raise ValueError("Temporal information must be in one or two columns.")
    
    # Create temporal_range column (using Period for simplicity, might need Interval later)
    # For now, just store start and end times
    result["time_start"] = start_time
    result["time_end"] = end_time
    
    # Drop original temporal columns if they are not start/end
    cols_to_drop = [col for col in temporal_column if col not in ["time_start", "time_end"]]
    result = result.drop(columns=cols_to_drop, errors="ignore")
    
    return result
