#!/usr/bin/env tsx
import 'dotenv/config';

import path from 'node:path';
import fs from 'node:fs';
import { reader, transformer } from '@simple4decision/aggrada-core';
import { db } from '../db';

interface IngestObservationsParams {
  file: string;
  spatialGeoCodeKey?: string;
  geoAddressKeys?: string[];
  geoAddressPostalCodeKey?: string,
  spatialSource: string;
  spatialAdminLevel: string;
  temporalKeys: string[];
}

const saveLog = ({
  logData,
}: {
  logData: string;
}) => {
  /**
   * Salvar um arquivo único na pasta ./src com todos os logs com os dados que não foram encontrados no índice espacial.
   * Isso pode ser útil para depuração ou para verificar se os dados estão corretos.
   */
  const logFilePath = './.log/index_not_found.log';

  // Check if log directory exists, if not create it
  const logDir = path.dirname(logFilePath);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  // Check if the log entry already exists in the file
  let existingLog = '';
  if (fs.existsSync(logFilePath)) {
    existingLog = fs.readFileSync(logFilePath, 'utf8');
  }
  
  // Only append if the log entry doesn't already exist
  if (!existingLog.includes(logData)) {
    fs.appendFileSync(logFilePath, logData, { encoding: 'utf8' });
  }
}

const createObservation = async ({
  rowsBatch,
  info,
  ingestParams,
}: {
  rowsBatch: Record<string, string>[], 
  info: {
    batchNumber: number;
    batchSize: number;
  };
  ingestParams: IngestObservationsParams;
}) => {
  for (let index = 0; index < rowsBatch.length; index++) {
    const row = rowsBatch[index];

    // Track row number for logging and debugging purposes
    // Salvar o rowNumber com a observação para checar já aqui no começo se a observação já existe e não fazer o processamento
    // temos o file, os dados da row e o rowNumber, deve ser suficiente para identificar a row no banco de dados
    const rowNumber = (info.batchNumber * info.batchSize) + (index + 1);

    /**
     * Criar um índice temporal a partir das chaves temporais.
     */
    const timeRawIndex = ingestParams.temporalKeys.length > 1 ? ingestParams.temporalKeys.map((key) => row[key].trim()).join('-') : row[ingestParams.temporalKeys[0]].trim();
    const timeIndex = transformer.createTimeRange({
      date: timeRawIndex,
      timezone: 'America/Sao_Paulo',
    });

    if (!timeIndex?.startTz) {
      const logData = `Time index not found - file: ${ingestParams.file} - row number: ${rowNumber} - time: ${timeRawIndex}\n`;
      saveLog({ logData });

      continue;
    }

    let spatialIndex = null;
    let geoCodeSanitized = null;

    if(ingestParams?.spatialGeoCodeKey) {
      /**
       * Criar um índice espacial a partir da chave geo espacial.
       */
      geoCodeSanitized = row[ingestParams.spatialGeoCodeKey].toString().trim();

      /**
       * Finds a single entry in the AggradaSpatial table that matches the specified criteria.
       */
      spatialIndex = await db.AggradaSpatial.findOne({
        where: {
          geo_code: geoCodeSanitized,
          source: ingestParams.spatialSource,
          admin_level: ingestParams.spatialAdminLevel,
        },
        attributes: ['id'],
      }).catch(() => {
        return null
      });
    }

    if (!spatialIndex) {
      const logData = `Spatial index not found - file: ${ingestParams.file} - row number: ${rowNumber} - geo code: ${geoCodeSanitized}\n`;
      saveLog({ logData });

      continue;
    }

    /**
     * Agora buscar na tabela AggradaObservation se a row já existe nela
     * Se já existir, não inserir novamente
     * Se não existir, inserir a nova row com o índice espacial e o índice temporal
     */
    // Get raw connection to use PostgreSQL functions properly
    const sequelize = db.sequelize;

    const flattenRow = transformer.flattenObject({obj: row});

    // For search, use the raw tstzrange function with proper comparison operator
    const observationExists = await db.AggradaObservation.findOne({
      where: {
        core_file: ingestParams.file,
        aggrada_spatials_id: spatialIndex.id,
        data: flattenRow,
      },
      attributes: ['id'],
    }).catch(() => {
      return null;
    });

    if (observationExists) {
      console.log('Observation already exists:', observationExists.id);
      continue;
    }
    
    await db.AggradaObservation.create({
      aggrada_spatials_id: spatialIndex.id,
      temporal_range_tz: sequelize.literal(`tstzrange('${timeIndex.startTz}', '${timeIndex.endTz}')`),
      temporal_range: sequelize.literal(`tstzrange('${timeIndex.start}', '${timeIndex.end}')`),
      data: flattenRow,
      core_file: ingestParams.file,
    });
  }
}

export async function ingestObservations({
  file,
  spatialGeoCodeKey,
  spatialSource,
  spatialAdminLevel,
  temporalKeys,
}: IngestObservationsParams) {
  // Get file extension to determine the file type
  const fileExtension = path.extname(file).toLowerCase().trim();

  if (fileExtension === '.csv') {
    console.log('Processing CSV file:', file);
    reader.csvToJsonStream({
      file,
    }, async (rowsBatch, info) => {
      await createObservation({
        rowsBatch,
        info,
        ingestParams: {
          file,
          spatialGeoCodeKey,
          spatialSource,
          spatialAdminLevel,
          temporalKeys,
        },
      });
    })
  }

  if (fileExtension === '.xlsx' || fileExtension === '.xls') {
    reader.excelToJsonStream({
      file,
    }, async (rowsBatch, info) => {
      await createObservation({
        rowsBatch,
        info,
        ingestParams: {
          file,
          spatialGeoCodeKey,
          spatialSource,
          spatialAdminLevel,
          temporalKeys,
        },
      });
    })
  }
  if (fileExtension !== '.csv' && fileExtension !== '.xlsx' && fileExtension !== '.xls') {
    throw new Error(`Unsupported file type: ${fileExtension}`);
  }
  // // Close the database connection after processing
  // await db.sequelize.close();
  // console.log('Database connection closed.');
}
