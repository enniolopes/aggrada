"""
Visualization utility module for the Aggrada package.

This module provides functions for visualizing data.
"""

import pandas as pd
import geopandas as gpd
from typing import Union, Dict, List, Optional, Tuple, Any
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.figure import Figure


def plot_data(
    data: Union[pd.DataFrame, gpd.GeoDataFrame],
    column: str = None,
    kind: str = "auto",
    title: str = None,
    figsize: Tuple[int, int] = (10, 8),
    **kwargs
) -> Figure:
    """
    Plot data with various visualization types.

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
    fig, ax = plt.subplots(figsize=figsize)
    
    # Determine the kind of plot if auto
    if kind == "auto":
        if isinstance(data, gpd.GeoDataFrame):
            kind = "choropleth"
        elif "time_start" in data.columns or "temporal_group" in data.columns:
            kind = "timeseries"
        elif column is not None and pd.api.types.is_numeric_dtype(data[column]):
            kind = "histogram"
        else:
            kind = "scatter"
    
    # Create the plot based on kind
    if kind == "choropleth" and isinstance(data, gpd.GeoDataFrame):
        # Choropleth map
        data.plot(column=column, ax=ax, legend=True, **kwargs)
    elif kind == "timeseries":
        # Time series plot
        time_col = "time_start" if "time_start" in data.columns else "temporal_group"
        if column is None:
            # Find a numeric column to plot
            numeric_cols = data.select_dtypes(include=[np.number]).columns
            if len(numeric_cols) > 0:
                column = numeric_cols[0]
            else:
                raise ValueError("No numeric column found for timeseries plot")
        
        # Sort by time
        plot_data = data.sort_values(time_col)
        ax.plot(plot_data[time_col], plot_data[column], **kwargs)
        ax.set_xlabel("Time")
        ax.set_ylabel(column)
    elif kind == "histogram":
        # Histogram
        if column is None:
            # Find a numeric column to plot
            numeric_cols = data.select_dtypes(include=[np.number]).columns
            if len(numeric_cols) > 0:
                column = numeric_cols[0]
            else:
                raise ValueError("No numeric column found for histogram plot")
        
        ax.hist(data[column], **kwargs)
        ax.set_xlabel(column)
        ax.set_ylabel("Frequency")
    elif kind == "scatter":
        # Scatter plot
        if column is None or "x" in kwargs or "y" in kwargs:
            # Use kwargs for x and y
            x = kwargs.pop("x", data.columns[0])
            y = kwargs.pop("y", data.columns[1] if len(data.columns) > 1 else data.columns[0])
        else:
            # Use column for y and first column for x
            y = column
            x = data.columns[0] if data.columns[0] != column else data.columns[1]
        
        ax.scatter(data[x], data[y], **kwargs)
        ax.set_xlabel(x)
        ax.set_ylabel(y)
    else:
        raise ValueError(f"Unsupported plot kind: {kind}")
    
    if title:
        ax.set_title(title)
    
    plt.tight_layout()
    return fig
