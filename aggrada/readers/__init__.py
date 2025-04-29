"""
Reader module for the Aggrada package.

This module provides functions for reading data from various file formats.
"""

from aggrada.readers.csv import read_csv
from aggrada.readers.excel import read_excel
from aggrada.readers.shapefile import read_shapefile
from aggrada.readers.json import read_json

__all__ = ["read_csv", "read_excel", "read_shapefile", "read_json"]
