// A fake mailer: instead of sending emails it keeps them in a list
// (GET /notifications shows them) and prints them.
class Mailer {
  constructor() {
    this.sent = [];
  }

  send(to, text) {
    this.sent.push({ to, text, at: new Date().toISOString() });
    console.log(`[mail to ${to}] ${text}`);
  }

  sendBookingConfirmation({ event, user }) {
    this.send(user.email, `You are booked for "${event.name}"`);
  }
}

module.exports = Mailer;
