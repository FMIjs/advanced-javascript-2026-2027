const { check } = require('./check');

// curry(fn) returns a function that collects arguments until it has
// as many as fn expects, and only then calls fn.
//   curry(f)(1)(2)(3) === curry(f)(1, 2)(3) === curry(f)(1, 2, 3) === f(1, 2, 3)
function curry(fn) {
  // TODO
}

// --------------------------------------------------------------------------
// checks (run with: node 02-curry.js)
// --------------------------------------------------------------------------
let calls = 0;
function tripleAdd(a, b, c) {
  calls++;
  return a + b + c;
}
const cTripleAdd = curry(tripleAdd);

check('(1)(2)(3)', () => cTripleAdd(1)(2)(3), 6);
check('(1, 2)(3)', () => cTripleAdd(1, 2)(3), 6);
check('(1)(2, 3)', () => cTripleAdd(1)(2, 3), 6);
check('(1, 2, 3)', () => cTripleAdd(1, 2, 3), 6);
check('does not call fn before it has all arguments', () => {
  const before = calls;
  cTripleAdd(1)(2);
  return calls - before;
}, 0);
check('a partially applied function can be reused', () => {
  const add1 = cTripleAdd(1);
  return [add1(2)(3), add1(10)(20), add1(100, 200)];
}, [6, 31, 301]);
check('the curried functions are independent', () => {
  const add1 = cTripleAdd(1);
  const add10 = cTripleAdd(10);
  return [add1(1)(1), add10(1)(1)];
}, [3, 12]);

// --------------------------------------------------------------------------
// Bonus: curry(fn, arity) - for functions where fn.length doesn't help.
// --------------------------------------------------------------------------
check('[bonus] curry(fn, arity) works with rest parameters', () => {
  const sumAll = (...nums) => nums.reduce((acc, n) => acc + n, 0);
  return curry(sumAll, 3)(1)(2)(3);
}, 6);
