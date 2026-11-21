const { check, checkAsync, wait } = require('./check');

// once(fn) - calls fn only the first time.
// Every later call returns the result of the first one.
function once(fn) {
  // TODO
}

// debounce(fn, ms) - waits until there have been no calls for `ms` milliseconds,
// then calls fn ONCE with the arguments of the last call.
// (Think of a search box: search only after the user stops typing.)
function debounce(fn, ms) {
  // TODO
}

// --------------------------------------------------------------------------
// checks (run with: node 04-once-debounce.js)
// --------------------------------------------------------------------------
async function main() {
  check('once calls fn only once', () => {
    let calls = 0;
    const init = once(() => ++calls);
    init();
    init();
    init();
    return calls;
  }, 1);
  check('once returns the first result every time', () => {
    const first = once((x) => x * 2);
    return [first(1), first(5), first(10)];
  }, [2, 2, 2]);
  check('once keeps `this`', () => {
    const counter = {
      n: 0,
      inc: once(function () {
        return ++this.n;
      }),
    };
    return [counter.inc(), counter.inc(), counter.n];
  }, [1, 1, 1]);

  await checkAsync('debounce calls fn once, with the last arguments', async () => {
    const log = [];
    const save = debounce((x) => log.push(x), 50);
    save(1);
    save(2);
    save(3);
    await wait(100);
    return log;
  }, [3]);
  await checkAsync('debounce does not call fn too early', async () => {
    const log = [];
    const save = debounce((x) => log.push(x), 50);
    save(1);
    await wait(20);
    return log;
  }, []);
  await checkAsync('every pause starts a new call', async () => {
    const log = [];
    const save = debounce((x) => log.push(x), 50);
    save(1);
    await wait(100);
    save(2);
    await wait(30);
    save(3);
    await wait(100);
    return log;
  }, [1, 3]);
  await checkAsync('debounce keeps `this`', async () => {
    let seen;
    const editor = {
      name: 'editor',
      save: debounce(function () {
        seen = this && this.name;
      }, 20),
    };
    editor.save();
    await wait(50);
    return seen;
  }, 'editor');
}

main();
