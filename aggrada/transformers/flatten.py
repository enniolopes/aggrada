"""
Flatten transformer module for the Aggrada package.

This module provides functions for flattening nested data structures.
"""

import pandas as pd
from typing import Dict, Any, List, Union


def flatten_object(
    obj: Dict[str, Any],
    parent_key: str = '',
    separator: str = '_'
) -> Dict[str, Any]:
    """
    Flatten a nested dictionary or JSON object.

    Parameters
    ----------
    obj : dict
        The nested dictionary to flatten
    parent_key : str, default ''
        The parent key for nested dictionaries
    separator : str, default '_'
        The separator to use between keys

    Returns
    -------
    dict
        Flattened dictionary
    """
    items = []
    for key, value in obj.items():
        new_key = f"{parent_key}{separator}{key}" if parent_key else key
        
        if isinstance(value, dict):
            items.extend(flatten_object(value, new_key, separator).items())
        elif isinstance(value, list):
            if len(value) > 0 and isinstance(value[0], dict):
                # Handle list of dictionaries
                for i, item in enumerate(value):
                    items.extend(flatten_object(item, f"{new_key}{separator}{i}", separator).items())
            else:
                # Handle simple lists
                items.append((new_key, value))
        else:
            items.append((new_key, value))
    
    return dict(items)


def flatten_dataframe(
    df: pd.DataFrame,
    columns: Union[str, List[str]] = None,
    separator: str = '_'
) -> pd.DataFrame:
    """
    Flatten nested columns in a DataFrame.

    Parameters
    ----------
    df : DataFrame
        The DataFrame to transform
    columns : str or list of str, optional
        Column name(s) containing nested data to flatten.
        If None, all object columns will be checked.
    separator : str, default '_'
        The separator to use between keys

    Returns
    -------
    DataFrame
        DataFrame with flattened columns
    """
    # Make a copy to avoid modifying the original
    result = df.copy()
    
    # If columns not specified, check all object columns
    if columns is None:
        columns = result.select_dtypes(include=['object']).columns.tolist()
    elif isinstance(columns, str):
        columns = [columns]
    
    # Process each column
    for col in columns:
        if col not in result.columns:
            continue
        
        # Check if column contains dictionaries
        if result[col].apply(lambda x: isinstance(x, dict)).any():
            # Flatten each dictionary in the column
            flattened = result[col].apply(lambda x: flatten_object(x, '', separator) if isinstance(x, dict) else {})
            
            # Convert to DataFrame and join with original
            flat_df = pd.json_normalize(flattened.tolist())
            
            # Rename columns to include original column name
            flat_df.columns = [f"{col}{separator}{c}" for c in flat_df.columns]
            
            # Join with original DataFrame
            result = pd.concat([result.drop(columns=[col]), flat_df], axis=1)
    
    return result
