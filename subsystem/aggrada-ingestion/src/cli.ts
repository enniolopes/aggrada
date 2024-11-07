/* eslint-disable no-console */
import { reader } from '@simple4decision/aggrada-core';

const [, , command, ...args] = process.argv;

(async () => {
  if (command == 'csvPreview') {
    const file = args[0];

    console.log(await reader.csvPreview({ file }));
    return;
  }

  if (command == 'excelPreview') {
    const file = args[0];

    console.log(await reader.excelPreview({ file }));
    return;
  }

  // add more functions here

  throw new Error('Command not recognized');
})();
