const { sendJson } = require('./http');

// A tiny router: router.get('/events/:id', handler)
// handler(req, res, params) gets the path parameters as strings: { id: '1' }
class Router {
  constructor() {
    this.routes = [];
  }

  add(method, path, handler) {
    const names = [];
    // '/events/:id' -> /^\/events\/([^/]+)$/ and names = ['id']
    const pattern = path.replace(/:(\w+)/g, (_, name) => {
      names.push(name);
      return '([^/]+)';
    });
    this.routes.push({ method, regex: new RegExp(`^${pattern}$`), names, handler });
  }

  get(path, handler) {
    this.add('GET', path, handler);
  }

  post(path, handler) {
    this.add('POST', path, handler);
  }

  handle(req, res) {
    const { pathname } = new URL(req.url, 'http://localhost');

    for (const route of this.routes) {
      const match = pathname.match(route.regex);
      if (route.method !== req.method || !match) {
        continue;
      }

      const params = {};
      route.names.forEach((name, i) => {
        params[name] = match[i + 1];
      });

      // Handlers are async: errors they throw arrive here as a rejected promise.
      Promise.resolve()
        .then(() => route.handler(req, res, params))
        .catch((err) => {
          console.error(`${req.method} ${req.url} failed:`, err.message);
          sendJson(res, err.status || 500, { error: err.message });
        });
      return;
    }

    sendJson(res, 404, { error: `No route for ${req.method} ${pathname}` });
  }
}

module.exports = Router;
