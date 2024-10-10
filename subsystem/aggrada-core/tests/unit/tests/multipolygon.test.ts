import { FeatureCollection, MultiPolygon } from 'geojson';
import { splitMultiPolygon } from 'src/processors';

describe('splitMultiPolygon', () => {
  test('should split MultiPolygon into individual Polygon FeatureCollections', () => {
    const multiPolygonGeoJson: FeatureCollection<MultiPolygon> = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'MultiPolygon',
            coordinates: [
              [
                [
                  [0, 0],
                  [0, 1],
                  [1, 1],
                  [1, 0],
                  [0, 0],
                ],
              ],
              [
                [
                  [2, 2],
                  [2, 3],
                  [3, 3],
                  [3, 2],
                  [2, 2],
                ],
              ],
            ],
          },
          properties: { id: 'testMultiPolygon' },
        },
      ],
    };

    const result = splitMultiPolygon(multiPolygonGeoJson);

    expect(result).toHaveLength(2); // Deve haver dois FeatureCollections (um para cada Polygon)

    expect(result[0]).toEqual({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [0, 0],
                [0, 1],
                [1, 1],
                [1, 0],
                [0, 0],
              ],
            ],
          },
          properties: { id: 'testMultiPolygon' },
        },
      ],
    });

    expect(result[1]).toEqual({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [2, 2],
                [2, 3],
                [3, 3],
                [3, 2],
                [2, 2],
              ],
            ],
          },
          properties: { id: 'testMultiPolygon' },
        },
      ],
    });
  });

  test('should return an empty array if no MultiPolygon features are provided', () => {
    const emptyGeoJson: FeatureCollection<MultiPolygon> = {
      type: 'FeatureCollection',
      features: [],
    };

    const result = splitMultiPolygon(emptyGeoJson);

    expect(result).toEqual([]);
  });

  test('should handle empty MultiPolygon geometry', () => {
    const emptyMultiPolygonGeoJson: FeatureCollection<MultiPolygon> = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'MultiPolygon',
            coordinates: [],
          },
          properties: { id: 'emptyMultiPolygon' },
        },
      ],
    };

    const result = splitMultiPolygon(emptyMultiPolygonGeoJson);

    expect(result).toEqual([]);
  });
});
