const { sendJson, httpError, readJson } = require('./http');

function registerRoutes(router, { events, users, service, bus, mailer }) {
  router.get('/events', async (req, res) => {
    sendJson(res, 200, await events.findAll());
  });

  router.get('/events/:id', async (req, res, params) => {
    const event = await events.findById(params.id);
    if (!event) {
      sendJson(res, 404, { error: 'Event not found' });
    }
    sendJson(res, 200, event);
  });

  router.post('/events', async (req, res) => {
    const { name, capacity } = await readJson(req);
    if (!name || !(capacity > 0)) {
      throw httpError(400, 'name and a positive capacity are required');
    }
    const event = await events.create({ name, capacity });
    sendJson(res, 201, event);
  });

  router.post('/events/:id/tags', async (req, res, params) => {
    const { tag } = await readJson(req);
    const event = await events.findById(params.id);
    if (!event) {
      throw httpError(404, 'Event not found');
    }
    event.tags.push(tag);
    await events.save();
    sendJson(res, 200, { id: event.id, tags: event.tags });
  });

  router.post('/events/:id/bookings', async (req, res, params) => {
    const { userId } = await readJson(req);
    const { booking, event, user } = await service.book(params.id, userId);
    bus.emit('booked', { event, user });
    sendJson(res, 201, { booking, seatsLeft: event.seatsLeft });
  });

  router.get('/events/:id/attendees', async (req, res, params) => {
    sendJson(res, 200, await service.attendees(params.id));
  });

  router.get('/users', async (req, res) => {
    const all = await users.findAll();
    sendJson(res, 200, all.map((user) => ({ id: user.id, name: user.name, description: user.describe() })));
  });

  router.get('/notifications', async (req, res) => {
    sendJson(res, 200, mailer.sent);
  });
}

module.exports = registerRoutes;
