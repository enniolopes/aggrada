import { Options } from 'tsup';
import { tsupConfig } from '@ttoss/config';

export const tsup: Options = tsupConfig({
  entryPoints: ['src/index.ts'],
  platform: 'node',
});
