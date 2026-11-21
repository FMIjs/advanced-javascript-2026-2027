const { check, checkAsync, wait } = require('./check');

// compose(f, g, h)(x) === f(g(h(x)))   - right to left
// pipe(f, g, h)(x)    === h(g(f(x)))   - left to right
function compose(...fns) {
  // TODO
}

function pipe(...fns) {
  // TODO
}

// Bonus: like pipe, but any step may return a Promise.
// The result is always a Promise.
function pipeAsync(...fns) {
  // TODO
}

// --------------------------------------------------------------------------
// checks (run with: node 03-compose.js)
// --------------------------------------------------------------------------
const addOne = (x) => x + 1;
const square = (x) => x * x;
const double = (x) => x * 2;

async function main() {
  check('compose(square, addOne)(1)', () => compose(square, addOne)(1), 4);
  check('compose(addOne, square)(1)', () => compose(addOne, square)(1), 2);
  check('compose works with many functions', () => compose(double, square, addOne)(2), 18);
  check('pipe(addOne, square)(1)', () => pipe(addOne, square)(1), 4);
  check('pipe(double, square, addOne)(2)', () => pipe(double, square, addOne)(2), 17);
  check('compose() with no functions returns the value as is', () => compose()(5), 5);
  check('pipe() with no functions returns the value as is', () => pipe()(5), 5);
  check('the first function to run may take many arguments', () => compose(addOne, Math.max)(1, 5, 3), 6);

  // ------------------------------------------------------------------------
  // Bonus: pipeAsync
  // ------------------------------------------------------------------------
  const fetchNumber = async (x) => {
    await wait(10);
    return x * 10;
  };
  await checkAsync('[bonus] pipeAsync mixes sync and async steps', () => pipeAsync(addOne, fetchNumber, square)(1), 400);
  await checkAsync('[bonus] pipeAsync always returns a Promise', () => pipeAsync(addOne)(1) instanceof Promise, true);
}

main();
