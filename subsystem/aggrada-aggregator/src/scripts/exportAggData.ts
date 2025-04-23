import 'dotenv/config';

import { db } from '../db';
import fs from 'fs';
import path from 'path';
import * as pgCopyStreams from 'pg-copy-streams';
import { Client } from 'pg';

export const exportAggregatedData = async ({
  outputFilePath,
  selectedDataKeys = [],
  logId,
  spatialSubdivision,
  timeGranularity,
}: {
  outputFilePath: string;
  selectedDataKeys?: string[];
  logId: string;
  spatialSubdivision: string;
  timeGranularity?: 'yearly' | 'monthly' | 'quarterly';
}) => {
  let rawClient: any = null;
  try {
    let dataKeys = selectedDataKeys;

    // Passo 1: Identificar dinamicamente os valores de data_key
    if (!selectedDataKeys || selectedDataKeys.length === 0) {

      const [dataKeysResult] = await db.sequelize.query(`
        SELECT DISTINCT key
        FROM "aggrada_aggregateds"
        WHERE log_id = '${logId}'
        AND aggregation_params->>'timeGranularity' = '${timeGranularity}'
      `);

      dataKeys = (dataKeysResult as any[]).map(row => row.key);
    }

    if (dataKeys.length === 0) {
      console.log('Nenhum dado encontrado para os filtros especificados.');
      return;
    }

    // Passo 2: Construir a query dinâmica para pivotar os valores
    const dynamicColumns = dataKeys.map(
      key => `MAX(CASE WHEN key = '${key}' THEN values::text END) AS "${key}"`
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
        log_id = '${logId}'
        AND spatial_subdivision = '${spatialSubdivision}' 
        AND aggregation_params->>'timeGranularity' = '${timeGranularity}' 
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
    rawClient = await db.sequelize.connectionManager.getConnection({ type: 'read' });
    const pgClient = rawClient as unknown as Client; // Cast explícito para o tipo correto

    // Passo 4: Criar o diretório se não existir
    const outputDir = path.dirname(outputFilePath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Passo 5: Exportar diretamente usando pg-copy-streams
    const outputStream = fs.createWriteStream(outputFilePath);

    console.log('Iniciando exportação para:', outputFilePath);

    // Criar o stream de cópia
    const copyStream = pgClient.query(pgCopyStreams.to(query));
    
    // Conectar o stream de cópia ao stream de saída
    copyStream.pipe(outputStream);

    // Aguardar a conclusão do stream antes de liberar a conexão
    await new Promise<void>((resolve, reject) => {
      let hasError = false;
      
      copyStream.on('finish', () => {
        console.log(`Stream de cópia concluído`);
        if (!hasError) {
          outputStream.end();
        }
      });

      outputStream.on('finish', () => {
        console.log(`Exportação concluída com sucesso para: ${outputFilePath}`);
        resolve();
      });

      copyStream.on('error', (err: Error) => {
        hasError = true;
        console.error('Erro durante a exportação:', err);
        reject(err);
      });

      outputStream.on('error', (err: Error) => {
        hasError = true;
        console.error('Erro ao salvar o arquivo:', err);
        reject(err);
      });
    });

  } catch (error) {
    console.error('Erro ao exportar os dados:', error);
  } finally {
    // Libera a conexão apenas após tudo terminar
    if (rawClient) {
      await db.sequelize.connectionManager.releaseConnection(rawClient);
      console.log('Conexão com o banco de dados liberada');
    }
  }
};