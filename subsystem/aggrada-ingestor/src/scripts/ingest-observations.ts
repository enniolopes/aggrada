#!/usr/bin/env tsx
// CLI para ingestão de observações
import 'dotenv/config';

import { ingestObservations } from '../../src/ingestors/observations';

const pppp_francisco_sjrp_controle1 = {
  files: [
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/pppp-francisco/sjrp-controle/sjrp-2018.csv',
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/pppp-francisco/sjrp-controle/sjrp-2019.csv',
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/pppp-francisco/sjrp-controle/sjrp-2020.csv',
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/pppp-francisco/sjrp-controle/sjrp-2021.csv',
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/pppp-francisco/sjrp-controle/sjrp-2022.csv',
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/pppp-francisco/sjrp-controle/sjrp-2023.csv',
  ],
  params: {
    spatialGeoCodeKey: 'numero_quarteirao',
    spatialSource: 'user',
    spatialAdminLevel: 'block',
    temporalKeys: ['mes'],
  },
};

const pppp_francisco_sjrp_controle2 = {
  files: [
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/pppp-francisco/sjrp-controle/sjrp-adl2012.csv',
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/pppp-francisco/sjrp-controle/sjrp-adl2013.csv',
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/pppp-francisco/sjrp-controle/sjrp-adl2014.csv',
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/pppp-francisco/sjrp-controle/sjrp-adl2015.csv',
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/pppp-francisco/sjrp-controle/sjrp-adl2016.csv',
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/pppp-francisco/sjrp-controle/sjrp-adl2017acima.csv',
  ],
  params: {
    spatialGeoCodeKey: 'quadra',
    spatialSource: 'user',
    spatialAdminLevel: 'block',
    temporalKeys: ['ano', 'mes'],
  },
};

const pppp_francisco_sjrp_controle3 = {
  files: [
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/pppp-francisco/sjrp-controle/sjrp2012-vig.csv',
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/pppp-francisco/sjrp-controle/sjrp2013-vig.csv',
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/pppp-francisco/sjrp-controle/sjrp2014-vig.csv',
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/pppp-francisco/sjrp-controle/sjrp2015-vig.csv',
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/pppp-francisco/sjrp-controle/sjrp2016-vig.csv',
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/pppp-francisco/sjrp-controle/sjrp2017acima-vig.csv',
  ],
  params: {
    spatialGeoCodeKey: 'quadra',
    spatialSource: 'user',
    spatialAdminLevel: 'block',
    temporalKeys: ['Ano', 'Mes'],
  },
};

const pppp_francisco_sinan = {
  files: [
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/pppp-francisco/sinan/SINAN-DENGON14.xlsx',
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/pppp-francisco/sinan/SINAN-DENGON15.xlsx',
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/pppp-francisco/sinan/SINAN-DENGON16.xlsx',
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/pppp-francisco/sinan/SINAN-DENGON17.xlsx',
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/pppp-francisco/sinan/SINAN-DENGON18.xlsx',
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/pppp-francisco/sinan/SINAN-DENGON19.xlsx',
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/pppp-francisco/sinan/SINAN-DENGON20.xlsx',
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/pppp-francisco/sinan/SINAN-DENGON21.xlsx',
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/pppp-francisco/sinan/SINAN-DENGON22.xlsx',
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/pppp-francisco/sinan/SINAN-DENGON23.xlsx',
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/pppp-francisco/sinan/SINAN-DENGON24.xlsx',
  ],
  params: {
    geoAddressKeys: ['NM_LOGRADO', 'NU_NUMERO', 'NM_BAIRRO', 'NU_CEP'],
    geoAddressPostalCodeKey: 'NU_CEP',
    spatialSource: 'user',
    spatialAdminLevel: 'address',
    temporalKeys: ['DT_SIN_PRI'],
  },
};

const pppp_francisco_sinan_dengue = {
  files: [
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/pppp-francisco/sinan-dengue/dengue_2012.csv',
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/pppp-francisco/sinan-dengue/dengue_2013.csv',
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/pppp-francisco/sinan-dengue/dengue_2014.csv',
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/pppp-francisco/sinan-dengue/dengue_2015.csv',
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/pppp-francisco/sinan-dengue/dengue_2016.csv',
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/pppp-francisco/sinan-dengue/dengue_2017.csv',
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/pppp-francisco/sinan-dengue/dengue_2018.csv',
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/pppp-francisco/sinan-dengue/dengue_2019.csv',
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/pppp-francisco/sinan-dengue/dengue_2020.csv',
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/pppp-francisco/sinan-dengue/dengue_2021.csv',
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/pppp-francisco/sinan-dengue/dengue_2022.csv',
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/pppp-francisco/sinan-dengue/dengue_2023.csv',
  ],
  params: {
    spatialGeoCodeKey: 'join_QUARTEIRAO',
    spatialSource: 'user',
    spatialAdminLevel: 'block',
    temporalKeys: ['DT_SIN_PRI'],
  },
};

const pppp_francisco_imoveis_abandonados = {
  files: [
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/pppp-francisco/sjrp-imoveis-abandonados/terrenos_imoveis_abandonados.xlsx',
  ],
  params: {
    spatialGeoCodeKey: 'join_QUARTEIRAO',
    spatialSource: 'user',
    spatialAdminLevel: 'block',
    temporalKeys: ['DT_SIN_PRI'],
  },
};

const inct_fome_sisvan = {
  files: [
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/inct-combate-fome/sisvan-estado-nutricional-2018/sisvan_estado_nutricional_2018.csv',
  ],
  params: {
    spatialGeoCodeKey: 'CO_MUNICIPIO_IBGE',
    spatialSource: 'ibge',
    spatialAdminLevel: 'city',
    temporalKeys: ['DT_ACOMPANHAMENTO'],
  },
};

const inct_fome_cad_unico_familia = {
  files: [
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/inct-combate-fome/cadastro-unico-microdados-dez-2018/base_amostra_familia_201812.csv',
  ],
  params: {
    spatialGeoCodeKey: 'cd_ibge',
    spatialSource: 'ibge',
    spatialAdminLevel: 'city',
    temporalKeyValue: '2018-12-31',
  },
};

const inct_fome_cad_unico_pessoa = {
  files: [
    '/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/raw-data/inct-combate-fome/cadastro-unico-microdados-dez-2018/base_amostra_pessoa_201812.csv',
  ],
  params: {
    spatialGeoCodeKey: 'cd_ibge',
    spatialSource: 'ibge',
    spatialAdminLevel: 'city',
    temporalKeyValue: '2018-12-31',
  },
};

(async () => {
  const items = [
    // inct_fome_cad_unico_pessoa,
    // inct_fome_sisvan,
    inct_fome_cad_unico_familia,
  ];

  try {
    for (const [i, item] of items.entries()) {
      console.log(`Processando grupo ${i + 1}/${items.length}`);

      for (const [j, file] of item.files.entries()) {
        console.log(`Arquivo ${j + 1}/${item.files.length}: ${file}`);

        try {
          console.log('Iniciando ingestão para:', file);
          await ingestObservations({
            file,
            ...item.params,
          });
          console.log('Ingestão finalizada com sucesso para:', file);
        } catch (error) {
          console.error(`Erro ao processar o arquivo ${file}:`, error);
          // Optionally continue with next file or break/throw based on your needs
        }
      }
      console.log(`Grupo ${i + 1} processado completamente.\n`);
    }

    console.log('Processamento de todos os arquivos concluído.');
  } catch (error) {
    console.error('Erro fatal durante o processamento:', error);
    process.exit(1);
  }
})();
