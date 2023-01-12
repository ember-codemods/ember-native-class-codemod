const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;

const logFormatter = printf((info) => {
  return `${info.timestamp} [${info.level}] ${info.message}`;
});

module.exports = createLogger({
  format: combine(timestamp(), logFormatter),
  transports: [new transports.File({ filename: 'codemods.log' })],
});
