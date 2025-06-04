// Ingestor de geometrias georreferenciadas para AggradaSpatials
import { reader } from '@simple4decision/aggrada-core';
import { db } from '../db';

type IngestGeometryParams = Parameters<typeof reader.readShapefile>[0];

export async function ingestShapefile({
  shpPath,
  dbfPath,
  prjPath,
  cpgPath,
  srid,
  codeKey,
  nameKey,
  level,
  source
}: IngestGeometryParams) {
  // Lê as feições do arquivo shapefile/geojson
  const features = await reader.readShapefile({
    shpPath,
    dbfPath,
    prjPath,
    cpgPath,
    srid,
    codeKey,
    nameKey,
    level,
    source
  });
  if (!features || features.length === 0) {
    throw new Error('Nenhuma feição encontrada no arquivo.');
  }
  // Persiste cada feição na tabela AggradaSpatials
  for (const feature of features) {
    // console.log(feature);
    await db.AggradaSpatial.create({
      geo_code: feature.code,
      source,
      start_date: feature.startDate,
      properties: feature.properties,
      admin_level: feature.admin_level,
      raw_geometry: feature.geometry,
      raw_srid: feature.raw_srid,
      geometry: feature.geometry,
      core_file: shpPath,
    });
  }
}

export const ingestGeoJson = async ({
  file,
  codeKey,
  nameKey,
  level,
  source
}: {
  file: string;
  codeKey?: string;
  nameKey?: string;
  level?: string;
  source?: string;
}) => {
    const features = await reader.readGeoJSON({
      filePath: file,
      codeKey,
      nameKey,
      level,
      source
    });

  if (!features || features.length === 0) {
    throw new Error('Nenhuma feição encontrada no arquivo.');
  }

  // Persiste cada feição na tabela AggradaSpatials
  for (const feature of features) {
    // console.log(feature);
    // await db.AggradaSpatial.create({
      // geo_code: feature.code,
      // source,
      // start_date: feature.startDate,
      // properties: feature.properties,
      // admin_level: level || feature.admin_level,
      // raw_geometry: feature.geometry,
      // raw_srid: feature.raw_srid,
      // geometry: feature.geometry,
      // core_file: file,
    // });

    /**
     * Desenvolva um script que procura no banco de dados aggrada_spatials pelo geo_code, source e admin_level
     * se encontrar atualiza a geometria, se não encontrar insere um novo registro
     */
    const existingFeature = await db.AggradaSpatial.findOne({
      where: {
        geo_code: `${feature.code}`,
        source,
        admin_level: level || feature.admin_level,
      },
    });
    if (existingFeature) {
      console.log('Atualizando geometria existente:', existingFeature.id);
      await db.AggradaSpatial.update(
        {
          source,
          properties: feature.properties,
          admin_level: level || feature.admin_level,
          raw_geometry: feature.geometry,
          raw_srid: feature.raw_srid,
          geometry: feature.geometry,
          core_file: file,
        },
        {
          where: {
            id: existingFeature.id,
          }
        }
      );
    }
    else {
      console.log('Criando nova geometria:', feature.code);
      await db.AggradaSpatial.create({
        data: {
          geo_code: `${feature.code}`,
          source,
          start_date: feature.startDate,
          properties: feature.properties,
          admin_level: level || feature.admin_level,
          raw_geometry: feature.geometry,
          raw_srid: feature.raw_srid,
          geometry: feature.geometry,
          core_file: file,
        },
      });
    }

  }
}
