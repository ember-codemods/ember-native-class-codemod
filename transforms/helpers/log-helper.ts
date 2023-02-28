import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf } = format;

const logFormatter = printf((info) => {
  return `${info['timestamp'] as string} [${info.level}] ${info.message}`;
});

const logger = createLogger({
  format: combine(timestamp(), logFormatter),
  transports: [new transports.File({ filename: 'codemods.log' })],
});

export default logger;
