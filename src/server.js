const express = require('express');
const server = express();
server.use(express.json());

// Routers
import account from './routes/account.js';
server.use('/api/account', account);

server.listen(8080, () =>
  console.log(`Server running on: http://localhost:8080`)
);

module.exports = server;