Examples
========

This page provides complete examples of using Aggrada for different scenarios.

Example 1: Aggregating Point Data
---------------------------------

This example shows how to aggregate point data (e.g., sensor readings) at different spatial and temporal granularities.

.. code-block:: python

    import aggrada as ag
    import pandas as pd
    import matplotlib.pyplot as plt
    
    # Create sample data (temperature readings from sensors)
    data = pd.DataFrame({
        "sensor_id": ["S001", "S002", "S003", "S004", "S001", "S002", "S003", "S004"],
        "latitude": [40.712, 40.714, 40.710, 40.718, 40.712, 40.714, 40.710, 40.718],
        "longitude": [-74.006, -74.012, -74.008, -74.004, -74.006, -74.012, -74.008, -74.004],
        "timestamp": [
            "2023-01-15T08:00:00", "2023-01-15T08:05:00", "2023-01-15T08:10:00", "2023-01-15T08:15:00",
            "2023-01-15T09:00:00", "2023-01-15T09:05:00", "2023-01-15T09:10:00", "2023-01-15T09:15:00"
        ],
        "temperature": [22.5, 23.1, 22.8, 23.4, 24.2, 24.5, 24.0, 24.8]
    })
    
    # Index the data spatially and temporally
    indexed_data = ag.index(
        data,
        spatial_column=["latitude", "longitude"],
        temporal_column="timestamp",
        spatial_type="point",
        temporal_format="iso"
    )
    
    # Aggregate by grid cells and hourly intervals
    aggregated_data = ag.aggregate(
        indexed_data,
        spatial_granularity="grid",
        temporal_granularity="hour",
        agg_functions={
            "temperature": "mean",
            "count": "size"
        }
    )
    
    # Evaluate consistency of the aggregated data
    consistency = ag.evaluate_consistency(aggregated_data)
    print(f"Consistency metrics: {consistency}")
    
    # Plot the aggregated data
    fig = ag.plot(
        aggregated_data,
        column="temperature",
        title="Average Temperature by Grid Cell and Hour",
        figsize=(12, 8)
    )
    plt.savefig("temperature_map.png")
    plt.close()
    
    # Plot time series
    fig = ag.plot(
        aggregated_data,
        column="temperature",
        kind="timeseries",
        title="Temperature Over Time",
        figsize=(12, 6)
    )
    plt.savefig("temperature_timeseries.png")
    plt.close()

Example 2: Combining Data from Multiple Sources
----------------------------------------------

This example demonstrates how to combine and aggregate data from multiple heterogeneous sources.

