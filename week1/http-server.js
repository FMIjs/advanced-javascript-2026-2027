const http = require('http');

function requestHandler(req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World!');
}

const server = http.createServer(requestHandler);

server.on('error', function (error) {
  console.error(error);
});

server.listen(8080, function () {
  console.log('Server listening on http://localhost:8080');
});
