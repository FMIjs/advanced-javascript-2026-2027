const { check } = require('./check');

// deepFreeze(obj) - like Object.freeze, but also freezes every nested object / array.
// Returns the same object.
// (In week 3 we wrote myFreeze with defineProperty - you may use Object.freeze here.)
function deepFreeze(obj) {
  // TODO
}

// --------------------------------------------------------------------------
// checks (run with: node 10-deep-freeze.js)
// --------------------------------------------------------------------------
const makeConfig = () => ({
  name: 'app',
  db: { host: 'localhost', ports: [5432, 5433] },
  users: [{ name: 'Ivan' }],
});

check('returns the same object', () => {
  const config = makeConfig();
  return deepFreeze(config) === config;
}, true);
check('the top level is frozen', () => {
  const config = makeConfig();
  deepFreeze(config);
  config.name = 'hacked';
  return [config.name, Object.isFrozen(config)];
}, ['app', true]);
check('nested objects are frozen', () => {
  const config = deepFreeze(makeConfig());
  config.db.host = 'hacked';
  return [config.db.host, Object.isFrozen(config.db)];
}, ['localhost', true]);
check('nested arrays are frozen', () => {
  const config = deepFreeze(makeConfig());
  try {
    config.db.ports.push(1);
  } catch (err) {
    // push on a frozen array throws a TypeError
  }
  return config.db.ports;
}, [5432, 5433]);
check('objects inside arrays are frozen', () => {
  const config = deepFreeze(makeConfig());
  config.users[0].name = 'hacked';
  return config.users[0].name;
}, 'Ivan');

// --------------------------------------------------------------------------
// Bonus
// --------------------------------------------------------------------------
check('[bonus] works with circular references', () => {
  const a = { name: 'a' };
  const b = { name: 'b', a };
  a.b = b;
  deepFreeze(a);
  return [Object.isFrozen(a), Object.isFrozen(b)];
}, [true, true]);
