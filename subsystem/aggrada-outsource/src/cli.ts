/* eslint-disable no-console */
import { ingest, sources } from '.';
import { logGenericError } from './handlers';

const [, , command, ...args] = process.argv;

(async () => {
  if (command == 'log:error') {
    const message = args[0];
    const filename = args[1] || 'cli.log';

    if (!message) {
      console.error('Error: Message is required for logging.');
      process.exit(1);
    }

    const result = logGenericError({
      message,
      filename,
    });

    console.log('Log entry created successfully');

    process.exit(0);
  }

  if (command == 'fetch:ibgeLocality') {
    const result = await sources.fetchIbgeLocality({
      ibgeCode: args[1],
      locality: args[0] as
        | 'paises'
        | 'regioes'
        | 'estados'
        | 'mesorregioes'
        | 'microrregioes'
        | 'regioes-intermediarias'
        | 'regioes-imediatas'
        | 'municipios'
        | 'regioes-integradas-de-desenvolvimento'
        | 'regioes-metropolitanas'
        | 'subdistritos',
    });

    console.log(JSON.stringify(result, null, 2));

    process.exit(0);
  }

  if (command == 'fetch:ibgeAllLocalities') {
    const result = await sources.fetchIbgeAllLocalities({
      locality: args[0] as
        | 'paises'
        | 'regioes'
        | 'estados'
        | 'mesorregioes'
        | 'microrregioes'
        | 'regioes-intermediarias'
        | 'regioes-imediatas'
        | 'municipios'
        | 'regioes-integradas-de-desenvolvimento'
        | 'regioes-metropolitanas'
        | 'subdistritos',
    });

    console.log(JSON.stringify(result, null, 2));

    process.exit(0);
  }

  if (command == 'fetch:IbgeLocalityMap') {
    const result = await sources.fetchIbgeLocalityMap({
      ibgeCode: args[1],
      locality: args[0] as
        | 'paises'
        | 'regioes'
        | 'estados'
        | 'mesorregioes'
        | 'microrregioes'
        | 'regioes-imediatas'
        | 'regioes-intermediarias'
        | 'municipios',
      year: parseInt(args[2], 10),
    });

    console.log(JSON.stringify(result, null, 2));

    process.exit(0);
  }

  if (command == 'ingest:ibgeAllLocalities') {
    const years = args?.length > 0 ? args.map((arg) => parseInt(arg, 10)) : [];
    const result = await ingest.ingestIbgeAllLocalities({
      years,
    });

    console.log(JSON.stringify(result, null, 2));

    process.exit(0);
  }

  throw new Error('Command not recognized');
})();
