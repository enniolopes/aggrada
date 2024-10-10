# Spatial Reference System (SRS)

## Overview

This document outlines the Spatial Reference System (SRS) approach used in Aggrada for managing spatial data. Each polygon is stored with its **original geometry and SRID** (if available) and a **standardized geometry in SRID 4326 (WGS 84)**. This dual-storage strategy preserves data accuracy and supports global interoperability.

## Database Structure

The PostgreSQL table for storing polygons includes the following fields:

| **Column**          | **Description**                                                     |
| ------------------- | ------------------------------------------------------------------- |
| `geometry_original` | The polygon geometry in its original SRS as provided.               |
| `srid_original`     | The SRID number of the original geometry; `unknown` if unspecified. |
| `geometry_standard` | The polygon converted to the standard SRID 4326 (WGS 84).           |

### Examples

1. **IBGE Polygon**

   - **geometry_original**: IBGE polygon data
   - **srid_original**: `4674` (SIRGAS 2000)
   - **geometry_standard**: Converted polygon in SRID 4326

2. **User Polygon with Unknown SRS**
   - **geometry_original**: User-provided polygon data
   - **srid_original**: `unknown`
   - **geometry_standard**: Converted polygon in SRID 4326

## Common `srid_original` Values

Here are commonly used SRIDs for `srid_original` in Aggrada:

| **SRID**    | **Spatial Reference System**      | **Description**                                            |
| ----------- | --------------------------------- | ---------------------------------------------------------- |
| **4326**    | WGS 84                            | Global standard; widely used in GPS and mapping platforms. |
| **4674**    | SIRGAS 2000                       | Standard for Brazil, used by IBGE for national data.       |
| **3857**    | Pseudo-Mercator (Web Mercator)    | Common in web mapping (e.g., Google Maps, OSM).            |
| **4269**    | NAD83                             | Standard in North America for government data.             |
| **27700**   | British National Grid (OSGB 1936) | Standard for the United Kingdom.                           |
| **25832**   | ETRS89 / UTM zone 32N             | Standard for Western Europe, including Germany.            |
| **unknown** | -                                 | Used when the SRID is not provided or identifiable.        |

## Workflow for Storing and Converting SRS Data

1. **Receive Polygon Data**: Polygon data is received with its original geometry and SRID (if known).
2. **Store Original Geometry and SRID**:
   - If `srid_original` is known, store it alongside `geometry_original`.
   - If unknown, label `srid_original` as `unknown`.
3. **Convert to Standard Geometry**:
   - Convert `geometry_original` to SRID 4326 (WGS 84).
   - Store the converted geometry in `geometry_standard` to ensure global compatibility.

## Benefits of Dual-Storage System

- **Data Integrity**: Retaining `geometry_original` preserves the accuracy from the source data.
- **Global Compatibility**: Converting data to SRID 4326 in `geometry_standard` ensures interoperability with global GIS tools and APIs.
- **Flexibility**: Aggrada can accept data from multiple sources and regions while maintaining a consistent, compatible reference system.

## Handling Unknown SRIDs

For entries with an unknown SRID:

1. **Convert If Possible**: Attempt conversion to SRID 4326 based on available data or an approximate projection.
2. **Flag for Review**: Mark unknown SRID entries for potential validation or correction.
3. **Ensure Consistency**: All polygons will have a standardized entry in `geometry_standard` using SRID 4326, even if `srid_original` is unknown.

## Why Use SRID 4326 as the Standard?

1. **Global Standard**: SRID 4326 (WGS 84) is the most widely used spatial reference system, compatible with GPS and global mapping applications.
2. **Broad Tool Support**: GIS software, spatial databases, and mapping APIs are optimized for SRID 4326, simplifying integration.
3. **Scalability**: SRID 4326 meets Aggrada’s need for a flexible, scalable system that supports both global and regional spatial data.

## References

1. **EPSG Registry** - [EPSG Geodetic Parameter Dataset](https://epsg.org/home.html) provides SRID information, including SRID 4326 and SRID 4674.
2. **PostGIS Documentation** - [PostGIS Documentation](https://postgis.net/documentation/) offers guidance on using SRIDs in PostgreSQL.

## Conclusion

Aggrada’s SRS strategy maintains both data precision and compatibility by storing each polygon’s original geometry and SRID, alongside a standardized SRID 4326 version. This approach supports robust, scalable geospatial data management, enabling effective integration with diverse spatial data sources.
