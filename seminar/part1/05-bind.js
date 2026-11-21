const { check } = require('./check');

// Write your own version of Function.prototype.bind.
// You may use call / apply inside, but NOT bind.
//   const bound = fn.myBind(ctx, ...presetArgs);
//   bound(...moreArgs) === fn.call(ctx, ...presetArgs, ...moreArgs)
Function.prototype.myBind = function (ctx, ...presetArgs) {
  // TODO
};

// Bonus: your own Function.prototype.call, WITHOUT call / apply / bind.
// Hint: what is `this` in `obj.method()`?
Function.prototype.myCall = function (ctx, ...args) {
  // TODO
};

// --------------------------------------------------------------------------
// checks (run with: node 05-bind.js)
// --------------------------------------------------------------------------
function greet(punctuation = '') {
  return `Hi, ${this.name}${punctuation}`;
}
function add(a, b) {
  return a + b;
}
const arrowGreet = () => `Hi, ${this.name}`;

const ivan = { name: 'Ivan' };
const maria = { name: 'Maria' };

check('fixes `this`', () => greet.myBind(ivan)(), 'Hi, Ivan');
check('passes the call arguments', () => greet.myBind(ivan)('!'), 'Hi, Ivan!');
check('presets arguments', () => add.myBind(null, 1)(2), 3);
check('returns a new function', () => {
  const bound = greet.myBind(ivan);
  return typeof bound === 'function' && bound !== greet;
}, true);
check('call() can not change the bound `this`', () => greet.myBind(ivan).call(maria), 'Hi, Ivan');
check('binding twice keeps the first `this`', () => greet.myBind(ivan).myBind(maria)(), 'Hi, Ivan');
check('the bound function can be stored and passed around', () => {
  const callbacks = [greet.myBind(ivan), greet.myBind(maria)];
  return callbacks.map((cb) => cb());
}, ['Hi, Ivan', 'Hi, Maria']);
check('binding an arrow function does not change its `this`', () => arrowGreet.myBind(ivan)(), 'Hi, undefined');

// --------------------------------------------------------------------------
// Bonus: myCall
// --------------------------------------------------------------------------
check('[bonus] myCall sets `this` and passes arguments', () => greet.myCall(ivan, '?'), 'Hi, Ivan?');
check('[bonus] myCall leaves the object as it was', () => {
  const result = greet.myCall(maria);
  return [result, Reflect.ownKeys(maria)];
}, ['Hi, Maria', ['name']]);
check('[bonus] myCall works when the object already has a `fn` key', () => {
  const tricky = { name: 'Tricky', fn: 'keep me' };
  return [greet.myCall(tricky), tricky.fn];
}, ['Hi, Tricky', 'keep me']);
