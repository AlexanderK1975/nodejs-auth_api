import { createLogger, transports, format } from 'winston';
import fs from 'fs';
import path from 'path';

const { combine, timestamp, label, printf } = format;

const createFolder = (logFile) => {
    const logDir = path.dirname(logFile);

    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
};

const errorLogFile = process.env.INFO_LOGS || 'logs/error.log';
const infoLogFile = process.env.INFO_LOGS || 'logs/app.log';

createFolder(errorLogFile);
createFolder(infoLogFile);

const loggerFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${level}] [${label}] ${message}`;
});

const loggerTransports = [
    new transports.File({ filename: errorLogFile, level: "warn", maxsize: 5242880, maxFiles: 10, handleExceptions: true }),
    new transports.File({ filename: infoLogFile, maxsize: 5242880, maxFiles: 10 }),
];
  
const logger = createLogger({
    level: process.env.LOGS_LEVEL || 'info',
    format: combine(
        timestamp(),
        label({ label: process.env.LOGS_LABEL || 'Auth API' }),
        loggerFormat
    ),
    transports: loggerTransports,
    exitOnError: false
});

export { logger }