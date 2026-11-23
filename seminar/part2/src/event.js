class Event {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.capacity = data.capacity;
    this.bookedCount = data.bookedCount || 0;
    this.remind = Boolean(data.remind);
    if (data.tags) {
      this.tags = data.tags;
    }
  }

  get seatsLeft() {
    return this.capacity - this.bookedCount;
  }
}

// Events without tags start with an empty list
Event.prototype.tags = [];

module.exports = Event;
