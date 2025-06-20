import fs from 'node:fs';
import { Readable } from 'node:stream';
import { promisify } from 'node:util';
import path from 'node:path';

import { parse } from 'csv-parse';

/**
 * Streams and processes large CSV files or buffers line by line, ensuring memory efficiency.
 * It allows processing of each row (or batch of rows) via a callback function.
 * The data is always kept as raw strings to prevent any type conversion.
 *
 * @param options - Configuration options for the CSV reading.
 * @param processFn - Callback function to process each row or batch of rows.
 * @returns A promise that resolves when processing is complete.
 */
export const csvToJsonStream = async (
  {
    file,
    columns = true,
    batchSize = 100,
  }: {
    file: string | Buffer; // File path or Buffer for in-memory CSV data
    columns?: boolean; // Whether the first row contains headers (optional)
    batchSize?: number; // Optional batch size for processing multiple rows at once
  },
  processFn: (
    rows: Record<string, string>[],
    info: {
      batchNumber: number;
      batchSize: number;
    }
  ) => Promise<void> | void,
  p0: () => void
): Promise<void> => {
  let stream: Readable;

  // Check if 'file' is a path (string) or a buffer
  if (typeof file === 'string') {
    stream = fs.createReadStream(file); // File path
  } else if (Buffer.isBuffer(file)) {
    stream = Readable.from(file.toString()); // Buffer
  } else {
    throw new Error(
      'Invalid file input. It must be a string (file path) or Buffer.'
    );
  }

  const delimiter = (await detectCSVDelimiter({ file })).delimiter;
  const parser = parse({
    delimiter,
    columns,
    trim: true,
    relax_quotes: true,
  });
  const rowsBuffer: Record<string, string>[] = [];
  let currentBatchNumber = 0;

  return new Promise((resolve, reject) => {
    stream
      .pipe(parser)
      .on('data', async (row: Record<string, string>) => {
        rowsBuffer.push(row);

        // Process batch when batchSize is reached
        if (rowsBuffer.length >= batchSize) {
          parser.pause(); // Pause reading while processing batch
          try {
            await processFn(rowsBuffer, {
              batchNumber: currentBatchNumber,
              batchSize: batchSize,
            });
            rowsBuffer.length = 0; // Clear buffer after processing
            currentBatchNumber++; // Increment batch number
            parser.resume(); // Resume reading
          } catch (error) {
            reject(error); // If processing fails, reject the promise
          }
        }
      })
      .on('end', async () => {
        // Process any remaining rows
        if (rowsBuffer.length > 0) {
          try {
            await processFn(rowsBuffer, {
              batchNumber: currentBatchNumber,
              batchSize: batchSize,
            });
            resolve();
          } catch (error) {
            reject(error);
          }
        } else {
          resolve(); // No remaining rows, resolve the promise
        }
      })
      .on('error', (error) => {
        reject(error); // Handle file read errors
      });
  });
};

/**
 * Extracts metadata and a sample from a CSV file or Buffer
 *
 * @param options - Configuration options for the CSV reading.
 * @returns A promise resolving to an object containing the metadata and sample.
 */
