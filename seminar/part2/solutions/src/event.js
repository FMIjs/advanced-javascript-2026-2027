class Event {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.capacity = data.capacity;
    this.bookedCount = data.bookedCount || 0;
    this.remind = Boolean(data.remind);
    // Bug 5: every event gets its OWN array.
    // Before, events without tags read Event.prototype.tags - ONE array shared by all of them,
    // so push() changed it for everyone. It also was not an own property, so it was never saved.
    this.tags = data.tags ? [...data.tags] : [];
  }

  get seatsLeft() {
    return this.capacity - this.bookedCount;
  }

  // Bug 4: JSON.stringify only takes OWN enumerable properties.
  // seatsLeft is a getter on Event.prototype, so it was skipped.
  // toJSON decides what JSON.stringify writes for this object.
  toJSON() {
    return { ...this, seatsLeft: this.seatsLeft };
  }
}

module.exports = Event;
