/**
 * `sridMap` provides a mapping between common Spatial Reference System Identifiers (SRIDs) and their
 * respective names or descriptions. SRIDs are used to define the coordinate system and projection
 * information for geospatial data.
 * The SRID values cover a variety of systems, from global projections like WGS 84 to regional systems
 * such as UTM zones and local grids like the Greek Grid (2100).
 */
export const sridMap: { [key: string]: string } = {
  '4326': 'WGS 84',
  '3857': 'Pseudo-Mercator (Web Mercator)',
  '4269': 'NAD83 (North American Datum 1983)',
  '4674': 'SIRGAS 2000', // IBGE
  '27700': 'OSGB 1936 / British National Grid',
  '25832': 'ETRS89 / UTM zone 32N',
  '32633': 'WGS 84 / UTM zone 33N',
  '32637': 'WGS 84 / UTM zone 37N',
  '23030': 'ED50 / UTM zone 30N',
  '31370': 'Belge 1972 / Belgian Lambert 72',
  '28992': 'Amersfoort / RD New',
  '29193': 'SAD69 / UTM zone 23S',
  '102100': 'ESRI: WGS 84 / Web Mercator',
  '3408': 'NSIDC Sea Ice Polar Stereographic North',
  '3413': 'WGS 84 / NSIDC Sea Ice Polar Stereographic South',
  '3035': 'ETRS89 / ETRS-LAEA Europe',
  '5649': 'PTRA08 / UTM zone 29N',
  '3995': 'WGS 84 / Arctic Polar Stereographic',
  '4087': 'WGS 84 / World Mercator',
  '2100': 'GGRS87 / Greek Grid',
};
