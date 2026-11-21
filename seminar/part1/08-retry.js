const { checkAsync, wait } = require('./check');

// retry(fn, attempts, delayMs = 0)
// - fn returns a Promise
// - if it rejects, wait delayMs and try again, at most `attempts` times IN TOTAL
// - resolve with the first successful result
// - if all attempts fail, reject with the LAST error
function retry(fn, attempts, delayMs = 0) {
  // TODO
}

// A fake API call: takes 100ms
const fetchUser = (id) => wait(100).then(() => ({ id, name: `user-${id}` }));

// loadSequential(ids) - load the users ONE AFTER ANOTHER, return them in order
async function loadSequential(ids) {
  // TODO
}

// loadParallel(ids) - load the users AT THE SAME TIME, return them in order
async function loadParallel(ids) {
  // TODO
}

// --------------------------------------------------------------------------
// checks (run with: node 08-retry.js)
// --------------------------------------------------------------------------
// flaky(n) fails n times, then succeeds
const flaky = (failures) => {
  let calls = 0;
  const fn = () => {
    calls++;
    return calls <= failures
      ? Promise.reject(new Error(`fail #${calls}`))
      : Promise.resolve(`ok after ${calls}`);
  };
  fn.calls = () => calls;
  return fn;
};
const elapsed = async (fn) => {
  const start = Date.now();
  await fn();
  return Date.now() - start;
};

async function main() {
  await checkAsync('retry: success on the first try', () => retry(flaky(0), 3), 'ok after 1');
  await checkAsync('retry: success on the last allowed try', async () => {
    const fn = flaky(2);
    const result = await retry(fn, 3);
    return [result, fn.calls()];
  }, ['ok after 3', 3]);
  await checkAsync('retry: gives up with the last error', async () => {
    const fn = flaky(10);
    const message = await retry(fn, 2).then(() => 'resolved', (err) => err.message);
    return [message, fn.calls()];
  }, ['fail #2', 2]);
  await checkAsync('retry: waits delayMs between attempts', async () => {
    const ms = await elapsed(() => retry(flaky(2), 3, 50));
    return ms >= 95;
  }, true);

  await checkAsync('loadSequential returns users in order', () => loadSequential([1, 2, 3]), [
    { id: 1, name: 'user-1' }, { id: 2, name: 'user-2' }, { id: 3, name: 'user-3' },
  ]);
  await checkAsync('loadSequential takes ~300ms', async () => {
    let users;
    const ms = await elapsed(async () => {
      users = await loadSequential([1, 2, 3]);
    });
    return [users && users.length, ms >= 290];
  }, [3, true]);
  await checkAsync('loadParallel returns users in order', () => loadParallel([1, 2, 3]), [
    { id: 1, name: 'user-1' }, { id: 2, name: 'user-2' }, { id: 3, name: 'user-3' },
  ]);
  await checkAsync('loadParallel takes ~100ms', async () => {
    let users;
    const ms = await elapsed(async () => {
      users = await loadParallel([1, 2, 3]);
    });
    return [users && users.length, ms < 200];
  }, [3, true]);
}

main();
