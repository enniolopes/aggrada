import { mapper } from '@simple4decision/aggrada-core';

/**
 * This file maps IBGE locality types to the admin level used in the mapper.
 * It is used to determine the admin level of a locality based on its type.
 */
const adminLevels = [...Object.keys(mapper.adminLevelMap), 'unknown'] as const;

export const ibgeLocalitiesAdminLevel: {
  [key: string]: (typeof adminLevels)[number];
} = {
  paises: 'country',
  regioes: 'region',
  estados: 'state',
  mesorregioes: 'mesorregioes',
  microrregioes: 'microrregioes',
  'regioes-intermediarias': 'regioes-intermediarias',
  'regioes-imediatas': 'regioes-imediatas',
  municipios: 'city',
  // 'regioes-integradas-de-desenvolvimento': 'district',
  // 'regioes-metropolitanas': 'district',
  subdistritos: 'subdistrict',
};
