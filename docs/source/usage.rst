Usage
=====

This page provides examples of how to use the core functionality of Aggrada.

Reading Data
------------

Aggrada provides functions to read data from various formats. You can specify spatial and temporal columns during reading, and optionally index the data immediately.

.. code-block:: python

    import aggrada as ag

    # Read from CSV
    df_csv = ag.read_csv("data.csv", 
                         spatial_columns=["latitude", "longitude"], 
                         temporal_columns="timestamp", 
                         index_data=True)

    # Read from Excel
    df_excel = ag.read_excel("data.xlsx", 
                             sheet_name="Sheet1", 
                             spatial_columns="address", 
                             temporal_columns=["start_date", "end_date"],
                             index_data=True)

    # Read from Shapefile
    gdf_shape = ag.read_shapefile("boundaries.shp", 
                                  temporal_columns="event_date",
                                  index_data=True)

    # Read from JSON
    df_json = ag.read_json("data.json", 
                            spatial_columns="location_wkt", 
                            temporal_columns="datetime_iso",
                            index_data=True)

Indexing Data
-------------

If you didn't index the data during reading, you can use the `index` function:

.. code-block:: python

    import aggrada as ag
    import pandas as pd

    # Sample DataFrame
    data = pd.DataFrame({
        "lat": [40.71, 34.05],
        "lon": [-74.00, -118.24],
        "time": ["2023-01-15T10:00:00", "2023-01-16T12:30:00"],
        "value": [10, 20]
    })

    # Index the data
    indexed_data = ag.index(data, 
                            spatial_column=["lat", "lon"], 
                            temporal_column="time",
                            crs="EPSG:4326")

    print(indexed_data)

Aggregating Data
----------------

Once the data is indexed (containing `geometry` and `time_start`/`time_end` columns), you can aggregate it spatially and temporally.

.. code-block:: python

    # Aggregate the indexed data
    aggregated_data = ag.aggregate(
        indexed_data, 
        spatial_granularity="grid", # Use a predefined grid or administrative level
        temporal_granularity="day", # Aggregate by day
        agg_functions={"value": "sum", "count": "size"} # Specify aggregation functions
    )

    print(aggregated_data)

Evaluating Consistency
----------------------

After aggregation, you can evaluate the consistency of the results.

.. code-block:: python

    # Evaluate consistency metrics
    consistency_metrics = ag.evaluate_consistency(aggregated_data)

    print(consistency_metrics)

Plotting Data
-------------

Aggrada provides a simple plotting function to visualize the data.

.. code-block:: python

    # Plot the aggregated data (map)
    fig_map = ag.plot(aggregated_data, column="value_sum", title="Aggregated Value Sum")
    fig_map.show()

    # Plot original data (time series)
    fig_ts = ag.plot(indexed_data, column="value", kind="timeseries", title="Value over Time")
    fig_ts.show()

