import 'dotenv/config';

import { db } from '../db';
import fs from 'fs';
import * as pgCopyStreams from 'pg-copy-streams';
import { Client } from 'pg';

export const exportAggregatedData = async ({
  outputFilePath,
  selectedDataKeys = [],
  logId,
  spatialSubdivision,
}: {
  outputFilePath: string;
  selectedDataKeys?: string[];
  logId: string;
  spatialSubdivision: string;
}) => {
  try {
    let dataKeys = selectedDataKeys;

    // Passo 1: Identificar dinamicamente os valores de data_key
    if (!selectedDataKeys || selectedDataKeys.length === 0) {
      const [dataKeysResult] = await db.sequelize.query(`
        SELECT DISTINCT data_key
        FROM "aggrada_aggregateds"
      `);
  
      dataKeys = (dataKeysResult as any[]).map(row => row.data_key);
    }

    if (dataKeys.length === 0) {
      console.log('Nenhum dado encontrado para os filtros especificados.');
      return;
    }

    // Passo 2: Construir a query dinâmica para pivotar os valores
    const dynamicColumns = dataKeys.map(
      key => `MAX(CASE WHEN data_key = '${key}' THEN data_values::text END) AS "${key}"`
    ).join(', ');

    const query = `
    COPY (
      SELECT
        spatial_id,
        spatial_geo_code,
        spatial_name,
        time_label,
        time_start_date,
        time_end_date,
        ${dynamicColumns}
      FROM
        "aggrada_aggregateds"
      WHERE
        log_id = '${logId}' AND
        spatial_subdivision = '${spatialSubdivision}'
      GROUP BY
        spatial_id,
        spatial_geo_code,
        spatial_name,
        time_label,
        time_start_date,
        time_end_date
    ) TO STDOUT WITH CSV HEADER;
  `;

    // Passo 3: Obter a conexão direta com o PostgreSQL
    const rawClient = await db.sequelize.connectionManager.getConnection({ type: 'read' });
    const pgClient = rawClient as unknown as Client; // Cast explícito para o tipo correto

    // Passo 4: Exportar diretamente usando pg-copy-streams
    const outputStream = fs.createWriteStream(outputFilePath);

    const copyStream = pgClient.query(pgCopyStreams.to(query));
    copyStream.pipe(outputStream);

    copyStream.on('finish', () => {
      console.log(`Exportação concluída com sucesso para: ${outputFilePath}`);
    });

    copyStream.on('error', (err: Error) => {
      console.error('Erro durante a exportação:', err);
    });

    outputStream.on('error', (err: Error) => {
      console.error('Erro ao salvar o arquivo:', err);
    });

    // Libera a conexão ao final
    await db.sequelize.connectionManager.releaseConnection(rawClient);
  } catch (error) {
    console.error('Erro ao exportar os dados:', error);
  }
};