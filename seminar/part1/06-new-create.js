const { check } = require('./check');

// myCreate(proto) - your own Object.create(proto), WITHOUT Object.create.
function myCreate(proto) {
  // TODO
}

// myNew(Ctor, ...args) - does what `new Ctor(...args)` does, WITHOUT using `new`.
// (You may use your myCreate.)
function myNew(Ctor, ...args) {
  // TODO
}

// --------------------------------------------------------------------------
// checks (run with: node 06-new-create.js)
// --------------------------------------------------------------------------

// The User -> Employee example from week 2 (constructor functions)
function User(name, email) {
  this.name = name;
  this.email = email;
}
User.prototype.greet = function () {
  return `Hi, I am ${this.name}`;
};

function Employee(name, email, position) {
  User.call(this, name, email);
  this.position = position;
}
Employee.prototype = Object.create(User.prototype);
Object.defineProperty(Employee.prototype, 'constructor', { value: Employee, enumerable: false });
Employee.prototype.greet = function () {
  return `${User.prototype.greet.call(this)} and I work as a ${this.position}`;
};

const proto = { type: 'proto', hello() { return `hello from ${this.type}`; } };

check('myCreate links the prototype', () => Object.getPrototypeOf(myCreate(proto)) === proto, true);
check('myCreate: properties are read from the prototype', () => myCreate(proto).hello(), 'hello from proto');
check('myCreate: the new object has no own properties', () => Object.keys(myCreate(proto)), []);
check('myCreate: writing shadows, the prototype stays the same', () => {
  const obj = myCreate(proto);
  obj.type = 'own';
  return [obj.hello(), proto.type];
}, ['hello from own', 'proto']);

check('myNew creates an instance', () => myNew(User, 'Ivan', 'ivan@example.com') instanceof User, true);
check('myNew runs the constructor with `this` = the new object', () => {
  const user = myNew(User, 'Ivan', 'ivan@example.com');
  return [user.name, user.email, Object.keys(user)];
}, ['Ivan', 'ivan@example.com', ['name', 'email']]);
check('myNew: methods come from the prototype', () => myNew(User, 'Ivan').greet(), 'Hi, I am Ivan');
check('myNew works with inheritance', () => {
  const employee = myNew(Employee, 'Maria', 'maria@example.com', 'developer');
  return [employee instanceof Employee, employee instanceof User, employee.greet()];
}, [true, true, 'Hi, I am Maria and I work as a developer']);
check('a constructor that returns an object wins', () => {
  function Weird() {
    this.a = 1;
    return { b: 2 };
  }
  const result = myNew(Weird);
  return [result.a, result.b, result instanceof Weird];
}, [undefined, 2, false]);
check('a constructor that returns a primitive is ignored', () => {
  function Prim() {
    this.a = 1;
    return 42;
  }
  const result = myNew(Prim);
  return [result.a, result instanceof Prim];
}, [1, true]);

// --------------------------------------------------------------------------
// Bonus
// --------------------------------------------------------------------------
check('[bonus] myCreate(null) creates an object without a prototype', () => {
  const bare = myCreate(null);
  return [Object.getPrototypeOf(bare), 'toString' in bare];
}, [null, false]);
