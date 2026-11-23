// Small helpers around the http module.

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

// An Error that carries an HTTP status code. The router uses it for the response.
function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

// The request body comes in chunks ('data' events) and ends with an 'end' event.
function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      // Bug 3: this callback runs later, outside the Promise executor.
      // If JSON.parse throws here, nothing catches it and the process crashes.
      // Catch it and reject, so the router can answer with 400.
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(httpError(400, 'Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

module.exports = { sendJson, httpError, readJson };
