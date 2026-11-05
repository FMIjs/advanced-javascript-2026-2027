// Object.defineProperty examples
// Run with: node week3/defineProperty.js

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty#configurable

function section(title) {
  console.log(`\n=== ${title} ===`);
}

function tryIt(fn) {
  try {
    fn();
  } catch (err) {
    console.log(`${err.name}: ${err.message}`);
  }
}

// --------------------------------------------------------------------------
section('1. Basics and defaults');
// Every flag you leave out of the descriptor defaults to false.
// --------------------------------------------------------------------------
{
  const user = {};
  Object.defineProperty(user, 'name', { value: 'Alex' });

  console.log(user.name); // 'Alex'
  console.log(Object.getOwnPropertyDescriptor(user, 'name'));
  // { value: 'Alex', writable: false, enumerable: false, configurable: false }

  // Normal assignment makes all three flags true.
  const a = {};
  a.x = 1;
  console.log(Object.getOwnPropertyDescriptor(a, 'x'));
  // { value: 1, writable: true, enumerable: true, configurable: true }
}

// --------------------------------------------------------------------------
section('2. writable: read-only properties');
// --------------------------------------------------------------------------
{
  const config = {};
  Object.defineProperty(config, 'API_URL', {
    value: 'https://api.example.com',
    writable: false,
    enumerable: true,
  });

  config.API_URL = 'hacked'; // fails silently in sloppy mode
  console.log(config.API_URL); // 'https://api.example.com'

  tryIt(function () {
    'use strict';
    config.API_URL = 'hacked'; // TypeError in strict mode
  });
}

// --------------------------------------------------------------------------
section('3. enumerable: hidden properties');
// --------------------------------------------------------------------------
{
  const person = { firstName: 'Ivan', lastName: 'Petrov' };
  Object.defineProperty(person, 'id', { value: 42, enumerable: false });

  console.log(person.id); // 42 (still accessible)
  console.log(Object.keys(person)); // ['firstName', 'lastName']
  console.log(JSON.stringify(person)); // {"firstName":"Ivan","lastName":"Petrov"}
  for (const k in person) console.log('for...in:', k); // firstName, lastName
  console.log(Object.getOwnPropertyNames(person)); // ['firstName', 'lastName', 'id']
  console.log({ ...person }); // no id, because spread copies only enumerable props
}

// --------------------------------------------------------------------------
section('4. configurable: locking a property definition');
// --------------------------------------------------------------------------
{
  const obj = {};
  Object.defineProperty(obj, 'locked', {
    value: 1,
    writable: true,
    configurable: false,
  });

  console.log(delete obj.locked); // false: can't delete
  console.log(obj.locked); // 1

  obj.locked = 2; // OK, because it's still writable
  console.log(obj.locked); // 2

  tryIt(() => {
    Object.defineProperty(obj, 'locked', { enumerable: true });
    // TypeError: Cannot redefine property: locked
  });

  // The one change still allowed: writable true -> false (it's one-way)
  Object.defineProperty(obj, 'locked', { writable: false });
  console.log(Object.getOwnPropertyDescriptor(obj, 'locked'));
  // { value: 2, writable: false, enumerable: false, configurable: false }
}

// --------------------------------------------------------------------------
section('5. Accessor properties (get / set)');
// --------------------------------------------------------------------------
{
  const temperature = { _celsius: 25 };
  Object.defineProperty(temperature, 'fahrenheit', {
    get() {
      return (this._celsius * 9) / 5 + 32;
    },
    set(f) {
      this._celsius = ((f - 32) * 5) / 9;
    },
    enumerable: true,
    configurable: true,
  });

  console.log(temperature.fahrenheit); // 77
  temperature.fahrenheit = 212;
  console.log(temperature._celsius); // 100

  // A getter without a setter is effectively read-only.
  const circle = { radius: 2 };
  Object.defineProperty(circle, 'area', {
    get() {
      return Math.PI * this.radius ** 2;
    },
  });
  circle.area = 100; // ignored (TypeError in strict mode)
  console.log(circle.area); // 12.566...
}

