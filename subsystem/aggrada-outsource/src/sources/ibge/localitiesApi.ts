import { transformer } from '../../../../aggrada-core/src';
import axios from 'axios';

export type Locality =
  | 'paises'
  | 'regioes'
  | 'estados'
  | 'mesorregioes'
  | 'microrregioes'
  | 'regioes-intermediarias'
  | 'regioes-imediatas'
  | 'municipios'
  | 'regioes-integradas-de-desenvolvimento'
  | 'regioes-metropolitanas'
  | 'subdistritos';

const getIbgeLocalitiesUrl = ({ locality }: { locality: Locality }): string => {
  return `https://servicodados.ibge.gov.br/api/v1/localidades/${locality}`;
};

type IBGERegistry = {
  id: number;
  nome: string;
  [key: string]: string | number | IBGERegistry;
};

export const ibgeLocality = async ({
  ibgeCode,
  locality,
}: {
  ibgeCode: string;
  locality: Locality;
}): Promise<IBGERegistry> => {
  const IBGE_API_LOCALIDADES_URL = getIbgeLocalitiesUrl({ locality });

  const response = await axios.get(`${IBGE_API_LOCALIDADES_URL}/${ibgeCode}`);

  if (response?.data?.id && response?.data?.nome) {
    return transformer.flattenObject({
      obj: response.data,
    }) as IBGERegistry;
  }

  throw new Error(
    `Error: data not founded for IBGE code ${ibgeCode} - locality ${locality}`
  );
};

export const ibgeAllLocalityRegistry = async ({
  locality,
}: {
  locality: Locality;
}): Promise<IBGERegistry[]> => {
  const IBGE_API_LOCALIDADES_URL = getIbgeLocalitiesUrl({ locality });

  let tries = 0;
  const nTries = 5;
  while (tries < nTries) {
    const response = await axios.get(IBGE_API_LOCALIDADES_URL);
    if (response?.data) {
      tries = nTries;
      const responseData = response.data;
      return responseData.map((obj: object) => {
        return transformer.flattenObject({
          obj,
        });
      });
    }
    await new Promise((resolve) => {
      return setTimeout(resolve, 2000);
    });
  }

  throw Error('No IBGE API response');
};
