import { createLogger, format, transports } from 'winston';
import { assert } from './util/types';

const { combine, timestamp, printf } = format;

const logFormatter = printf(({ level, timestamp, message }) => {
  assert(typeof timestamp === 'string');
  assert(typeof message === 'string');
  return `${timestamp} [${level}] ${message}`;
});

const logger = createLogger({
  format: combine(timestamp(), logFormatter),
  transports: [new transports.File({ filename: 'codemods.log' })],
});

export default logger;
