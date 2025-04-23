/* eslint-disable no-console */
import 'dotenv/config';
import { createWriteStream, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join as joinPath } from 'path';
import { Op } from 'sequelize';
import { db } from '../db';
import { mapper, transformer } from '@simple4decision/aggrada-core';
import { fetchObservationsOffSet } from './fetchObservations';
import { writeCsvStreaming } from './writeCsvStreaming';

type GeometryType = (typeof db.AggradaSpatial)['prototype']['geometry'];

type AggregatedDataKeys = {
  key_spatial_id: number;
  key_spatial_geo_code: string | undefined;
  key_spatial_source: string;
  key_spatial_start_date: string | undefined; // convertido para string ISO
  key_time_label: string;
  key_time_start_date: string; // convertido para string ISO
  key_time_end_date: string;   // convertido para string ISO
};

async function runAggregationAndExport({
  aoiGeoCode,
  source,
  subdivision,
  subdivisionSource,
  timeRange,
  timeGranularity,
  outputPath,
}: {
  aoiGeoCode: string;
  source: string;
  subdivision: keyof typeof mapper.adminLevelMap;
  subdivisionSource: string;
  timeRange: { start: Date; end: Date };
  timeGranularity: keyof typeof mapper.timeGranularity;
  outputPath: string;
}): Promise<void> {
  const aoiSpatialRecord = await db.AggradaSpatial.findOne({
    attributes: ['geometry'],
    where: {
      geo_code: aoiGeoCode,
      source,
    },
  });
  if (!aoiSpatialRecord?.geometry) {
    throw new Error('AOI geometry not found');
  }

  const aoi = aoiSpatialRecord.geometry;

  const subdivisions = await db.AggradaSpatial.findAll({
    where: {
      admin_level: subdivision,
      source: subdivisionSource,
      [Op.and]: db.sequelize.where(
        db.sequelize.fn('ST_Within', db.sequelize.col('geometry'), db.sequelize.fn('ST_GeomFromGeoJSON', JSON.stringify(aoi))),
        true
      ),
    },
    attributes: ['id', 'geo_code', 'source', 'start_date', 'geometry'],
  });

  const temporalRanges = transformer.generateTimeIntervals({
    timeRange,
    granularity: timeGranularity,
  });

  // Convertendo datas para ISO string ao criar as chaves, evitando checks posteriores
  const aggregationUniqueKeys: AggregatedDataKeys[] = [];
  for (let i = 0; i < subdivisions.length; i++) {
    const subdiv = subdivisions[i];
    const id = subdiv.dataValues.id;
    const geo_code = subdiv.dataValues.geo_code;
    const src = subdiv.dataValues.source;
    const startDt = subdiv.dataValues.start_date ? new Date(subdiv.dataValues.start_date).toISOString() : undefined;

    for (let j = 0; j < temporalRanges.length; j++) {
      const { start, end, label } = temporalRanges[j];
      aggregationUniqueKeys.push({
        key_spatial_id: id,
        key_spatial_geo_code: geo_code,
        key_spatial_source: src,
        key_spatial_start_date: startDt,
        key_time_label: label,
        key_time_start_date: start.toISOString(),
        key_time_end_date: end.toISOString(),
      });
    }
  }

  const allColumns = new Set<string>([
    'key_spatial_id',
    'key_spatial_geo_code',
    'key_spatial_source',
    'key_spatial_start_date',
    'key_time_label',
    'key_time_start_date',
    'key_time_end_date',
  ]);

  const tempFilePath = joinPath(tmpdir(), `aggregation_temp_${Date.now()}.jsonl`);
  const tempFileStream = createWriteStream(tempFilePath, { flags: 'w' });

  // Mapa para acesso O(1) às geometrias
  const geometryMap = new Map<number, GeometryType>();
  for (let i = 0; i < subdivisions.length; i++) {
    const s = subdivisions[i];
    geometryMap.set(s.dataValues.id, s.dataValues.geometry);
  }

  const limit = 10000;

  for (let i = 0; i < aggregationUniqueKeys.length; i++) {
    const keyItem = aggregationUniqueKeys[i];
    const geom = geometryMap.get(keyItem.key_spatial_id);

    if (!geom) {
      tempFileStream.write(JSON.stringify(keyItem) + '\n');
      continue;
    }

    let offset = 0;
    let hasMore = true;
    const aggregatedRecord: Record<string, any[]> = {};

    while (hasMore) {
      const observations = await fetchObservations({
        inputGeometry: geom,
        timeRange: {
          start: new Date(keyItem.key_time_start_date),
          end: new Date(keyItem.key_time_end_date),
        },
        limit,
        offset,
      });

      const length = observations.length;
      if (length === 0) {
        hasMore = false;
        break;
      }

      for (let obsIndex = 0; obsIndex < length; obsIndex++) {
        const obs = observations[obsIndex];
        const dataEntries = Object.entries(obs.data);
        for (let deIndex = 0; deIndex < dataEntries.length; deIndex++) {
          const [k, v] = dataEntries[deIndex];
          let arr = aggregatedRecord[k];
          if (!arr) {
            arr = [];
            aggregatedRecord[k] = arr;
          }
          arr.push(v);
        }
      }

      if (length < limit) {
        hasMore = false;
      } else {
        offset += limit;
      }
    }

    const dynamicKeys = Object.keys(aggregatedRecord);
    for (let dkIndex = 0; dkIndex < dynamicKeys.length; dkIndex++) {
      allColumns.add(dynamicKeys[dkIndex]);
    }

    const lineObj = { ...keyItem, ...aggregatedRecord };
    tempFileStream.write(JSON.stringify(lineObj) + '\n');
  }

  tempFileStream.end();
  await new Promise<void>(resolve => tempFileStream.on('finish', resolve));

  await writeCsvStreaming({
    inputJsonlPath: tempFilePath,
    outputPath,
    columns: Array.from(allColumns),
  });

  unlinkSync(tempFilePath);
}

(async () => {
  try {
    const startDate = new Date(2020, 1, 1);
    const endDate = new Date(2020, 12, 31);
    const outputPath = '/home/ennio.lopes/repo/simple4decision/monorepo/subsystem/aggrada-aggregator/.local/aggregations/cadunico_ibge_35_municipios_yearly.csv';

    await runAggregationAndExport({
      aoiGeoCode: '35',
      source: 'ibge',
      subdivision: 'municipios',
      subdivisionSource: 'ibge',
      timeRange: { start: startDate, end: endDate },
      timeGranularity: 'yearly',
      outputPath,
    });

    console.log('CSV export finished successfully.');
  } catch (err) {
    console.error('Error:', err);
  }
})();
