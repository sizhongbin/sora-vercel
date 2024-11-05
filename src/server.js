import express from 'express';
const server = express();
server.use(express.json());

// Index hosting
server.use(express.static('public'));

// Routers
import account from './routes/account.js';
server.use('/api/account', account);

export default server;
