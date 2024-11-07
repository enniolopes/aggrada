import { transformer } from '@simple4decision/aggrada-core';
import axios from 'axios';

const IBGE_API_LOCALIDADES_URL =
  'https://servicodados.ibge.gov.br/api/v1/localidades/municipios';

type IBGERegistry = {
  id: number;
  nome: string;
  [key: string]: string | number | IBGERegistry;
};

export const ibgeCityRegistry = async ({
  ibgeCode,
}: {
  ibgeCode: string;
}): Promise<IBGERegistry> => {
  const response = await axios.get(`${IBGE_API_LOCALIDADES_URL}/${ibgeCode}`);

  if (response?.data?.id && response?.data?.nome) {
    return transformer.flattenObject({
      obj: response.data,
    }) as IBGERegistry;
  }

  throw new Error(`Error: data not founded for IBGE city code ${ibgeCode}`);
};

export const ibgeAllCitiesRegistry = async (): Promise<IBGERegistry[]> => {
  const response = await axios.get(IBGE_API_LOCALIDADES_URL);
  const responseData = response.data;
  return responseData.map((obj: object) => {
    return transformer.flattenObject({
      obj,
    });
  });
};
