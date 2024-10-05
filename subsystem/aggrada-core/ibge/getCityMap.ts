/* eslint-disable no-console */
import axios, { AxiosResponse } from 'axios';
// import { ModelColumns } from '@ttoss/postgresdb';
// import { db } from '@simple4decision/postgresdb';

const IBGE_API_MALHAS_URL =
  'https://servicodados.ibge.gov.br/api/v3/malhas/municipios';

type Coordinates = number[][];

/**
 * For new types of Geometry add the interface below MultiPolygonGeometry
 * And add this new interface as a option of GeoJSON type
 */
interface PolygonGeometry {
  type: 'Polygon';
  coordinates: Coordinates[];
}

interface MultiPolygonGeometry {
  type: 'MultiPolygon';
  coordinates: Coordinates[][];
}

interface Feature<T> {
  type: 'Feature';
  geometry: T;
  properties: {
    codarea: string;
  };
}

interface FeatureCollection<T> {
  type: 'FeatureCollection';
  features: Feature<T>[];
}

/**
 * Generic GeoJSON that can be Polygon or MultiPolygon
 */
type IBGEMalhaMap =
  | FeatureCollection<PolygonGeometry>
  | FeatureCollection<MultiPolygonGeometry>;

type AggradaSpatial = {
  geo_code?: string;
  source?: string;
  start_date?: Date;
  metadata?: object;
  geometry: {
    type: string;
    coordinates: Array<object>;
  };
  core_file_id?: string;
};

/**
 * Function to get the IBGEMalhaMap of a specific city
 * @param cityId IBGE code of the city
 */
export const getCityMap = async ({
  cityId,
  year = 2022,
}: {
  cityId: string;
  year?: number;
}): Promise<AggradaSpatial> => {
  const url = `${IBGE_API_MALHAS_URL}/${cityId}`;
  const params = {
    periodo: `${year}`,
    formato: 'application/vnd.geo+json',
    qualidade: 'maxima',
  };

  try {
    const response: AxiosResponse<IBGEMalhaMap> = await axios.get(url, {
      params,
      timeout: 10000,
    });

    const responseCity = response?.data?.features.find((item) => {
      return item.properties.codarea == cityId;
    });

    if (
      responseCity &&
      responseCity?.geometry?.type &&
      responseCity?.geometry?.coordinates
    ) {
      return {
        geo_code: cityId,
        source: 'IBGE',
        start_date: new Date(Date.UTC(year, 0, 1)),
        metadata: {
          apiUrl: `${url}?${new URLSearchParams(params).toString()}`,
        },
        geometry: responseCity?.geometry,
      };
    }
    throw new Error('IBGE code do not match with response');
  } catch (err) {
    console.error(
      `Error accessing the IBGE API for the city ${cityId}:\n${err}`
    );
    throw err;
  }
};
