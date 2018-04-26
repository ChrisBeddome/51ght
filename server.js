const http = require("http");
const app = require("./app");
const config = require("./config/config");

// //run mongoDB
// const { exec } = require('child_process');
// const child = exec('npm run mongo');

const server = http.createServer(app);

server.listen(config.port);