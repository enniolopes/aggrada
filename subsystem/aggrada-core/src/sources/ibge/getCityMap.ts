import {
  FeatureCollection,
  GeoJsonProperties,
  MultiPolygon,
  Polygon,
} from 'geojson';
import { SpatialSchema } from '../../types';
import { getIbgeCityRegistry } from './getCityRegistry';
import axios, { AxiosResponse } from 'axios';

const IBGE_API_MALHAS_URL =
  'https://servicodados.ibge.gov.br/api/v3/malhas/municipios';

type CustomProperties = GeoJsonProperties & {
  codarea: string;
};

/**
 * Function to get the IBGEMalhaMap of a specific city
 * @param cityId IBGE code of the city
 * @param year this is used at IBGE API to get the map by the specified year, it is used 2022 as default
 */
export const getCityMap = async ({
  cityId,
  year = 2022,
}: {
  cityId: string;
  year?: number;
}): Promise<SpatialSchema> => {
  const url = `${IBGE_API_MALHAS_URL}/${cityId}`;
  const params = {
    periodo: `${year}`,
    formato: 'application/vnd.geo+json',
    qualidade: 'maxima',
  };

  const response: AxiosResponse<
    FeatureCollection<Polygon | MultiPolygon, CustomProperties>
  > = await axios.get(url, {
    params,
    timeout: 10000,
  });

  const responseCity = response?.data?.features.find((item) => {
    return item.properties.codarea == cityId;
  });

  response?.data?.features[0].geometry?.coordinates;

  if (
    responseCity &&
    responseCity?.geometry?.type &&
    responseCity?.geometry?.coordinates
  ) {
    const cityRegistry = await getIbgeCityRegistry({
      ibgeCode: cityId,
    });

    return {
      code: cityId,
      name: cityRegistry.nome,
      level: 'municipality',
      source: 'ibge',
      startDate: new Date(Date.UTC(year, 0, 1)),
      properties: {
        apiUrl: `${url}?${new URLSearchParams(params).toString()}`,
        ...cityRegistry,
      },
      geometry: responseCity.geometry,
    };
  }
  throw new Error(`Error: IBGE code ${cityId} was not found in API response`);
};
