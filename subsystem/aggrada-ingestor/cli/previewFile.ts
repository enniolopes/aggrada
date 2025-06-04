import { reader } from '@simple4decision/aggrada-core';
import path from 'node:path';

// Get command line arguments
const args = process.argv.slice(2);

// Show usage if no file path is provided
if (args.length === 0) {
  console.log('Usage: npx tsx cli/previewFile.ts <file_path>');
  console.log('Supported file types: .csv, .xlsx, .xls');
  process.exit(1);
}

const filePath = args[0];

// Get file extension to determine the file type
const fileExtension = path.extname(filePath).toLowerCase();

try {
  switch (fileExtension) {
    case '.csv':
      console.log('File type: CSV');
      reader.csvPreview({
        file: filePath,
      }).then(preview => {
        console.log('CSV Preview:');
        console.log(preview);
      });
      break;
    case '.xlsx':
      console.log('File type: Excel xlsx');
      reader.excelPreview({
        file: filePath,
      }).then(preview => {
        console.log('Excel Preview:');
        console.log('Headers:', preview.headers);
        console.log('Total Columns:', preview.totalColumns);
        console.log('Total Rows:', preview.totalRows);
        console.log('File Size (MB):', preview.fileSize);
        console.log('Sample (first rows):');
        console.log(preview.sample);
      });
      break;
    case '.xls':
      console.log('File type: Excel xls');
      reader.excelPreview({
        file: filePath,
      }).then(preview => {
        console.log('Excel Preview:');
        console.log('Headers:', preview.headers);
        console.log('Total Columns:', preview.totalColumns);
        console.log('Total Rows:', preview.totalRows);
        console.log('File Size (MB):', preview.fileSize);
        console.log('Sample (first rows):');
        console.table(preview.sample);
      });
      break;
      
    default:
      console.error(`Unsupported file type: ${fileExtension}`);
      console.log('Supported file types: .csv, .xlsx, .xls');
      process.exit(1);
  }
} catch (error) {
  console.error('Error previewing file:', error);
  process.exit(1);
}
