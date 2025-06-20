import { Spatial } from '../../Models';
import { fetchIbgeLocality, fetchIbgeAllLocalities } from './localitiesApi';
import { ibgeLocalitiesAdminLevel } from './adminLevelMap';
import axios from 'axios';

/**
 * API documentation
 * https://servicodados.ibge.gov.br/api/docs/malhas?versao=3
 * https://servicodados.ibge.gov.br/api/docs/malhas?versao=4
 */

export const ibgeGeoMeshesLocalities = [
  'paises',
  'regioes',
  'estados',
  'mesorregioes',
  'microrregioes',
  'regioes-imediatas',
  'regioes-intermediarias',
  'municipios',
];

export type GeoMeshes = (typeof ibgeGeoMeshesLocalities)[number];

export const brazilStartDate = ({ year }: { year: number }) => {
  return `${year}-01-01T00:00:00-03:00`;
};

const getIbgeGeoMeshesUrl = ({
  locality,
  id,
  year,
}: {
  locality: GeoMeshes;
  id: string;
  year: number;
}): {
  url: string;
  params: Record<string, string>;
} => {
  if (+year >= 2019 && +year <= 2022) {
    return {
      url: `https://servicodados.ibge.gov.br/api/v3/malhas/${locality}/${id}`,
      params: {
        periodo: `${year}`,
        formato: 'application/vnd.geo+json',
        qualidade: 'maxima',
      },
    };
  }

  if (+year <= 2018) {
    return {
      url: `http://servicodados.ibge.gov.br/api/v2/malhas/${id}`,
      params: {
        resolucao: '0',
        formato: 'application/vnd.geo+json',
        qualidade: '4',
      },
    };
  }

  return {
    url: `https://servicodados.ibge.gov.br/api/v4/malhas/${locality}/${id}`,
    params: {},
  };
};

const getIbgeGeoMeshesMetadataUrl = ({
  locality,
  id,
  year,
}: {
  locality: GeoMeshes;
  id: string;
  year: number;
}): {
  url: string;
  params: Record<string, string>;
} | null => {
  if (+year >= 2019 && +year <= 2022) {
    return {
      url: `https://servicodados.ibge.gov.br/api/v3/malhas/${locality}/${id}/metadados`,
      params: {},
    };
  }

  if (+year <= 2018) {
    return null;
  }

  return {
    url: `https://servicodados.ibge.gov.br/api/v4/malhas/${locality}/${id}/metadados`,
    params: {},
  };
};

const fetchIbgeGeoMeshesMetadataUrl = async ({
  locality,
  id,
  year,
}: {
  locality: GeoMeshes;
  id: string;
  year: number;
}) => {
  const metadaApi = getIbgeGeoMeshesMetadataUrl({ locality, id, year });

  if (metadaApi) {
    const response = await axios.get(metadaApi.url, {
      params: metadaApi.params,
      timeout: 10000,
    });
    return response.data[0];
  }

  return {};
};

export const fetchIbgeLocalityMap = async ({
  locality,
  ibgeCode,
  year,
  localityData,
}: {
  locality: GeoMeshes;
  ibgeCode: string;
  year: number;
  localityData?: any;
}): Promise<Spatial> => {
  /**
   * Get IBGE locality data
   */
  if (!localityData) {
    localityData =
      (
        await fetchIbgeAllLocalities({
          locality,
        })
      ).find((item) => {
        return `${Object.values(item)[0]}` === `${ibgeCode}`;
      }) ?? null;
  }

  if (!localityData) {
    throw new Error(`IBGE locality with code ${ibgeCode} not found.`);
  }

  Object.keys(localityData).forEach((key) => {
    if (!key.startsWith('localidade-')) {
      localityData[`localidade-${key}`] = localityData[key];
      delete localityData[key];
    } else {
      localityData[key] = localityData[key];
    }
  });

  /**
   * Get IBGE geo meshes metadata
   */
  const metadata = await fetchIbgeGeoMeshesMetadataUrl({
    locality,
    id: ibgeCode,
    year,
  });

  Object.keys(metadata).forEach((key) => {
    if (!key.startsWith('metadata-')) {
      metadata[`metadata-${key}`] = metadata[key];
      delete metadata[key];
    } else {
      metadata[key] = metadata[key];
    }
  });

  /**
   * Get IBGE geo meshes json map
   */
  const mapApi = getIbgeGeoMeshesUrl({
    locality,
    id: ibgeCode,
    year,
  });

  const { data: mapData } = await axios.get(mapApi.url, {
    params: mapApi.params,
    timeout: 10000,
  });

  return {
    geo_code: `${ibgeCode}`,
    admin_level: ibgeLocalitiesAdminLevel[locality],
    source: 'ibge',
    start_date: brazilStartDate({ year }),
    properties: {
      apiUrl: `${mapApi.url}?${new URLSearchParams(mapApi.params).toString()}`,
      ...metadata,
      ...localityData,
    },
    raw_geometry: mapData.features[0].geometry,
    raw_srid: '4674',
  };
};
