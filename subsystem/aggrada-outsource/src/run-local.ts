/* eslint-disable no-console */
import { sources } from './';

const RUN_FUNCTION = 'osmLatLongFromAddress';

const testLocal = async ({
  func,
}: {
  func:
    | 'ibgeCityMap'
    | 'ibgeCityRegistry'
    | 'ibgeAllCitiesRegistry'
    | 'osmLatLongFromAddress';
}) => {
  if (func == 'osmLatLongFromAddress') {
    return await sources.osmLatLongFromAddress({
      fullAddress:
        'Rua Vereador Lucas Perroni Junior, 551 - São Carlos - SP - Brasil',
    });
  }

  if (func == 'ibgeCityMap') {
    return await sources.ibgeCityMap({
      ibgeCode: '3548906',
      year: 2022,
    });
  }

  if (func == 'ibgeCityRegistry') {
    return await sources.ibgeCityRegistry({
      ibgeCode: '3548906',
    });
  }

  if (func == 'ibgeAllCitiesRegistry') {
    return await sources.ibgeAllCitiesRegistry();
  }

  return;
};

testLocal({ func: RUN_FUNCTION }).then(console.log);
