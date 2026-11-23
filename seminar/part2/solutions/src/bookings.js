const { httpError } = require('./http');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class BookingService {
  constructor({ events, users, bookings }) {
    this.events = events;
    this.users = users;
    this.bookings = bookings;
  }

  async hasSeats(eventId) {
    const event = await this.events.findById(eventId);
    return event.seatsLeft > 0;
  }

  async book(eventId, userId) {
    const event = await this.events.findById(eventId);
    if (!event) {
      throw httpError(404, 'Event not found');
    }
    const user = await this.users.findById(userId);
    if (!user) {
      throw httpError(404, 'User not found');
    }
    // Bug 9: hasSeats is async, so without await it returns a Promise - and a Promise is always truthy.
    // Bug 11: even with `await this.hasSeats(...)`, many requests can pass the check before any of them
    // increases bookedCount (the awaits let other requests run in between).
    // Check and take the seat in the same synchronous step - no await between them.
    if (event.seatsLeft <= 0) {
      throw httpError(409, 'Event is full');
    }
    event.bookedCount++;

    let booking;
    try {
      booking = await this.bookings.create({ eventId, userId });
    } catch (err) {
      event.bookedCount--; // give the seat back
      throw err;
    }
    await this.events.save();
    return { booking, event, user };
  }

  // Profiles come from a (fake) remote service, so loading one takes a while.
  async loadProfile(userId) {
    await wait(20);
    const user = await this.users.findById(userId);
    return { id: user.id, name: user.name, description: user.describe() };
  }

  async attendees(eventId) {
    const event = await this.events.findById(eventId);
    if (!event) {
      throw httpError(404, 'Event not found');
    }
    const all = await this.bookings.findAll();
    const eventBookings = all.filter((booking) => booking.eventId === eventId);

    // Bug 10: forEach does not wait for async callbacks, so `profiles` was returned still empty.
    // map gives us an array of promises, Promise.all waits for all of them (in parallel, in order).
    return Promise.all(eventBookings.map((booking) => this.loadProfile(booking.userId)));
  }
}

module.exports = BookingService;
