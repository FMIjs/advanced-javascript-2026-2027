const { check } = require("./check");

// memoize(fn) returns a new function that remembers results by arguments.
// Same arguments -> return the stored result without calling fn again.
// The cache must NOT be global: every memoized function has its own.
function memoize(fn) {
  const cache = new Map();
  return (...args) => { // --> '...' is "rest" op here
    // const key = args.toString();
    const key = JSON.stringify(args);
    const hasKey = cache.has(key);
    if (hasKey) return cache.get(key);
    const result = fn(...args); // --> '...' is "spread" op here

    cache.set(key, result);
    return result;
  };
}


const shallowCopy = (obj) => ({ ...obj });
const deepCopy = (obj) =>
  JSON.parse(JSON.stringify(obj));

const test = []
const obj1 = {arr: test}
const obj2 = shallowCopy(obj1);

obj1 === obj2; // false, because shallow copy creates a new object
obj1.arr === obj2.arr; // true, because shallow copy only copies the reference to the array


// --------------------------------------------------------------------------
// checks (run with: node 01-memoize.js)
// --------------------------------------------------------------------------
let calls = 0;
const sum = (a, b) => {
  calls++;
  return a + b;
};
const memSum = memoize(sum);

check("computes the result", () => memSum(2, 3), 5);
check("computes for new arguments", () => memSum(3, 3), 6);
check(
  "returns the cached result without calling fn",
  () => {
    const before = calls;
    const result = memSum(2, 3);
    return [result, calls - before];
  },
  [5, 0],
);
check(
  "(1, 23) and (12, 3) are different calls",
  () => [memSum(1, 23), memSum(12, 3)],
  [24, 15],
);
check(
  '1 and "1" are different calls',
  () => {
    const memType = memoize((x) => typeof x);
    return [memType(1), memType("1")];
  },
  ["number", "string"],
);
check(
  "every memoized function has its own cache",
  () => {
    const otherMemSum = memoize(sum);
    const before = calls;
    otherMemSum(2, 3);
    return calls - before;
  },
  1,
);
check(
  "works with any number of arguments",
  () => {
    const memSumAll = memoize((...nums) => nums.reduce((acc, n) => acc + n, 0));
    return memSumAll(1, 2, 3, 4);
  },
  10,
);
check(
  "caches falsy results too (0, '', false, undefined)",
  () => {
    let zeroCalls = 0;
    const alwaysZero = memoize((x) => {
      zeroCalls++;
      return x * 0;
    });
    alwaysZero(5);
    alwaysZero(5);
    return zeroCalls;
  },
  1,
);

// --------------------------------------------------------------------------
// Bonus: memoize(fn, { maxSize }) keeps at most maxSize results
// and forgets the OLDEST one when it runs out of space.
// --------------------------------------------------------------------------
check(
  "[bonus] maxSize forgets the oldest result",
  () => {
    let squareCalls = 0;
    const memSquare = memoize(
      (x) => {
        squareCalls++;
        return x * x;
      },
      { maxSize: 2 },
    );
    memSquare(1); // cache: 1
    memSquare(2); // cache: 1, 2
    memSquare(3); // cache: 2, 3  (1 is forgotten)
    const before = squareCalls;
    memSquare(2); // still cached
    memSquare(1); // computed again
    return squareCalls - before;
  },
  1,
);
