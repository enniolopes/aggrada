"""
Aggregator module for the Aggrada package.

This module provides functions for aggregating data.
"""

from aggrada.aggregators.spatial import aggregate_spatial
from aggrada.aggregators.temporal import aggregate_temporal

__all__ = ["aggregate_spatial", "aggregate_temporal"]
