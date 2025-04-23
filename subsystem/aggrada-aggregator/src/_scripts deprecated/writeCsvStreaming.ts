import { createWriteStream, createReadStream } from 'fs';
import { createInterface } from 'readline';

export async function writeCsvStreaming({
    inputJsonlPath,
    outputPath,
    columns,
  }: {
    inputJsonlPath: string;
    outputPath: string;
    columns: string[];
  }): Promise<void> {
    const outputStream = createWriteStream(outputPath, { flags: 'w' });
  
    outputStream.write(columns.join(',') + '\n');
  
    const lineReader = createInterface({
      input: createReadStream(inputJsonlPath),
      crlfDelay: Infinity,
    });
  
    for await (const line of lineReader) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const obj = JSON.parse(trimmed);
      const row = new Array(columns.length);
      for (let i = 0; i < columns.length; i++) {
        const col = columns[i];
        const val = obj[col];
        if (Array.isArray(val)) {
          row[i] = JSON.stringify(val);
        } else if (typeof val === 'string') {
          // Checa se precisa escapar
          const quoteIndex = val.indexOf('"');
          row[i] = quoteIndex !== -1 ? val.replace(/"/g, '""') : val;
        } else if (val === null || val === undefined) {
          row[i] = '';
        } else {
          // Caso não seja string, array ou null, mas que o original exige ISO date: já convertemos antes
          // Se ainda houver date objects, convertemos:
          if (val instanceof Date) {
            row[i] = val.toISOString();
          } else {
            const strVal = String(val);
            const quoteIndex = strVal.indexOf('"');
            row[i] = quoteIndex !== -1 ? strVal.replace(/"/g, '""') : strVal;
          }
        }
      }
      outputStream.write(row.join(',') + '\n');
    }
  
    outputStream.end();
    await new Promise<void>(resolve => outputStream.on('finish', resolve));
  }
  