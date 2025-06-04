/* eslint-disable no-console */
import fs from 'node:fs';
import path from 'node:path';

import xlsx from 'xlsx';

/**
 * Streams and processes large Excel files (xlsx, xls) row by row for memory efficiency.
 * It allows processing of each row (or batch of rows) via a callback function.
 * The data is always kept as raw strings to prevent any type conversion.
 *
 * @param options - Configuration options for reading the Excel file.
 * @param processFn - Callback function to process each row or batch of rows.
 * @returns A promise that resolves when processing is complete.
 */
export const excelToJsonStream = async (
  {
    file,
    batchSize = 100,
  }: {
    file: string | Buffer; // File path or Buffer for in-memory Excel data
    batchSize?: number; // Optional batch size for processing multiple rows at once
  },
  processFn: (
    rows: Record<string, string>[],
    info: {
      batchNumber: number;
      batchSize: number;
    },
  ) => Promise<void> | void
): Promise<void> => {
  let workbook: xlsx.WorkBook;

  // Check if 'file' is a path (string) or a buffer
  if (typeof file === 'string') {
    const fileBuffer = fs.readFileSync(file);
    workbook = xlsx.read(fileBuffer, { type: 'buffer' });
  } else if (Buffer.isBuffer(file)) {
    workbook = xlsx.read(file, { type: 'buffer' });
  } else {
    throw new Error(
      'Invalid file input. It must be a string (file path) or Buffer.'
    );
  }

  const sheetName = workbook.SheetNames[0]; // Assuming the first sheet
  const sheet = workbook.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json<Record<string, string>>(sheet, {
    raw: false,
    defval: '',
  });
  const rowsBuffer: Record<string, string>[] = [];
  let currentBatchNumber = 0;

  for (const row of rows) {
    rowsBuffer.push(row);

    // Process batch when batchSize is reached
    if (rowsBuffer.length >= batchSize) {
      await processFn(rowsBuffer, {
        batchNumber: currentBatchNumber,
        batchSize: batchSize,
      });
      rowsBuffer.length = 0; // Clear buffer after processing
      currentBatchNumber++; // Increment batch number
    }
  }

  // Process any remaining rows
  if (rowsBuffer.length > 0) {
    await processFn(rowsBuffer, {
      batchNumber: currentBatchNumber,
      batchSize: batchSize,
    });
  }
};

/**
 * Extracts metadata and a sample from an Excel (xlsx/xls) file or Buffer.
 *
 * @param options - Configuration options for the Excel reading.
 * @returns A promise resolving to an object containing the metadata and sample.
 */
export const excelPreview = async ({
  file,
}: {
  file: string | Buffer; // File path or Buffer for in-memory Excel data
}): Promise<{
  headers: string[] | null;
  totalColumns: number;
  totalRows: number;
  fileSize: number | null; // in megabytes
  sample: Record<string, string | number>[]; // first 3 rows as a sample
}> => {
  let workbook: xlsx.WorkBook;
  let fileSize: number | null = null;

  // Handle file input as path or buffer
  if (typeof file === 'string') {
    try {
      const fileStats = fs.statSync(file); // Synchronously get file stats
      fileSize = fileStats.size / (1024 * 1024); // Convert bytes to megabytes

      const fileBuffer = fs.readFileSync(file);
      workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    } catch (error) {
      throw new Error(`Failed to calculate file size or read Excel file.\n${error}`);
    }
  } else if (Buffer.isBuffer(file)) {
    try {
      workbook = xlsx.read(file, { type: 'buffer' });
    } catch (error) {
      throw new Error(`Failed to read Excel buffer.\n${error}`);
    }
  } else {
    throw new Error(
      'Invalid file input. It must be a string (file path) or Buffer.'
    );
  }

  // Get the first sheet from the workbook
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('The Excel file contains no sheets.');
  }

  const worksheet = workbook.Sheets[sheetName];

  // Convert the sheet to JSON (header: 1 means each row is an array, not an object)
  const jsonData = xlsx.utils.sheet_to_json<string[]>(worksheet, { header: 1 });

  if (jsonData.length === 0) {
    throw new Error('The Excel file contains no data.');
  }

  const headers = jsonData[0] as string[];
  const totalColumns = headers.length;
  const totalRows = jsonData.length - 1; // Exclude the header row
  const sample = jsonData.slice(1, 4).map((row) => {
    const rowData: Record<string, string | number> = {};
    for (const [index, header] of headers.entries()) {
      rowData[header] = row[index] || ''; // Ensure empty cells are handled
    }
    return rowData;
  });

  return {
    headers,
    totalColumns,
    totalRows,
    fileSize,
    sample,
  };
};

/**
 * Compares headers of all Excel files in a directory and groups files by identical headers.
 * 
 * @param options - Configuration options for comparing Excel headers.
 * @returns A promise resolving to an object containing groups of files with identical headers.
 */
export const compareExcelHeaders = async ({
  directory,
}: {
  directory: string; // Path to the directory containing Excel files
}): Promise<{
  groups: Object[];
  summary: {
    totalFiles: number;
    uniqueHeaderGroups: number;
  };
}> => {
  // Regular expression to match Excel files (.xlsx, .xls)
  const filePattern = /\.(xlsx|xls)$/i;

  // Check if directory exists
  if (!fs.existsSync(directory)) {
    throw new Error(`Directory does not exist: ${directory}`);
  }
  
  // Get all Excel files from the directory
  const files = fs.readdirSync(directory)
    .filter(file => filePattern.test(file))
    .map(file => path.join(directory, file));
  
  // Return early if no files found
  if (files.length === 0) {
    return {
      groups: [],
      summary: {
        totalFiles: 0,
        uniqueHeaderGroups: 0
      }
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
      const preview = await excelPreview({
        file
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
            headers: sortedHeaders
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
      uniqueHeaderGroups: Object.keys(headerGroups).length
    }
  };
};
