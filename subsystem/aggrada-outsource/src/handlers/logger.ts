import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export interface LogEntry {
  id: string;
  locality: string;
  year: string | number;
  error: string | Error;
}

export const logError = (entry: LogEntry): void => {
  const logDir = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../',
    '.log'
  );
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logFile = path.join(logDir, 'ibge-localities-errors.log');
  const errorLog = `${new Date().toISOString()} - Error fetching ${entry.id} (${entry.locality}, ${entry.year}): ${entry.error}\n`;
  fs.appendFileSync(logFile, errorLog);
};

export const logGenericError = ({
  message,
  filename,
}: {
  message: string;
  filename?: string;
}): void => {
  const logDir = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../',
    '.log'
  );
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logFile = path.join(logDir, filename || 'generic-error.log');
  const errorLog = `${new Date().toISOString()} - ${message}\n`;
  fs.appendFileSync(logFile, errorLog);
};
