const winston = require('winston');
const dir = __dirname + '/debug';

const logger = module.exports = winston.createLogger({
  transports: [
    new (winston.transports.Console)({ json: false, timestamp: true }),
    new winston.transports.File({ filename: dir + '/debug.log', json: false, level: 'error' })
  ],
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.simple()
  ),
  exitOnError: false
});