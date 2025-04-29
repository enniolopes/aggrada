---
title: 'Aggrada: A Python library for automatic spatiotemporal aggregation of heterogeneous raw data'
authors:
  - name: Ennio Politi Lopes
    orcid: XXXX-XXXX-XXXX-XXXX # Placeholder - User needs to provide ORCID
    affiliation: 1
  - name: Alexandre Cláudio Botazzo Delbem
    orcid: 0000-0003-1810-1742
    affiliation: 1
affiliations:
 - name: Institute of Mathematical and Computer Sciences, University of São Paulo (ICMC-USP), São Carlos, Brazil
   index: 1
date: 28 April 2025
bibliography: paper.bib
---

# Summary

Aggrada is a Python library designed to simplify and automate the process of aggregating heterogeneous raw data from multiple sources based on user-defined spatial and temporal granularities. Handling diverse data formats (e.g., CSV, Excel, Shapefile, JSON) and aligning them across different spatial resolutions (e.g., administrative boundaries, grids) and temporal intervals (e.g., daily, monthly, yearly) is a common challenge in various domains, including urban planning, environmental monitoring, public health, and social sciences. Aggrada provides a streamlined workflow for indexing raw data, transforming it into a consistent spatiotemporal format, and performing flexible aggregation operations, enabling researchers and practitioners to focus on analysis rather than data wrangling.

# Statement of Need

Integrating data from disparate sources often requires significant manual effort in data cleaning, format conversion, spatial joining, and temporal resampling. Existing tools may specialize in either spatial or temporal processing, or require extensive coding for specific data types and aggregation schemes. Aggrada addresses this need by offering a unified framework that:

*   Supports common raw data formats (CSV, Excel, Shapefile, JSON).
*   Automatically indexes data spatially (creating GeoPandas geometries from coordinates, addresses, or codes) and temporally (creating standardized time intervals).
*   Provides flexible aggregation based on predefined (e.g., administrative levels - conceptual, grid implemented) or custom spatial units and standard temporal intervals (day, week, month, year, etc.) or custom temporal groups.
*   Leverages the power of established Python libraries like Pandas [@pandas], GeoPandas [@geopandas], and Shapely [@shapely] for efficient data manipulation and spatial operations.
*   Offers basic consistency evaluation metrics and visualization capabilities.

Aggrada aims to reduce the barrier to entry for complex spatiotemporal data integration tasks, promoting reproducible research and facilitating data-driven decision-making.

# Functionality

The core workflow in Aggrada involves two main steps:

1.  **Indexing (`aggrada.index`)**: This function takes a Pandas DataFrame or GeoDataFrame and converts specified spatial and temporal columns into standardized `geometry` (GeoPandas) and `time_start`/`time_end` (Pandas datetime) columns. It handles various input formats for spatial data (latitude/longitude, WKT polygons, addresses via geocoding - conceptual) and temporal data (single timestamp, start/end times, date strings with various formats).

2.  **Aggregation (`aggrada.aggregate`)**: This function takes the indexed GeoDataFrame and performs aggregation based on the specified `spatial_granularity` and `temporal_granularity`. Users provide a dictionary of aggregation functions (e.g., `{'value': 'mean', 'count': 'size'}`) to apply to data columns. Spatial aggregation can be performed using grids or custom grouping columns. Temporal aggregation supports standard intervals (year, month, day, etc.) or custom grouping columns.

Additional utilities include data validation (`aggrada.utils.validation`), consistency evaluation (`aggrada.evaluate_consistency`), and plotting (`aggrada.plot`).

# Example Usage

```python
import aggrada as ag
import pandas as pd

# Load raw data (e.g., from CSV)
df = pd.read_csv("sensor_readings.csv")

# Index the data spatially (lat/lon) and temporally (timestamp string)
indexed_data = ag.index(
    df,
    spatial_column=["latitude", "longitude"],
    temporal_column="timestamp",
    spatial_type="point",
    temporal_format="iso" # Assuming ISO8601 format
)

# Aggregate data: mean value per grid cell per day
aggregated_data = ag.aggregate(
    indexed_data,
    spatial_granularity="grid",
    temporal_granularity="day",
    agg_functions={"value": "mean", "count": "size"}
)

# Plot the aggregated values on a map
ag.plot(aggregated_data, column="value", title="Mean Daily Value per Grid Cell")
```

# Acknowledgements

We acknowledge contributions from the developers of Pandas, GeoPandas, Shapely, and other open-source libraries that Aggrada builds upon.

# References

