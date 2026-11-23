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
    if (!this.hasSeats(eventId)) {
      throw httpError(409, 'Event is full');
    }

    const booking = await this.bookings.create({ eventId, userId });
    event.bookedCount++;
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

    const profiles = [];
    eventBookings.forEach(async (booking) => {
      profiles.push(await this.loadProfile(booking.userId));
    });
    return profiles;
  }
}

module.exports = BookingService;
