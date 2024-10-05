import axios from 'axios';

type CityResponseData = {
  id: number;
  nome: string;
  microrregiao: {
    id: number;
    nome: string;
    mesorregiao: {
      id: number;
      nome: string;
      UF: {
        id: number;
        sigla: string;
        nome: string;
        regiao: {
          id: number;
          sigla: string;
          nome: string;
        };
      };
    };
  };
  'regiao-imediata': {
    id: number;
    nome: string;
    'regiao-intermediaria': {
      id: number;
      nome: string;
    };
  };
};

type CityMetadata = {
  id: number;
  nome: string;
  microrregiaoId: number;
  microrregiaoNome: string;
  mesorregiaoId: number;
  mesorregiaoNome: string;
  ufId: number;
  ufSigla: string;
  ufNome: string;
  regiaoId: number;
  regiaoSigla: string;
  regiaoNome: string;
  regiaoImediataId: number;
  regiaoImediataNome: string;
  regiaoIntermediariaId: number;
  regiaoIntermediariaNome: string;
};

const IBGE_API_LOCALIDADES_URL =
  'https://servicodados.ibge.gov.br/api/v1/localidades/municipios';

const transformCityMetadata = (data: CityResponseData): CityMetadata => {
  return {
    id: data.id,
    nome: data.nome,
    microrregiaoId: data.microrregiao.id,
    microrregiaoNome: data.microrregiao.nome,
    mesorregiaoId: data.microrregiao.mesorregiao.id,
    mesorregiaoNome: data.microrregiao.mesorregiao.nome,
    ufId: data.microrregiao.mesorregiao.UF.id,
    ufSigla: data.microrregiao.mesorregiao.UF.sigla,
    ufNome: data.microrregiao.mesorregiao.UF.nome,
    regiaoId: data.microrregiao.mesorregiao.UF.regiao.id,
    regiaoSigla: data.microrregiao.mesorregiao.UF.regiao.sigla,
    regiaoNome: data.microrregiao.mesorregiao.UF.regiao.nome,
    regiaoImediataId: data['regiao-imediata'].id,
    regiaoImediataNome: data['regiao-imediata'].nome,
    regiaoIntermediariaId: data['regiao-imediata']['regiao-intermediaria'].id,
    regiaoIntermediariaNome:
      data['regiao-imediata']['regiao-intermediaria'].nome,
  };
};

export const getCitiesMetadata = async (): Promise<CityMetadata[]> => {
  try {
    const response = await axios.get<CityResponseData[]>(
      IBGE_API_LOCALIDADES_URL
    );
    const responseData = response.data;
    const transformedData: CityMetadata[] = responseData.map(
      transformCityMetadata
    );
    return transformedData;
  } catch (err) {
    throw new Error(`Failed to fetch cities metadata from IBGE API.\n${err}`);
  }
};
