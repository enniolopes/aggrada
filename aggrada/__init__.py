"""
Aggrada - Automatic spatiotemporal aggregation of multi-source heterogeneous raw data at multiple granularities.

This package provides tools for reading, indexing, aggregating, and analyzing spatiotemporal data
from multiple heterogeneous sources.
"""

__version__ = "0.1.0"

from aggrada.core import (
    index,
    aggregate,
    evaluate_consistency,
    plot
)

from aggrada.readers import (
    read_csv,
    read_excel,
    read_shapefile,
    read_json
)

# Make submodules available for import
from aggrada import readers
from aggrada import transformers
from aggrada import aggregators
from aggrada import utils