// --------------------------------------------------------------------------
section('6. Validation through a setter');
// --------------------------------------------------------------------------
{
  function createAccount() {
    let balance = 0; // truly private, kept in a closure

    const account = {};
    Object.defineProperty(account, 'balance', {
      get() {
        return balance;
      },
      set(value) {
        if (typeof value !== 'number' || value < 0) {
          throw new RangeError('Balance must be a non-negative number');
        }
        balance = value;
      },
      enumerable: true,
    });
    return account;
  }

  const acc = createAccount();
  acc.balance = 100;
  console.log(acc.balance); // 100
  tryIt(() => {
    acc.balance = -5; // RangeError
  });
}

// --------------------------------------------------------------------------
section('7. Data and accessor descriptors cannot be mixed');
// A descriptor is either data (value, writable) or accessor (get, set).
// enumerable and configurable work with both.
// --------------------------------------------------------------------------
tryIt(() => {
  Object.defineProperty({}, 'bad', {
    value: 1,
    get() {
      return 2;
    },
  });
  // TypeError: Invalid property descriptor...
});

// --------------------------------------------------------------------------
section('8. Redefining an existing property changes only what you pass');
// The false defaults apply only when the property is new.
// --------------------------------------------------------------------------
{
  const o = { x: 1 }; // all flags true
  Object.defineProperty(o, 'x', { enumerable: false });
  console.log(Object.getOwnPropertyDescriptor(o, 'x'));
  // { value: 1, writable: true, enumerable: false, configurable: true }
}

// --------------------------------------------------------------------------
section('9. Object.defineProperties: several at once');
// --------------------------------------------------------------------------
{
  const book = {};
  Object.defineProperties(book, {
    title: { value: 'JS: The Good Parts', enumerable: true },
    author: { value: 'Crockford', enumerable: true },
    info: {
      get() {
        return `${this.title} by ${this.author}`;
      },
      enumerable: false,
    },
  });

  console.log(book.info); // 'JS: The Good Parts by Crockford'
  console.log(Object.keys(book)); // ['title', 'author']
}

// --------------------------------------------------------------------------
section('10. Prototypes and built-ins');
// --------------------------------------------------------------------------
{
  function Person(name) {
    this.name = name;
  }

  Object.defineProperty(Person.prototype, 'greeting', {
    get() {
      return `Hi, I'm ${this.name}`;
    },
    enumerable: false,
  });

  const p = new Person('Maria');
  console.log(p.greeting); // "Hi, I'm Maria"
  console.log(Object.keys(p)); // ['name']

  // Built-in methods are non-enumerable, which is why they don't show up in for...in.
  console.log(Object.getOwnPropertyDescriptor(Array.prototype, 'map'));
  // { value: [Function: map], writable: true, enumerable: false, configurable: true }
  console.log(Object.getOwnPropertyDescriptor([1, 2, 3], 'length'));
  // { value: 3, writable: true, enumerable: false, configurable: false }
}

// --------------------------------------------------------------------------
section('11. Building your own Object.freeze');
// --------------------------------------------------------------------------
{
  function myFreeze(obj) {
    for (const key of Reflect.ownKeys(obj)) {
      const desc = Object.getOwnPropertyDescriptor(obj, key);
      if ('value' in desc) desc.writable = false; // only data props have writable
      desc.configurable = false;
      Object.defineProperty(obj, key, desc);
    }
    return Object.preventExtensions(obj);
  }

  const frozen = myFreeze({ a: 1, b: 2 });
  frozen.a = 99; // ignored
  frozen.c = 3; // ignored
  console.log(frozen); // { a: 1, b: 2 }
  console.log(Object.isFrozen(frozen)); // true
}
