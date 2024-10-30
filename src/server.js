const express = require('express');
const server = express();
server.use(express.json());

// Index hosting
server.use(express.static('public'));

// Routers
const account = require('./routes/account.js');
server.use('/api/account', account);

server.listen(8081, () =>
  console.log(`Server running on: http://localhost:8081`)
);

module.exports = server;
