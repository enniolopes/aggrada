import axios from 'axios';

/**
 * API documentation: https://servicodados.ibge.gov.br/api/docs/localidades
 */
export const ibgeLocalities = [
  'paises',
  'regioes',
  'estados',
  'mesorregioes',
  'microrregioes',
  'regioes-intermediarias',
  'regioes-imediatas',
  'municipios',
  'regioes-integradas-de-desenvolvimento',
  'regioes-metropolitanas',
  'subdistritos',
];

export type Locality = (typeof ibgeLocalities)[number];

export type IBGELocalityNotFlatten = {
  id: number;
  nome: string;
  [key: string]: string | number | IBGELocalityNotFlatten;
};

type IBGELocalityRegiao = {
  'regiao-id': number;
  'regiao-sigla': string;
  'regiao-nome': string;
};

type IBGELocalityUf = {
  'UF-id': number;
  'UF-sigla': string;
  'UF-nome': string;
} & IBGELocalityRegiao;

type IBGELocalityRegiaoIntermediaria = {
  'regiao-intermediaria-id': number;
  'regiao-intermediaria-nome': string;
} & IBGELocalityUf;

type IBGELocalityRegiaoImediata = {
  'regiao-imediata-id': number;
  'regiao-imediata-nome': string;
} & IBGELocalityRegiaoIntermediaria;

type IBGELocalityMesorregiao = {
  'mesorregiao-id': number;
  'mesorregiao-nome': string;
} & IBGELocalityUf;

type IBGELocalityMicrorregiao = {
  'microrregiao-id': number;
  'microrregiao-nome': string;
} & IBGELocalityMesorregiao;

type IBGELocalityMunicipio = {
  'municipio-id': number;
  'municipio-nome': string;
} & IBGELocalityMicrorregiao &
  IBGELocalityRegiaoImediata;

export type IBGELocalityApi =
  | IBGELocalityRegiao
  | IBGELocalityUf
  | IBGELocalityRegiaoIntermediaria
  | IBGELocalityRegiaoImediata
  | IBGELocalityMesorregiao
  | IBGELocalityMicrorregiao
  | IBGELocalityMunicipio;

const getIbgeLocalityUrl = ({ locality }: { locality: Locality }): string => {
  return `https://servicodados.ibge.gov.br/api/v1/localidades/${locality}?view=nivelado`;
};

const getIbgeLocalityByIdUrl = ({
  locality,
  id,
}: {
  locality: Locality;
  id: string;
}): string => {
  return `https://servicodados.ibge.gov.br/api/v1/localidades/${locality}/${id}?view=nivelado`;
};

export const fetchIbgeLocality = async ({
  ibgeCode,
  locality,
}: {
  ibgeCode: string;
  locality: Locality;
}): Promise<IBGELocalityMunicipio> => {
  const apiUrl = getIbgeLocalityByIdUrl({ locality, id: ibgeCode });
  const response = await axios.get(apiUrl);
  return response.data;
};

export const fetchIbgeAllLocalities = async ({
  locality,
}: {
  locality: Locality;
}): Promise<IBGELocalityApi[]> => {
  const apiUrl = getIbgeLocalityUrl({ locality });

  let tries = 0;
  const nTries = 5;
  while (tries < nTries) {
    const response = await axios.get(apiUrl);
    if (response?.data) {
      tries = nTries;
      return response.data;
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw Error('No IBGE API response');
};
