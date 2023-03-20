import { createLogger, format, transports } from 'winston';
import { assert, isRecord } from './util/types';
import { inspect } from 'node:util';

const { combine, timestamp, printf } = format;

const logFormatter = printf(({ level, timestamp, message: raw }) => {
  assert(typeof timestamp === 'string');
  let message = `${timestamp} ${level.toLocaleUpperCase()}: `;
  if (typeof raw === 'string') {
    message += raw;
  } else if (isRecord(raw)) {
    if (typeof raw['filePath'] === 'string') {
      message += `[${raw['filePath']}]`;
    }
    if (typeof raw['info'] === 'string') {
      message += `\n\t${raw['info']}`;
    }
    if (raw['error'] instanceof Error) {
      message += `\n\t${raw['error'].name}: ${raw['error'].message}`;
    }
  } else {
    message += `Unhandled log message type, message=${inspect(raw)}`;
  }

  return message;
});

const logger = createLogger({
  format: combine(timestamp(), logFormatter),
  transports: [new transports.File({ filename: 'codemods.log' })],
});

export default logger;
