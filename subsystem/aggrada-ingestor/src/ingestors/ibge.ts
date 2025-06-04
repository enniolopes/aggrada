// Ingestor para ingestão de dados do IBGE via API externa (mock)
import { AggradaObservation } from 'postgresdb/dist/models/AggradaObservation';

interface IngestFromIbgeApiParams {
  dataset: string;
}

export async function ingestFromIbgeApi({ dataset }: IngestFromIbgeApiParams) {
  // Exemplo: buscar dados do IBGE (mock)
  // Em produção, implemente a chamada HTTP real para a API do IBGE
  const mockData = [
    { municipio: 'São Paulo', valor: 123, ano: 2020 },
    { municipio: 'Rio de Janeiro', valor: 456, ano: 2020 },
  ];
  for (const row of mockData) {
    await AggradaObservation.create({
      ...row,
      fonte: 'IBGE',
      dataset,
    });
  }
}
