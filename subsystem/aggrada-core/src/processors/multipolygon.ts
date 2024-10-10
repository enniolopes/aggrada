import { FeatureCollection, MultiPolygon, Polygon } from 'geojson';

/**
 * Splits a MultiPolygon GeoJSON feature collection into an array of Polygon feature collections.
 * Each Polygon from the MultiPolygon will become a separate FeatureCollection.
 *
 * @param multiPolygonGeoJson - A FeatureCollection with MultiPolygon features.
 * @returns An array of FeatureCollection<Polygon>, each containing one Polygon.
 */
export const splitMultiPolygon = (
  multiPolygonGeoJson: FeatureCollection<MultiPolygon>
): FeatureCollection<Polygon>[] => {
  return multiPolygonGeoJson.features.flatMap((feature) => {
    if (feature.geometry.type === 'MultiPolygon') {
      return feature.geometry.coordinates.map((polygonCoords) => {
        return {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: polygonCoords,
              },
              properties: feature.properties,
            },
          ],
        };
      });
    }
    return [];
  });
};
