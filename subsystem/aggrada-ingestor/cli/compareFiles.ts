import { reader } from '@simple4decision/aggrada-core';

// Get command line arguments
const args = process.argv.slice(2,4);

// Show usage if no file path is provided
if (args.length !== 2) {
  console.log('Usage: npx tsx cli/compareFile.ts <file_extension> <file_path>');
  console.log('Supported file types: .csv, .xlsx, .xls');
  process.exit(1);
}

const filesExtension = `.${args[0]}`;
const directoryPath = args[1];


try {
  switch (filesExtension) {
    case '.csv':
      console.log('File type: CSV');
      reader.compareCSVHeaders({
        directory: directoryPath,
      }).then(comparison => {
        console.log('CSV Header Comparison:');
        console.log(JSON.stringify(comparison, null, 2));
      });
      break;
    case '.xlsx':
      console.log('File type: Excel xlsx');
      reader.compareExcelHeaders({
        directory: directoryPath,
      }).then(comparison => {
        console.log('Excel Header Comparison:');
        console.log(JSON.stringify(comparison, null, 2));
      });
      break;
    case '.xls':
      console.log('File type: Excel xls');
      reader.compareExcelHeaders({
        directory: directoryPath,
      }).then(comparison => {
        console.log('Excel Header Comparison:');
        console.log(JSON.stringify(comparison, null, 2));
      });
      break;
      
    default:
      console.error(`Unsupported files type: ${filesExtension}`);
      console.log('Supported files types: .csv, .xlsx, .xls');
      process.exit(1);
  }
} catch (error) {
  console.error('Error previewing file:', error);
  process.exit(1);
}
