// The event emitter from week 1, as a class.
class EventEmitter {
  constructor() {
    this.subs = {};
  }

  on(eventName, callback) {
    this.subs[eventName] = (this.subs[eventName] || []).concat(callback);
    return this;
  }

  emit(eventName, ...data) {
    (this.subs[eventName] || []).forEach((cb) => cb(...data));
    return this;
  }
}

module.exports = EventEmitter;
