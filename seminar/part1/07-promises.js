const { checkAsync, wait } = require('./check');

// delay(ms, value) - a Promise that resolves with `value` after `ms` milliseconds.
function delay(ms, value) {
  // TODO
}

// timeout(promise, ms) - resolves/rejects like `promise`,
// but if it takes longer than `ms`, rejects with new Error(`Timeout after ${ms}ms`).
// Hint: Promise.race
function timeout(promise, ms) {
  // TODO
}

// myPromiseAll(items) - your own Promise.all, WITHOUT Promise.all / allSettled.
// - resolves with an array of results in the SAME order as `items`
// - rejects as soon as one of them rejects
// - `items` may contain plain values, not only promises
function myPromiseAll(items) {
  // TODO
}

// Bonus: your own Promise.allSettled
function myPromiseAllSettled(items) {
  // TODO
}

// --------------------------------------------------------------------------
// checks (run with: node 07-promises.js)
// --------------------------------------------------------------------------
const fail = (ms, message) => wait(ms).then(() => {
  throw new Error(message);
});
const elapsed = async (fn) => {
  const start = Date.now();
  await fn();
  return Date.now() - start;
};

async function main() {
  await checkAsync('delay resolves with the value', () => delay(10, 'hi'), 'hi');
  await checkAsync('delay waits at least ms', async () => (await elapsed(() => delay(50))) >= 45, true);

  await checkAsync('timeout: a fast promise resolves normally', () => timeout(delay(10, 'fast'), 100), 'fast');
  await checkAsync('timeout: a slow promise is rejected', () => timeout(delay(200, 'slow'), 50).then(
    () => 'resolved',
    (err) => err.message,
  ), 'Timeout after 50ms');
  await checkAsync('timeout: a failing promise keeps its own error', () => timeout(fail(10, 'boom'), 100).then(
    () => 'resolved',
    (err) => err.message,
  ), 'boom');

  await checkAsync('myPromiseAll keeps the order', () => myPromiseAll([delay(30, 'a'), delay(10, 'b'), delay(20, 'c')]), ['a', 'b', 'c']);
  await checkAsync('myPromiseAll accepts plain values', () => myPromiseAll([1, delay(10, 2), 3]), [1, 2, 3]);
  await checkAsync('myPromiseAll of [] resolves with []', () => myPromiseAll([]), []);
  await checkAsync('myPromiseAll rejects with the first error to happen, right away', async () => {
    let message;
    const ms = await elapsed(() => myPromiseAll([delay(80, 'ok'), fail(40, 'second'), fail(10, 'first')]).then(
      () => { message = 'resolved'; },
      (err) => { message = err.message; },
    ));
    return [message, ms < 30];
  }, ['first', true]);
  await checkAsync('myPromiseAll runs in parallel', async () => {
    let results;
    const ms = await elapsed(async () => {
      results = await myPromiseAll([delay(50, 1), delay(50, 2), delay(50, 3)]);
    });
    return [results, ms < 100];
  }, [[1, 2, 3], true]);

  // ------------------------------------------------------------------------
  // Bonus
  // ------------------------------------------------------------------------
  await checkAsync('[bonus] myPromiseAllSettled', async () => {
    const results = await myPromiseAllSettled([delay(10, 'a'), fail(5, 'nope'), 3]);
    return results.map((r) => (r.status === 'fulfilled' ? r.value : r.reason.message));
  }, ['a', 'nope', 3]);

  await wait(250); // let the leftover timers finish
}

main();