export const csvPreview = async ({
  file,
  columns = true,
}: {
  file: string | Buffer; // File path or Buffer for in-memory CSV data
  columns?: boolean; // Whether the first row contains headers (optional)
}): Promise<{
  headers: string[] | null;
  totalColumns: number;
  totalRows: number;
  fileSize: number | null; // in megabytes
  sample: Record<string, string>[];
}> => {
  // Utility to get file stats
  const stat = promisify(fs.stat);

  let stream: Readable;
  let fileSize: number | null = null;

  // Handle file input as path or buffer
  if (typeof file === 'string') {
    stream = fs.createReadStream(file); // File path
    const fileStats = await stat(file); // Get file stats for size
    fileSize = fileStats.size / (1024 * 1024); // Convert bytes to megabytes
  } else if (Buffer.isBuffer(file)) {
    stream = Readable.from(file.toString()); // Buffer input
  } else {
    throw new Error(
      'Invalid file input. It must be a string (file path) or Buffer.'
    );
  }

  const delimiter = (await detectCSVDelimiter({ file })).delimiter;
  const parser = parse({
    delimiter,
    columns,
    trim: true,
    relax_quotes: true,
  });
  const sampleData: Record<string, string>[] = [];
  let headers: string[] | null = null;
  let totalRows = 0;

  return new Promise((resolve, reject) => {
    stream
      .pipe(parser)
      .on('data', (row: Record<string, string>) => {
        // Capture headers on the first row if necessary
        if (totalRows === 0 && columns && !headers) {
          headers = Object.keys(row);
        }

        // Capture the first 3 rows as sample
        if (totalRows < 3) {
          sampleData.push(row);
        }

        totalRows++;
      })
      .on('end', () => {
        resolve({
          headers,
          totalColumns: headers?.length || 0,
          totalRows,
          fileSize,
          sample: sampleData,
        });
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

/**
 * Compares headers of all CSV files in a directory and groups files by identical headers.
 *
 * @param options - Configuration options for comparing CSV headers.
 * @returns A promise resolving to an object containing groups of files with identical headers.
 */
export const compareCSVHeaders = async ({
  directory,
}: {
  directory: string; // Path to the directory containing CSV files
}): Promise<{
  groups: Object[];
  summary: {
    totalFiles: number;
    uniqueHeaderGroups: number;
  };
}> => {
  // Regular expression to match CSV files
  const filePattern = /\.csv$/i;

  // Check if directory exists
  if (!fs.existsSync(directory)) {
    throw new Error(`Directory does not exist: ${directory}`);
  }

  // Get all CSV files from the directory
  const files = fs
    .readdirSync(directory)
    .filter((file) => filePattern.test(file))
    .map((file) => path.join(directory, file));

  // Return early if no files found
  if (files.length === 0) {
    return {
      groups: [],
      summary: {
        totalFiles: 0,
        uniqueHeaderGroups: 0,
      },
    };
  }

  // Map to store groups of files with identical headers
  const headerGroups: {
    [headerKey: string]: {
      files: string[];
      headers: string[];
    };
  } = {};

  // Process each file to extract headers
  for (const file of files) {
    try {
      const preview = await csvPreview({
        file,
        columns: true,
      });

      if (preview.headers) {
        // Sort headers to ensure consistent comparison
        const sortedHeaders = [...preview.headers].sort();
        // Create a string key from sorted headers for grouping
        const headerKey = JSON.stringify(sortedHeaders);

        // Add to existing group or create new group
        if (!headerGroups[headerKey]) {
          headerGroups[headerKey] = {
            files: [],
            headers: sortedHeaders,
          };
        }

        // Add file to appropriate group
        headerGroups[headerKey].files.push(file);
      }
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
      // Continue with next file even if one fails
    }
  }

  return {
    groups: Object.values(headerGroups),
    summary: {
      totalFiles: files.length,
      uniqueHeaderGroups: Object.keys(headerGroups).length,
    },
  };
};

/**
 * Detects the delimiter used in a CSV file by analyzing a sample of the file content.
 * It checks for common delimiters and selects the one that produces the most consistent column count.
 *
 * @param file - Path to a CSV file or a Buffer containing CSV data.
 * @returns A promise resolving to the detected delimiter and confidence metadata.
 */
export const detectCSVDelimiter = async ({
  file,
}: {
  file: string | Buffer;
}): Promise<{
  delimiter: string;
  confidence: number; // 0-1 score indicating confidence in the detected delimiter
  possibleDelimiters: Array<{
    delimiter: string;
    consistency: number;
    avgColumns: number;
  }>;
}> => {
  // Common delimiters to check
  const delimitersToCheck = [',', ';', '\t', '|', ':'];

  // Read file sample
  let sampleContent: string;

  if (typeof file === 'string') {
    // Read first 10KB of the file to analyze
    const fd = fs.openSync(file, 'r');
    const buffer = Buffer.alloc(10240); // 10KB
    fs.readSync(fd, buffer, 0, 10240, 0);
    fs.closeSync(fd);
    sampleContent = buffer.toString().replace(/\0/g, ''); // Remove null bytes
  } else if (Buffer.isBuffer(file)) {
    // Use the buffer directly, but limit to first 10KB
    sampleContent = file.slice(0, 10240).toString();
  } else {
    throw new Error(
      'Invalid file input. It must be a string (file path) or Buffer.'
    );
  }

  // Split into lines
  const lines = sampleContent
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  // Analyze at most 20 lines
  const linesToAnalyze = lines.slice(0, Math.min(20, lines.length));

  if (linesToAnalyze.length < 2) {
    // Not enough data to analyze
    return {
      delimiter: ',', // Default to comma
      confidence: 0,
      possibleDelimiters: [],
    };
  }

  // Test each delimiter
  const results = delimitersToCheck.map((delimiter) => {
    // Parse lines with current delimiter and count columns per line
    const columnCounts = linesToAnalyze.map((line) => {
      // Count columns (considering quoted fields)
      const fields = [];
      let field = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          fields.push(field);
          field = '';
        } else {
          field += char;
        }
      }

      // Add the last field
      fields.push(field);
      return fields.length;
    });

    // Calculate consistency and average column count
    const uniqueCounts = new Set(columnCounts);
    const maxCount = Math.max(...columnCounts);
    const consistency = 1 - (uniqueCounts.size - 1) / linesToAnalyze.length;
    const avgColumns =
      columnCounts.reduce((sum, count) => sum + count, 0) / columnCounts.length;

    return {
      delimiter,
      consistency,
      avgColumns,
      maxColumnCount: maxCount,
    };
  });

  // Sort results by consistency, then by average column count
  results.sort((a, b) => {
    // First prioritize consistency
    if (b.consistency !== a.consistency) {
      return b.consistency - a.consistency;
    }
    // If consistency is the same, prefer the one with more columns
    return b.avgColumns - a.avgColumns;
  });

  // Return the best match
  const bestMatch = results[0];

  return {
    delimiter: bestMatch.delimiter,
    confidence: bestMatch.consistency,
    possibleDelimiters: results.map((r) => ({
      delimiter: r.delimiter,
      consistency: r.consistency,
      avgColumns: r.avgColumns,
    })),
  };
};
