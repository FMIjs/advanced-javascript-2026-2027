// Tiny test helper for the seminar tasks.
// You don't need to change anything here.

const { isDeepStrictEqual, inspect } = require('util');

const format = (value) => inspect(value, { depth: 4, breakLength: Infinity });

function report(label, ok, details) {
  console.log(`${ok ? '✓' : '✗'} ${label}${ok ? '' : `\n    ${details}`}`);
}

// check('label', () => actual, expected)
// The actual value is computed inside a function, so a crash in one check doesn't stop the rest.
function check(label, getActual, expected) {
  try {
    const actual = getActual();
    const ok = isDeepStrictEqual(actual, expected);
    report(label, ok, `expected ${format(expected)}, got ${format(actual)}`);
  } catch (err) {
    report(label, false, `threw ${err.name}: ${err.message}`);
  }
}

// await checkAsync('label', async () => actual, expected)
async function checkAsync(label, getActual, expected) {
  try {
    const actual = await getActual();
    const ok = isDeepStrictEqual(actual, expected);
    report(label, ok, `expected ${format(expected)}, got ${format(actual)}`);
  } catch (err) {
    report(label, false, `threw/rejected ${err.name}: ${err.message}`);
  }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// An unfinished task can leave a rejected promise nobody handles.
// Report it instead of crashing, so the remaining checks still run.
process.on('unhandledRejection', (reason) => {
  console.log(`  (unhandled rejection: ${reason && reason.message ? reason.message : format(reason)})`);
});

module.exports = { check, checkAsync, wait };
