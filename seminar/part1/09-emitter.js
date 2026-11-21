const { check } = require('./check');

// The event emitter from week 1, as a class.
// Add two methods:
// - off(eventName, callback) - removes the callback
// - once(eventName, callback) - the callback runs only on the first emit, then is removed
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

  off(eventName, callback) {
    // TODO
  }

  once(eventName, callback) {
    // TODO
  }
}

// --------------------------------------------------------------------------
// checks (run with: node 09-emitter.js)
// --------------------------------------------------------------------------
check('on / emit (already works)', () => {
  const log = [];
  const e = new EventEmitter();
  e.on('msg', (text) => log.push(text));
  e.emit('msg', 'hello');
  return log;
}, ['hello']);
check('off removes the callback', () => {
  const log = [];
  const e = new EventEmitter();
  const onMsg = (text) => log.push(text);
  e.on('msg', onMsg);
  e.emit('msg', 1);
  e.off('msg', onMsg);
  e.emit('msg', 2);
  return log;
}, [1]);
check('off removes only that callback', () => {
  const log = [];
  const e = new EventEmitter();
  const a = () => log.push('a');
  const b = () => log.push('b');
  e.on('x', a).on('x', b);
  e.off('x', a);
  e.emit('x');
  return log;
}, ['b']);
check('off for an unknown event does not crash', () => {
  new EventEmitter().off('nothing', () => {});
  return 'ok';
}, 'ok');
check('once runs only the first time', () => {
  const log = [];
  const e = new EventEmitter();
  e.once('x', (n) => log.push(n));
  e.emit('x', 1);
  e.emit('x', 2);
  return log;
}, [1]);
check('once does not make the next listener get skipped', () => {
  const log = [];
  const e = new EventEmitter();
  e.once('x', () => log.push('a'));
  e.on('x', () => log.push('b'));
  e.emit('x');
  e.emit('x');
  return log;
}, ['a', 'b', 'b']);
check('a once listener can be removed with off before it runs', () => {
  const log = [];
  const e = new EventEmitter();
  const onX = () => log.push('x');
  const onY = () => log.push('y');
  e.once('x', onX);
  e.once('x', onY);
  e.off('x', onX);
  e.emit('x');
  return log;
}, ['y']);
