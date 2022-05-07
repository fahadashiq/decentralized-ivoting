const pino = require('pino');
const fs = require('fs');
if (!fs.existsSync('logs')) {fs.mkdirSync('logs');}
const expressPino = require('express-pino-logger');
const dest = pino.destination('./logs/web3.log');
const isoTime = () => `,"time":"${new Date().toLocaleString()}"`;
// To set log level for different env set global variable LOG_LEVEL
const logger = pino({ level: process.env.LOG_LEVEL || 'info', prettyPrint: true,timestamp:isoTime }, dest);
const config = require('config');

var logrotate = require('logrotator');

// use the global rotator
var rotator = logrotate.rotator;

// check file rotation every 5 minutes, and rotate the file if its size exceeds 10 mb.
// keep only 3 rotated files and compress (gzip) them.
rotator.register('./logs/web3.log', {
  schedule: config.get('LOG_FILE_HOUSEKEEP_INTERVAL_MINUTES'), 
  size: config.get('LOG_FILE_MAX_SIZE_MB'), 
  compress: true, 
  count: 5, 
  format: function(index) {
    var d = new Date();
    return + d.getDate()+"-"+d.getMonth()+"-"+d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes();
  }
});

const expressLogger = expressPino({ logger });
module.exports = {
    info: function (obj) {
        logger.info(obj);
    },
    debug: function (obj) {
        logger.debug(obj);
    },
    error: function (obj) {
        logger.error(obj);
    },
    getExpressLogger: function () {
        return expressLogger;
    }

};