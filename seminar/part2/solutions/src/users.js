// Users are older code, written with constructor functions.

function User(data) {
  this.id = data.id;
  this.name = data.name;
  this.email = data.email;
}

User.prototype.describe = function () {
  return `${this.name} (attendee)`;
};

function Organizer(data) {
  User.call(this, data);
  this.company = data.company;
}

// Bug 6: `Organizer.prototype = User.prototype` made them the SAME object,
// so Organizer's describe() replaced User's describe() for everyone.
Organizer.prototype = Object.create(User.prototype);
Object.defineProperty(Organizer.prototype, 'constructor', { value: Organizer, enumerable: false });

Organizer.prototype.describe = function () {
  return `${this.name} (organizer at ${this.company})`;
};

function createUser(data) {
  return data.company ? new Organizer(data) : new User(data);
}

module.exports = { User, Organizer, createUser };
