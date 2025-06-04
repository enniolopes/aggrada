import fs from 'node:fs';
import path from 'node:path';

import { FeatureCollection, Feature, Geometry, Position } from 'geojson';
import { SpatialCore } from '../Types';

/**
 * Removes Z dimension from GeoJSON coordinates
 * @param geojson The GeoJSON object to process
 */
const removeZDimension = (geojson: FeatureCollection): void => {
  if (!geojson.features) return;
  
  geojson.features.forEach(feature => {
    if (!feature.geometry) return;
    
    const geometry = feature.geometry;
    
    if (geometry.type === 'Point' && Array.isArray(geometry.coordinates)) {
      // For Point geometries: [lng, lat, z?] -> [lng, lat]
      if (geometry.coordinates.length > 2) {
        geometry.coordinates = geometry.coordinates.slice(0, 2);
      }
    } 
    else if (geometry.type === 'LineString' && Array.isArray(geometry.coordinates)) {
      // For LineString: array of points
      geometry.coordinates = geometry.coordinates.map((point: Position) => 
        point.length > 2 ? point.slice(0, 2) : point
      );
    }
    else if (geometry.type === 'Polygon' && Array.isArray(geometry.coordinates)) {
      // For Polygon: array of rings (arrays of points)
      geometry.coordinates = geometry.coordinates.map((ring: Position[]) => 
        ring.map((point: Position) => point.length > 2 ? point.slice(0, 2) : point)
      );
    }
    else if ((geometry.type === 'MultiPoint' || geometry.type === 'MultiLineString') && 
             Array.isArray(geometry.coordinates)) {
      if (geometry.type === 'MultiPoint') {
        // MultiPoint: array of points
        geometry.coordinates = geometry.coordinates.map((point: Position) => 
          point.length > 2 ? point.slice(0, 2) : point
        );
      } else {
        // MultiLineString: array of line segments
        geometry.coordinates = geometry.coordinates.map((line: Position[]) =>
          line.map((point: Position) => point.length > 2 ? point.slice(0, 2) : point)
        );
      }
    }
    else if (geometry.type === 'MultiPolygon' && Array.isArray(geometry.coordinates)) {
      // For MultiPolygon: array of polygons
      geometry.coordinates = geometry.coordinates.map((polygon: Position[][]) =>
        polygon.map((ring: Position[]) =>
          ring.map((point: Position) => point.length > 2 ? point.slice(0, 2) : point)
        )
      );
    }
    else if (geometry.type === 'GeometryCollection' && Array.isArray(geometry.geometries)) {
      // Handle collections by recursively processing each geometry
      geometry.geometries.forEach((geom: any) => {
        const tempFeature = {
          type: 'Feature' as const,  // Use const assertion to fix the type
          geometry: geom,
          properties: {}
        };
        removeZDimension({ type: 'FeatureCollection', features: [tempFeature] });
      });
    }
  });
};

/**
 * Attempts to determine the SRID from GeoJSON properties or metadata
 * @param properties The properties object from a GeoJSON feature
 * @returns SRID string or 'unknown' if not recognized
 */
const getSRIDFromProperties = (properties: any): SpatialCore['raw_srid'] => {
  // Common property names that might contain CRS/SRID information
  if (properties?.crs?.properties?.name) {
    const crsName = properties.crs.properties.name;
    if (typeof crsName === 'string') {
      // Handle EPSG code formats like "urn:ogc:def:crs:EPSG::4326" or "EPSG:4326"
      const epsgMatch = crsName.match(/EPSG[:\s](\d+)/i);
      if (epsgMatch && epsgMatch[1]) {
        return epsgMatch[1];
      }
    }
  }
  
  // Check for known SRID in other common property locations
  if (properties?.srid) return properties.srid;
  if (properties?.SRID) return properties.SRID;
  if (properties?.crs_code) return properties.crs_code;
  
  // Default to WGS 84 (4326) as it's the most common for GeoJSON
  return '4326';
};

/**
 * Reads a GeoJSON file and returns an array of SpatialCore objects.
 * @param filePath - Path to the GeoJSON file.
 * @param options - Additional options for processing the GeoJSON data.
 * @returns An array of SpatialCore objects.
 */
export const readGeoJSON = async ({
  filePath,
  srid,
  codeKey,
  nameKey,
  level,
  source = 'user',
}: {
  filePath: string;
  srid?: SpatialCore['raw_srid'];
  codeKey?: string;
  nameKey?: string;
  level?: string;
  source?: string;
}): Promise<SpatialCore[]> => {
  try {
    // Read the GeoJSON file
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');
    const geojsonData: FeatureCollection = JSON.parse(fileContent);
    
    if (!geojsonData.features || !Array.isArray(geojsonData.features)) {
      throw new Error('Invalid GeoJSON: missing or invalid features array');
    }
    
    // Remove Z dimension from features if present
    removeZDimension(geojsonData);

    // Process each feature in the GeoJSON
    const spatialData: SpatialCore[] = geojsonData.features.map((feature: Feature) => {
      const properties = feature.properties || {};
      
      // Determine SRID - use provided srid, try to extract from properties, or default
      const featureSrid = srid || getSRIDFromProperties(geojsonData) || 'unknown';
      
      // Extract code and name from properties using the provided keys or defaults
      const code = codeKey && properties[codeKey] !== undefined
        ? properties[codeKey]
        : properties.id || properties.ID || properties.code || properties.CODE;
      
      const name = nameKey && properties[nameKey] !== undefined
        ? properties[nameKey]
        : properties.name || properties.NAME || properties.nome || properties.NOME;

      // Create the SpatialCore object
      const spatialItem: SpatialCore = {
        code,
        name,
        admin_level: level || properties.level || properties.admin_level,
        source,
        // Default to Unix epoch start if no date is provided
        startDate: new Date('1970-01-01T00:00:00Z'),
        properties: {
          file: path.basename(filePath),
          fileFormat: 'geojson',
          ...properties,
        },
        geometry: feature.geometry as Geometry,
        raw_srid: featureSrid,
      };

      return spatialItem;
    });

    return spatialData;
  } catch (error) {
    console.error('Error reading GeoJSON file:', error);
    throw error;
  }
};
