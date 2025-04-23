import { Spatial } from '../../Models';
import { ibgeLocality } from './localitiesApi';
import axios from 'axios';

export type GeoMeshes =
  | 'paises'
  | 'regioes'
  | 'regioes-imediatas'
  | 'regioes-intermediarias'
  | 'estados'
  | 'mesorregioes'
  | 'microrregioes'
  | 'municipios';

const getIbgeGeoMeshesUrl = ({ geoMesh }: { geoMesh: GeoMeshes }): string => {
  return `https://servicodados.ibge.gov.br/api/v3/malhas/${geoMesh}`;
};

export const ibgeGeoMeshMap = async ({
  geoMesh,
  ibgeCode,
  year = 2022,
}: {
  geoMesh: GeoMeshes;
  ibgeCode: string;
  year: number;
}): Promise<Spatial> => {
  const IBGE_API_MALHAS_URL = getIbgeGeoMeshesUrl({ geoMesh });

  const url = `${IBGE_API_MALHAS_URL}/${ibgeCode}`;
  const params = {
    periodo: `${year}`,
    formato: 'application/vnd.geo+json',
    qualidade: 'maxima',
  };

  try {
    const { data } = await axios.get(url, {
      params,
      timeout: 10000,
    });

    if (
      `${data.features[0]?.properties.codarea}` !== `${ibgeCode}` &&
      !data.features[0]?.geometry
    ) {
      throw new Error();
    }

    const localityRegistry = await ibgeLocality({
      locality: geoMesh,
      ibgeCode,
    });

    return {
      geoCode: `${ibgeCode}`,
      adminLevel: geoMesh,
      source: 'ibge',
      startDate: new Date(year, 0, 1),
      properties: {
        apiUrl: `${url}?${new URLSearchParams(params).toString()}`,
        name: localityRegistry?.nome || '',
        ...localityRegistry,
      },
      rawGeometry: data.features[0].geometry,
      rawSrid: '4674',
    };
  } catch (error) {
    throw new Error(`Failed to fetch data for IBGE code ${ibgeCode}: ${error}`);
  }
};
