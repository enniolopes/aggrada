# Administrative Levels

## Overview

This document outlines the administrative level hierarchy (`admin_level`) based on the widely adopted standards from **OpenStreetMap (OSM)**. The `admin_level` is a global standard used to classify and structure different administrative regions (e.g., countries, states, cities) within a hierarchical framework. This standard ensures data consistency, interoperability, and scalability across different geographic regions, supporting Aggrada’s mission to handle spatial data effectively.

## Admin Levels Definition

In OpenStreetMap, the `admin_level` values range from 1 to 12, where each level represents a specific level of administrative division. The interpretation of these levels may vary by country due to different regional structures. Below is a summary of commonly used `admin_level` definitions:

| **Admin Level** | **Description**                                 | **Examples**                                            |
| --------------- | ----------------------------------------------- | ------------------------------------------------------- |
| **1**           | Supranational organization                      | European Union, African Union                           |
| **2**           | Country                                         | United States, Brazil, Germany                          |
| **3**           | Autonomous regions or special territories       | Greenland (Denmark), Hawaii (USA)                       |
| **4**           | State, province, or major administrative region | State of California, Province of Ontario, Bavaria       |
| **5**           | Intermediate divisions                          | French departments, Australian territories              |
| **6**           | County or district                              | US counties, German administrative districts            |
| **7**           | Smaller subdivisions or subdistricts            | Paris arrondissements, smaller regional sectors         |
| **8**           | Municipality or city                            | Cities, towns, and municipalities (e.g., San Francisco) |
| **9**           | City subdivisions                               | Urban zones, neighborhood clusters                      |
| **10**          | Neighborhood, subdistrict                       | Local neighborhoods, community districts                |
| **11**          | Minor areas or block divisions                  | Residential blocks, local sectors                       |
| **12**          | Street or block-level areas                     | Individual streets, specific residential blocks         |

## Why OpenStreetMap’s Admin Levels?

### 1. Global Standardization and Flexibility

Using OpenStreetMap’s `admin_level` as the standard for Aggrada allows for flexible and consistent data representation across various regions globally. Each country can adapt the administrative levels to suit its specific regional hierarchy while following a globally recognized standard.

### 2. Compatibility with GIS Tools and APIs

The OSM `admin_level` is widely supported by GIS tools, mapping libraries, and spatial databases, including **QGIS, ArcGIS, Leaflet, and Mapbox**. Additionally, popular APIs like **Google Maps** and **Bing Maps** align closely with similar hierarchical levels, facilitating integration with Aggrada’s spatial data infrastructure.

### 3. Scalability for Hierarchical Data Structure

The `admin_level` structure supports scalability, enabling Aggrada to handle data ranging from country-level down to street-level details. This adaptability makes it ideal for use cases that require multiple levels of geographic granularity.

### 4. Consistency Across Sources and Interoperability

By using a consistent `admin_level` framework, Aggrada can integrate spatial data from multiple sources seamlessly. For example, data from the **IBGE** (Brazil’s Institute of Geography and Statistics) or **GADM** (Global Administrative Areas) can be aligned within this hierarchy, improving interoperability across datasets.

## References

1. **OpenStreetMap Documentation** - [OSM Administrative Boundaries](https://wiki.openstreetmap.org/wiki/Tag:boundary%3Dadministrative)
2. **ISO 3166-2 Codes** - Used for country subdivision codes, providing additional compatibility and context for administrative levels below the country level. [ISO 3166-2 Codes](https://www.iso.org/iso-3166-country-codes.html)
3. **Geonames.org** - A global geographic database used for location names and administrative data, useful as an alternative or supplement to OSM admin levels. [Geonames](https://www.geonames.org/)

## **Limitations and Considerations**

While OSM’s `admin_level` offers many advantages, there are some limitations:

- **Regional Variability**: Different countries may interpret the same `admin_level` differently, requiring some contextual adjustment.
- **Limited Granularity Below Neighborhood Level**: The `admin_level` structure is limited in representing extremely granular divisions, such as individual residential blocks or specific property plots.
- **Community-Driven Accuracy**: OpenStreetMap data relies on community contributions, so data quality may vary across different areas and regions.

### Conclusion

The **OpenStreetMap `admin_level` hierarchy** is chosen for Aggrada due to its global acceptance, flexibility, and compatibility with a wide range of GIS tools and APIs. While it may have some limitations, it provides an effective and adaptable framework for handling hierarchical geographic data across multiple regions and scales. This makes it a valuable standard for Aggrada’s needs, enabling efficient, scalable, and consistent data management.

---

This document provides an overview of the decision rationale and technical details behind adopting the OpenStreetMap `admin_level` as the standard for administrative levels within Aggrada.
