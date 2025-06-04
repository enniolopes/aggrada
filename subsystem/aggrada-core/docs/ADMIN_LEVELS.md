# Administrative Levels

## Overview

This document outlines Aggrada's administrative level hierarchy (`admin_level`), which extends OpenStreetMap (OSM) standards to accommodate Brazilian territorial divisions while maintaining international compatibility. This implementation ensures data consistency and long-term maintainability, particularly for Brazilian geographic data.

## Admin Levels Definition

### Brazilian Administrative Hierarchy

| **Admin Level** | **Description**          | **IBGE Equivalent**     | **Examples**                |
| --------------- | ------------------------ | ----------------------- | --------------------------- |
| **2**           | Country                  | País                    | Brazil                      |
| **4**           | State/Federal District   | Estado/Distrito Federal | São Paulo, Distrito Federal |
| **5**           | Mesoregion               | Mesorregião             | Metropolitana de São Paulo  |
| **6**           | Microregion              | Microrregião            | São Paulo (microregion)     |
| **7**           | Immediate Region         | Região Imediata         | São Paulo Immediate Region  |
| **8**           | Municipality             | Município               | São Paulo (city), Campinas  |
| **9**           | District                 | Distrito                | Subdivisão Municipal        |
| **10**          | Subdistrict/Neighborhood | Subdistrito/Bairro      | Moema, Pinheiros            |
| **11**          | Census Sector            | Setor Censitário        | IBGE Census Sectors         |
| **12**          | Block                    | Quadra                  | City blocks                 |
| **13**          | Address/Point            | Endereço/Ponto          | Specific locations          |

### Special Cases

- **Metropolitan Regions** (Level 5): Groups of municipalities forming metropolitan areas
- **Development Regions** (Level 5): Strategic planning regions
- **Indigenous Lands** (Level 9): Protected indigenous territories
- **Conservation Units** (Level 9): Environmental protection areas

## Implementation Details

### Key Features

1. **Dual Language Support**

   - English terms following OSM standards
   - Portuguese terms matching IBGE terminology
   - Direct mappings between equivalent terms

2. **Validation Functions**

   - `isValidBrazilianLevel()`: Validates admin levels for Brazil
   - `getParentLevel()`: Returns the parent level in the hierarchy

3. **Special Cases Handling**
   - Support for Brazilian-specific administrative divisions
   - Proper classification of special territories

## Best Practices

1. **Data Input**

   - Always validate admin levels using `isValidBrazilianLevel()`
   - Use English terms for international compatibility
   - Use Portuguese terms for Brazilian data sources

2. **Data Processing**

   - Consider parent-child relationships using `getParentLevel()`
   - Maintain hierarchical integrity in spatial operations
   - Handle special cases appropriately

3. **Data Output**
   - Provide both international and Brazilian classifications when relevant
   - Include proper metadata about the administrative level source

## Integration with Data Sources

### IBGE Integration

- Direct mapping to IBGE territorial divisions
- Support for census sectors and statistical areas
- Compatibility with IBGE's geographic datasets

### OpenStreetMap Compatibility

- Maintains OSM standard levels
- Extends hierarchy for Brazilian specifics
- Ensures international interoperability

## References

1. **IBGE Territorial Division**

   - [IBGE Geociências](https://www.ibge.gov.br/geociencias/organizacao-do-territorio/divisao-regional)
   - [IBGE Census Sectors](https://www.ibge.gov.br/geociencias/organizacao-do-territorio/malhas-territoriais/15774-malhas.html)

2. **OpenStreetMap Standards**
   - [OSM Administrative Boundaries](https://wiki.openstreetmap.org/wiki/Tag:boundary%3Dadministrative)
   - [OSM Brazil Guidelines](https://wiki.openstreetmap.org/wiki/Brazil)

## Maintenance Guidelines

1. **Regular Reviews**

   - Monitor IBGE territorial division updates
   - Check OSM standard changes
   - Update special cases as needed

2. **Version Control**

   - Document significant changes
   - Maintain backward compatibility
   - Consider data migration needs

3. **Quality Assurance**
   - Validate level consistency
   - Check hierarchical relationships
   - Test with real Brazilian datasets
