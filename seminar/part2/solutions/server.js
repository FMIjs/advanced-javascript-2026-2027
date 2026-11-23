const http = require('http');
const fs = require('fs');
const path = require('path');

const Router = require('./src/router');
const Model = require('./src/model');
const EventEmitter = require('./src/emitter');
const Event = require('./src/event');
const Mailer = require('./src/mailer');
const BookingService = require('./src/bookings');
const registerRoutes = require('./src/routes');
const { createUser } = require('./src/users');
const { scheduleReminders } = require('./src/reminders');

const PORT = Number(process.env.PORT) || 3000;
const dataDir = path.join(__dirname, 'data');

// The first time, copy the seed data (node scripts/reset.js does the same)
for (const file of fs.readdirSync(path.join(dataDir, 'seed'))) {
  if (!fs.existsSync(path.join(dataDir, file))) {
    fs.copyFileSync(path.join(dataDir, 'seed', file), path.join(dataDir, file));
  }
}

const events = new Model(path.join(dataDir, 'events.json'), (data) => new Event(data));
const users = new Model(path.join(dataDir, 'users.json'), createUser);
const bookings = new Model(path.join(dataDir, 'bookings.json'));

const bus = new EventEmitter();
const mailer = new Mailer();
const service = new BookingService({ events, users, bookings });

// Bug 8: passing mailer.sendBookingConfirmation loses `this` - emit calls it as a plain function.
bus.on('booked', (data) => mailer.sendBookingConfirmation(data));

const router = new Router();
registerRoutes(router, { events, users, service, bus, mailer });

const server = http.createServer((req, res) => router.handle(req, res));

server.listen(PORT, async () => {
  console.log(`FMI Events running on http://localhost:${PORT}`);
  const all = await events.findAll();
  scheduleReminders(all.filter((event) => event.remind), mailer);
});
