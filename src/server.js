import express from 'express';
import logger from './utils/logger.js';
import { env } from './utils/env.js';
const server = express();
server.use(express.json());

// Index hosting
server.use(express.static('public'));

// Logging API call and set X-Request-ID header
server.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || 'N/A';
  req.debug = logger.bind(null, requestId, 'DEBUG');
  req.info = logger.bind(null, requestId, 'INFO');
  req.warn = logger.bind(null, requestId, 'WARN');
  req.error = logger.bind(null, requestId, 'ERROR');
  req.debug(`New request (${env()})`);
  req.debug(`Path=${req.path}`);
  req.debug(`Body=${JSON.stringify(req.body)}`);
  res.set('x-request-id', requestId);
  next();
});

// Routers
import account from './routes/account.js';
server.use('/api/account', account);

export default server;
