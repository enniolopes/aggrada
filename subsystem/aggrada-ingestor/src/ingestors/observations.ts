#!/usr/bin/env tsx
import 'dotenv/config';

import path from 'node:path';
import fs from 'node:fs';
import { Op, QueryTypes } from 'sequelize';
import { reader, transformer } from '@simple4decision/aggrada-core';
import { db } from '../db';

/**
 * Cache limitado e seguro para índices espaciais
 */
class LimitedSpatialCache {
  private cache = new Map<string, { id: number; timestamp: number }>();
  private readonly maxSize: number;
  private readonly ttl: number; // Time to live em ms

  constructor(maxSize = 30000, ttl = 8 * 60 * 1000) {
    // 8 minutos TTL
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  get(key: string): number | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // Verificar TTL
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.id;
  }

  set(key: string, id: number): void {
    // Limpar cache se atingir o limite
    if (this.cache.size >= this.maxSize) {
      this.clearOldest();
    }

    this.cache.set(key, { id, timestamp: Date.now() });
  }

  private clearOldest(): void {
    // Remove 30% das entradas mais antigas
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

    const toRemove = Math.floor(entries.length * 0.3);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Cache limitado e seguro para toda a sessão
const spatialCache = new LimitedSpatialCache();

interface IngestPerformanceMetrics {
  startTime: Date;
  endTime?: Date;
  durationMs?: number;
  totalRows: number;
  processedRows: number;
  insertedRows: number;
  duplicateRows: number;
  errorRows: number;
  timePerRowMs?: number;
  batchCount: number;
  averageBatchTimeMs?: number;
  file: string;
  fileSize?: number;
}

interface BatchMetrics {
  batchNumber: number;
  startTime: Date;
  endTime?: Date;
  durationMs?: number;
  inputRows: number;
  processedRows: number;
  insertedRows: number;
  duplicateRows: number;
  errorRows: number;
}

interface IngestObservationsParams {
  file: string;
  spatialGeoCodeKey?: string;
  geoAddressKeys?: string[];
  geoAddressPostalCodeKey?: string;
  spatialSource: string;
  spatialAdminLevel: string;
  temporalKeys?: string[];
  temporalKeyValue?: string;
  temporalKeysQuery?: {
    query: string;
    attribute: string;
    bind?: {
      type: 'variable' | 'fixed';
      value: string;
    }[];
  };
}

const saveLog = ({ logData }: { logData: string }) => {
  /**
   * Salvar um arquivo único na pasta ./.log com todos os logs com os dados que não foram encontrados no índice espacial.
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
};

/**
 * Salva métricas de performance da ingestão
 */
const savePerformanceMetrics = (metrics: IngestPerformanceMetrics) => {
  try {
    const metricsFilePath = './.log/performance_metrics.jsonl';

    // Criar diretório se não existir
    const logDir = path.dirname(metricsFilePath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Preparar linha de log em formato JSONL (um JSON por linha)
    const logLine =
      JSON.stringify({
        timestamp: new Date().toISOString(),
        ...metrics,
      }) + '\n';

    // Adicionar ao arquivo
    fs.appendFileSync(metricsFilePath, logLine, { encoding: 'utf8' });

    // Log resumido no console
    console.log('\n=== PERFORMANCE METRICS ===');
    console.log(`File: ${path.basename(metrics.file)}`);
    console.log(`Duration: ${(metrics.durationMs! / 1000).toFixed(2)}s`);
    console.log(`Total rows: ${metrics.totalRows}`);
    console.log(`Processed rows: ${metrics.processedRows}`);
    console.log(`Inserted rows: ${metrics.insertedRows}`);
    console.log(`Duplicate rows: ${metrics.duplicateRows}`);
    console.log(`Error rows: ${metrics.errorRows}`);
    console.log(`Time per row: ${metrics.timePerRowMs?.toFixed(4)}ms`);
    if (metrics.averageBatchTimeMs) {
      console.log(
        `Average batch time: ${metrics.averageBatchTimeMs?.toFixed(2)}ms`
      );
    }
    console.log(
      `Throughput: ${(metrics.processedRows / (metrics.durationMs! / 1000)).toFixed(2)} rows/sec`
    );
    console.log('===========================\n');
  } catch (error) {
    console.error('Error saving performance metrics:', error);
    // Não falhar a ingestão por causa de erro nas métricas
  }
};

/**
 * Obtém tamanho do arquivo em bytes
 */
const getFileSize = (filePath: string): number => {
  try {
    return fs.statSync(filePath).size;
  } catch {
    return 0;
  }
};

/**
 * Pré-carrega índices espaciais para um batch específico
 */
const preloadBatchSpatialIndexes = async (
  ingestParams: IngestObservationsParams,
  geoCodes: Set<string>
) => {
  if (!ingestParams.spatialGeoCodeKey || geoCodes.size === 0)
    return new Map<string, number>();

  // Limitar o número de geo codes por consulta para evitar queries muito grandes
  const maxBatchSize = 1000;
  const geoCodeArray = Array.from(geoCodes);
  const batchCache = new Map<string, number>();

  for (let i = 0; i < geoCodeArray.length; i += maxBatchSize) {
    const batchGeoCodes = geoCodeArray.slice(i, i + maxBatchSize);

    const spatialResults = await db.AggradaSpatial.findAll({
      where: {
        geo_code: { [Op.in]: batchGeoCodes },
        admin_level: ingestParams.spatialAdminLevel,
        source: ingestParams.spatialSource,
      },
      attributes: ['id', 'geo_code', 'start_date'],
      order: [
        ['geo_code', 'ASC'],
        ['start_date', 'DESC'],
      ],
      raw: true, // Melhor performance
    });

    // Processar resultados mantendo apenas o mais recente por geo_code
    const geoCodeMap = new Map<string, number>();
    spatialResults.forEach((result: any) => {
      if (!geoCodeMap.has(result.geo_code)) {
        const cacheKey = `${result.geo_code}-${ingestParams.spatialAdminLevel}-${ingestParams.spatialSource}`;
        geoCodeMap.set(result.geo_code, result.id);
        batchCache.set(cacheKey, result.id);

        // Adicionar ao cache global limitado
        spatialCache.set(cacheKey, result.id);
      }
    });
  }

  return batchCache;
};

/**
 * Processa índice temporal de uma row
 */
const processTimeIndex = async (
  row: Record<string, string>,
  ingestParams: IngestObservationsParams,
  rowNumber: number
): Promise<string | null> => {
  let timeRawIndex: string | null = null;

  if (ingestParams?.temporalKeys && ingestParams.temporalKeys.length > 0) {
    timeRawIndex =
      ingestParams.temporalKeys.length > 1
        ? ingestParams.temporalKeys.map((key) => row[key].trim()).join('-')
        : row[ingestParams.temporalKeys[0]].trim();
  }

  if (ingestParams?.temporalKeyValue) {
    timeRawIndex = ingestParams?.temporalKeyValue.trim();
  }

  if (
    ingestParams?.temporalKeysQuery &&
    ingestParams?.temporalKeysQuery?.attribute
  ) {
    const { query, bind } = ingestParams.temporalKeysQuery;
    const bindValues =
      bind?.map((b) => {
        if (b.type === 'variable') {
          return row[b.value];
        }
        if (b.type === 'fixed') {
          return b.value;
        }
        return null;
      }) || [];

    timeRawIndex = await db.sequelize
      .query(query, {
        bind: bindValues,
        type: QueryTypes.SELECT,
      })
      .then((results) => {
        return (
          (results[0] as any)?.[
            ingestParams?.temporalKeysQuery?.attribute || ''
          ] || null
        );
      })
      .catch((err) => {
        console.error(
          `Error executing temporal keys query for row ${rowNumber}:`,
          err
        );
        return null;
      });
  }

  return timeRawIndex;
};

/**
 * Busca fallback para códigos IBGE
 */
const findIbgeFallback = async (
  processedRow: any,
  ingestParams: IngestObservationsParams
): Promise<number | null> => {
  if (
    ingestParams.spatialAdminLevel === 'city' &&
    ingestParams.spatialSource === 'ibge' &&
    processedRow.geoCodeSanitized?.length === 6
  ) {
    const fallbackResult = await db.AggradaSpatial.findOne({
      where: {
        source: ingestParams.spatialSource,
        admin_level: ingestParams.spatialAdminLevel,
        geo_code: {
          [Op.like]: `${processedRow.geoCodeSanitized}%`,
        },
        start_date: {
          [Op.lte]: processedRow.timeIndex.start,
        },
      },
      attributes: ['id'],
      order: [['start_date', 'DESC']],
      raw: true,
    }).catch(() => null);

    return fallbackResult?.id || null;
  }
  return null;
};

/**
 * Prepara registros para bulk insert
 */
const prepareBulkRecords = async (
  processedRows: Array<any>,
  ingestParams: IngestObservationsParams,
  batchCache: Map<string, number>
) => {
  const validRecords: any[] = [];
  const missingIndexes: string[] = [];

  for (const processedRow of processedRows) {
    let spatialIndex: number | null = null;

    if (ingestParams?.spatialGeoCodeKey && processedRow.geoCodeSanitized) {
      const cacheKey = `${processedRow.geoCodeSanitized}-${ingestParams.spatialAdminLevel}-${ingestParams.spatialSource}`;

      // Tentar cache do batch primeiro
      spatialIndex = batchCache.get(cacheKey) || null;

      // Se não encontrar, tentar cache global limitado
      if (!spatialIndex) {
        spatialIndex = spatialCache.get(cacheKey) || null;
      }

      // Se ainda não encontrar, fazer fallback para códigos IBGE
      if (!spatialIndex) {
        spatialIndex = await findIbgeFallback(processedRow, ingestParams);
        if (spatialIndex) {
          spatialCache.set(cacheKey, spatialIndex);
        }
      }
    }

    if (!spatialIndex) {
      missingIndexes.push(
        `Spatial index not found - file: ${ingestParams.file} - row number: ${processedRow.rowNumber} - geo code: ${processedRow.geoCodeSanitized}`
      );
      continue;
    }

    validRecords.push({
      aggrada_spatials_id: spatialIndex,
      temporal_range_tz: db.sequelize.literal(
        `tstzrange('${processedRow.timeIndex.startTz}', '${processedRow.timeIndex.endTz}')`
      ),
      temporal_range: db.sequelize.literal(
        `tstzrange('${processedRow.timeIndex.start}', '${processedRow.timeIndex.end}')`
      ),
      data: processedRow.flattenRow,
      core_file: ingestParams.file,
    });
  }

  // Log erros em batch
  if (missingIndexes.length > 0) {
    saveLog({ logData: missingIndexes.join('\n') + '\n' });
  }

  return validRecords;
};

const createObservation = async ({
  rowsBatch,
  info,
  ingestParams,
  performanceTracker,
}: {
  rowsBatch: Record<string, string>[];
  info: {
    batchNumber: number;
    batchSize: number;
  };
  ingestParams: IngestObservationsParams;
  performanceTracker?: {
    metrics: IngestPerformanceMetrics;
    batchMetrics: BatchMetrics[];
  };
}) => {
  const batchStartTime = new Date();

  console.log(
    `Processing batch ${info.batchNumber + 1} with ${rowsBatch.length} rows`
  );

  // Inicializar métricas do batch se tracker fornecido
  let batchMetrics: BatchMetrics | undefined;
  if (performanceTracker) {
    batchMetrics = {
      batchNumber: info.batchNumber,
      startTime: batchStartTime,
      inputRows: rowsBatch.length,
      processedRows: 0,
      insertedRows: 0,
      duplicateRows: 0,
      errorRows: 0,
    };
  }

  // 1. Coletar geo codes únicos deste batch
  const batchGeoCodes = new Set<string>();
  const processedRows: Array<{
    flattenRow: any;
    timeIndex: any;
    geoCodeSanitized: string | null;
    rowNumber: number;
  }> = [];

  // Primeira passada: processar dados e coletar geo codes
  for (let index = 0; index < rowsBatch.length; index++) {
    const row = rowsBatch[index];
    const rowNumber = info.batchNumber * info.batchSize + (index + 1);

    try {
      // Processar índice temporal
      const timeRawIndex = await processTimeIndex(row, ingestParams, rowNumber);
      if (!timeRawIndex) {
        if (performanceTracker && batchMetrics) {
          batchMetrics.errorRows++;
          performanceTracker.metrics.errorRows++;
        }
        throw new Error(
          `Temporal index not found for file: ${ingestParams.file} - row number: ${rowNumber}`
        );
      }

      const timeIndex = transformer.createTimeRange({
        date: timeRawIndex,
        timezone: 'America/Sao_Paulo',
      });

      if (!timeIndex?.startTz) {
        const logData = `Time index not found - file: ${ingestParams.file} - row number: ${rowNumber} - time: ${timeRawIndex}\n`;
        saveLog({ logData });
        if (performanceTracker && batchMetrics) {
          batchMetrics.errorRows++;
          performanceTracker.metrics.errorRows++;
        }
        continue;
      }

      const flattenRow = transformer.flattenObject({ obj: row });

      const geoCodeSanitized = ingestParams?.spatialGeoCodeKey
        ? row[ingestParams.spatialGeoCodeKey].toString().trim()
        : null;

      if (geoCodeSanitized) {
        batchGeoCodes.add(geoCodeSanitized);
      }

      processedRows.push({
        flattenRow,
        timeIndex,
        geoCodeSanitized,
        rowNumber,
      });

      if (performanceTracker && batchMetrics) {
        batchMetrics.processedRows++;
        performanceTracker.metrics.processedRows++;
      }
    } catch (error) {
      console.error(`Error processing row ${rowNumber}:`, error);
      if (performanceTracker && batchMetrics) {
        batchMetrics.errorRows++;
        performanceTracker.metrics.errorRows++;
      }
      // Re-throw para manter comportamento original
      throw error;
    }
  }

  // 2. Pré-carregar índices espaciais apenas para este batch
  const batchSpatialCache = await preloadBatchSpatialIndexes(
    ingestParams,
    batchGeoCodes
  );

  // 3. Preparar dados usando cache do batch + cache global limitado
  const validRecords = await prepareBulkRecords(
    processedRows,
    ingestParams,
    batchSpatialCache
  );

  // 4. Inserir dados
  if (validRecords.length > 0) {
    try {
      // Usar bulkCreate com ignoreDuplicates para performance máxima
      const result = await db.AggradaObservation.bulkCreate(validRecords, {
        ignoreDuplicates: true, // Ignora duplicatas com base no índice único (core_file, data_hash)
        logging: false, // Desabilita logs SQL para performance
        validate: false, // Pular validação para performance
      });

      const insertedCount = result.length;
      const duplicateCount = validRecords.length - insertedCount;

      if (performanceTracker && batchMetrics) {
        batchMetrics.insertedRows = insertedCount;
        batchMetrics.duplicateRows = duplicateCount;

        performanceTracker.metrics.insertedRows += insertedCount;
        performanceTracker.metrics.duplicateRows += duplicateCount;
      }

      console.log(
        `Batch completed: ${insertedCount} records inserted, ${duplicateCount} duplicates skipped`
      );
    } catch (error) {
      console.error('Error in bulk insert:', error);
      throw error;
    }
  } else {
    console.log('No valid records to insert in this batch');
  }

  // 5. Finalizar métricas do batch
  if (performanceTracker && batchMetrics) {
    const batchEndTime = new Date();
    batchMetrics.endTime = batchEndTime;
    batchMetrics.durationMs = batchEndTime.getTime() - batchStartTime.getTime();

    performanceTracker.batchMetrics.push(batchMetrics);

    console.log(
      `Batch ${info.batchNumber + 1} duration: ${batchMetrics.durationMs}ms (${(batchMetrics.durationMs / batchMetrics.inputRows).toFixed(2)}ms/row)`
    );
  }

  // 6. Limpar recursos do batch para evitar vazamento de memória
  batchSpatialCache.clear();
};

export const ingestObservations = async ({
  file,
  spatialGeoCodeKey,
  spatialSource,
  spatialAdminLevel,
  temporalKeys,
  temporalKeysQuery,
  temporalKeyValue,
}: IngestObservationsParams) => {
  // Inicializar métricas de performance
  const performanceMetrics: IngestPerformanceMetrics = {
    startTime: new Date(),
    totalRows: 0,
    processedRows: 0,
    insertedRows: 0,
    duplicateRows: 0,
    errorRows: 0,
    batchCount: 0,
    file,
    fileSize: getFileSize(file),
  };

  const performanceTracker = {
    metrics: performanceMetrics,
    batchMetrics: [] as BatchMetrics[],
  };

  console.log(`\n=== STARTING INGESTION ===`);
  console.log(`File: ${file}`);
  console.log(
    `File size: ${(performanceMetrics.fileSize! / (1024 * 1024)).toFixed(2)} MB`
  );
  console.log(`Start time: ${performanceMetrics.startTime.toISOString()}`);
  console.log(`===========================\n`);

  // Get file extension to determine the file type
  const fileExtension = path.extname(file).toLowerCase().trim();

  // Batch sizes otimizados baseados no tipo de arquivo
  const getBatchSize = () => {
    if (fileExtension === '.csv') return 15000; // CSV é mais eficiente
    if (fileExtension === '.xlsx' || fileExtension === '.xls') return 2000; // Excel precisa ser menor
    return 5000;
  };

  const batchSize = getBatchSize();

  let totalRowsCounter = 0;

  const processCallback = async (rowsBatch: any[], info: any) => {
    totalRowsCounter += rowsBatch.length;
    performanceTracker.metrics.totalRows = totalRowsCounter;
    performanceTracker.metrics.batchCount = info.batchNumber + 1;

    await createObservation({
      rowsBatch,
      info,
      ingestParams: {
        file,
        spatialGeoCodeKey,
        spatialSource,
        spatialAdminLevel,
        temporalKeys,
        temporalKeysQuery,
        temporalKeyValue,
      },
      performanceTracker,
    });
  };

  try {
    if (fileExtension === '.csv') {
      console.log('Processing CSV file:', file);
      await new Promise<void>((resolve, reject) => {
        reader.csvToJsonStream(
          {
            file,
            batchSize,
          },
          processCallback,
          () => {
            resolve();
          }
        );
      });
    } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
      console.log('Processing Excel file:', file);
      await new Promise<void>((resolve, reject) => {
        reader.excelToJsonStream(
          {
            file,
            batchSize,
          },
          processCallback,
          () => {
            resolve();
          }
        );
      });
    } else {
      throw new Error(`Unsupported file type: ${fileExtension}`);
    }

    // Finalizar métricas
    performanceMetrics.endTime = new Date();
    performanceMetrics.durationMs =
      performanceMetrics.endTime.getTime() -
      performanceMetrics.startTime.getTime();

    // Calcular métricas finais
    if (performanceMetrics.processedRows > 0) {
      performanceMetrics.timePerRowMs =
        performanceMetrics.durationMs / performanceMetrics.processedRows;
    }

    if (performanceTracker.batchMetrics.length > 0) {
      const totalBatchTime = performanceTracker.batchMetrics.reduce(
        (sum, batch) => sum + (batch.durationMs || 0),
        0
      );
      performanceMetrics.averageBatchTimeMs =
        totalBatchTime / performanceTracker.batchMetrics.length;
    }

    // Salvar métricas de performance
    savePerformanceMetrics(performanceMetrics);
  } catch (error) {
    // Mesmo em caso de erro, salvar métricas parciais
    performanceMetrics.endTime = new Date();
    performanceMetrics.durationMs =
      performanceMetrics.endTime.getTime() -
      performanceMetrics.startTime.getTime();

    if (performanceMetrics.processedRows > 0) {
      performanceMetrics.timePerRowMs =
        performanceMetrics.durationMs / performanceMetrics.processedRows;
    }

    savePerformanceMetrics(performanceMetrics);
    throw error;
  } finally {
    // Limpar cache ao final para liberar memória
    spatialCache.clear();
    await db.sequelize.close();
    console.log('Database connection closed and cache cleared.');
  }
};