.. code-block:: python

    import aggrada as ag
    import pandas as pd
    import numpy as np
    
    # Source 1: Weather station data (CSV)
    weather_data = pd.DataFrame({
        "station_id": ["W001", "W002", "W003", "W001", "W002", "W003"],
        "lat": [40.71, 40.73, 40.75, 40.71, 40.73, 40.75],
        "lon": [-74.01, -74.03, -74.05, -74.01, -74.03, -74.05],
        "date": ["2023-01-15", "2023-01-15", "2023-01-15", "2023-01-16", "2023-01-16", "2023-01-16"],
        "temperature": [22.5, 23.1, 22.8, 24.2, 24.5, 24.0],
        "humidity": [65, 68, 70, 62, 64, 67]
    })
    
    # Source 2: Air quality data (different format, different temporal resolution)
    air_quality_data = pd.DataFrame({
        "monitor_code": ["AQ1", "AQ2", "AQ1", "AQ2"],
        "location": ["40.72,-74.02", "40.74,-74.04", "40.72,-74.02", "40.74,-74.04"],
        "time_period": ["2023-01-15/2023-01-16", "2023-01-15/2023-01-16", 
                        "2023-01-16/2023-01-17", "2023-01-16/2023-01-17"],
        "pm25": [12.3, 14.5, 13.2, 15.1],
        "ozone": [0.032, 0.041, 0.035, 0.038]
    })
    
    # Index weather data
    weather_indexed = ag.index(
        weather_data,
        spatial_column=["lat", "lon"],
        temporal_column="date",
        spatial_type="point",
        temporal_format="auto"
    )
    
    # Index air quality data (with different formats)
    air_quality_indexed = ag.index(
        air_quality_data,
        spatial_column="location",
        temporal_column="time_period",
        spatial_type="point",
        temporal_format="auto"
    )
    
    # Combine the datasets
    # First, ensure they have the same columns
    weather_indexed = weather_indexed.drop(columns=["station_id"])
    air_quality_indexed = air_quality_indexed.drop(columns=["monitor_code"])
    
    # Combine the datasets
    combined_data = pd.concat([weather_indexed, air_quality_indexed], ignore_index=True)
    
    # Aggregate at a common granularity
    aggregated_data = ag.aggregate(
        combined_data,
        spatial_granularity="grid",
        temporal_granularity="day",
        agg_functions={
            "temperature": "mean",
            "humidity": "mean",
            "pm25": "mean",
            "ozone": "mean",
            "count": "size"
        }
    )
    
    # Evaluate consistency
    consistency = ag.evaluate_consistency(aggregated_data)
    print(f"Consistency metrics for combined data: {consistency}")
    
    # Plot the aggregated data
    fig = ag.plot(
        aggregated_data,
        column="temperature",
        title="Average Temperature by Grid Cell and Day",
        figsize=(12, 8)
    )
    
    # You can also plot other variables
    fig = ag.plot(
        aggregated_data,
        column="pm25",
        title="Average PM2.5 by Grid Cell and Day",
        figsize=(12, 8)
    )

Example 3: Working with Administrative Boundaries
------------------------------------------------

This example shows how to aggregate data using administrative boundaries.

.. code-block:: python

    import aggrada as ag
    import pandas as pd
    import geopandas as gpd
    from shapely.geometry import Point
    
    # Sample data (population by location)
    population_data = pd.DataFrame({
        "location_id": range(1, 11),
        "latitude": [40.71, 40.73, 40.75, 40.72, 40.74, 
                     40.76, 40.71, 40.73, 40.75, 40.72],
        "longitude": [-74.01, -74.03, -74.05, -74.02, -74.04, 
                      -74.06, -74.07, -74.08, -74.09, -74.10],
        "year": [2020, 2020, 2020, 2020, 2020, 
                 2021, 2021, 2021, 2021, 2021],
        "population": [1200, 1500, 1800, 1300, 1600, 
                       1250, 1550, 1850, 1350, 1650],
        "income": [45000, 48000, 52000, 46000, 49000, 
                   46000, 49000, 53000, 47000, 50000]
    })
    
    # Create a GeoDataFrame with point geometry
    geometry = [Point(xy) for xy in zip(population_data.longitude, population_data.latitude)]
    gdf = gpd.GeoDataFrame(population_data, geometry=geometry, crs="EPSG:4326")
    
    # Index the data temporally (it's already spatial)
    indexed_data = ag.index(
        gdf,
        spatial_column="geometry",  # Use existing geometry
        temporal_column="year",
        temporal_format="auto"
    )
    
    # Aggregate by administrative boundaries (simplified example)
    # In a real scenario, you would use actual administrative boundary shapefiles
    aggregated_data = ag.aggregate(
        indexed_data,
        spatial_granularity="municipality",  # This would use administrative boundaries
        temporal_granularity="year",
        agg_functions={
            "population": "sum",
            "income": "mean",
            "count": "size"
        }
    )
    
    # Evaluate consistency
    consistency = ag.evaluate_consistency(aggregated_data)
    print(f"Consistency metrics: {consistency}")
    
    # Plot the aggregated data
    fig = ag.plot(
        aggregated_data,
        column="population",
        title="Total Population by Municipality and Year",
        figsize=(12, 8)
    )
    
    # Plot income data
    fig = ag.plot(
        aggregated_data,
        column="income",
        title="Average Income by Municipality and Year",
        figsize=(12, 8)
    )
