import 'dotenv/config';

import { db } from '../db';
import fs from 'fs';
import * as pgCopyStreams from 'pg-copy-streams';
import { Client } from 'pg';

export const exportAggregatedDataWithMode = async ({
  outputFilePath,
  selectedDataKeys = [],
}: {
  outputFilePath: string;
  selectedDataKeys?: string[];
}) => {
  let rawClient: any; // Para liberar a conexão no bloco finally
  try {
    let dataKeys = selectedDataKeys;

    // Identificar dinamicamente os valores de data_key
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

    // Construir a query dinâmica para calcular o valor mais frequente (moda)
    const dynamicColumns = dataKeys
      .map(
        key => `
        (
          SELECT 
            mode_value
          FROM (
            SELECT 
              value::text AS mode_value,
              COUNT(*) AS count
            FROM unnest(
              (
                SELECT data_values
                FROM "aggrada_aggregateds" sub
                WHERE
                  sub.spatial_id = main.spatial_id
                  AND sub.spatial_geo_code = main.spatial_geo_code
                  AND sub.spatial_source = main.spatial_source
                  AND sub.time_label = main.time_label
                  AND sub.time_start_date = main.time_start_date
                  AND sub.time_end_date = main.time_end_date
                  AND sub.data_key = '${key}'
              )
            ) AS value
            GROUP BY value::text
            ORDER BY count DESC, value::text ASC
            LIMIT 1
          ) AS mode_result
        ) AS "${key}" `
      )
      .join(', ');

    const query = `
    COPY (
      SELECT
        spatial_id,
        spatial_geo_code,
        spatial_source,
        time_label,
        time_start_date,
        time_end_date,
        ${dynamicColumns}
      FROM
        "aggrada_aggregateds" main
      GROUP BY
        spatial_id,
        spatial_geo_code,
        spatial_source,
        time_label,
        time_start_date,
        time_end_date
    ) TO STDOUT WITH CSV HEADER;
  `;

    console.log('Gerando dados');

    // Obter a conexão direta com o PostgreSQL
    rawClient = await db.sequelize.connectionManager.getConnection({ type: 'read' });
    const pgClient = rawClient as unknown as Client;

    // Exportar diretamente usando pg-copy-streams
    const outputStream = fs.createWriteStream(outputFilePath);

    const copyStream = pgClient.query(pgCopyStreams.to(query));
    copyStream.pipe(outputStream);

    copyStream.on('finish', () => {
      outputStream.end();
      console.log(`Exportação concluída com sucesso para: ${outputFilePath}`);
    });

    copyStream.on('error', (err: Error) => {
      console.error('Erro durante a exportação:', err);
    });

    outputStream.on('error', (err: Error) => {
      console.error('Erro ao salvar o arquivo:', err);
    });
  } catch (error) {
    console.error('Erro ao exportar os dados:', error);
  } finally {
    if (rawClient) {
      await db.sequelize.connectionManager.releaseConnection(rawClient);
    }
  }
};
