// Card 3: closures
// Write down the output BEFORE running it.

function makeCounter() {
  let count = 0;
  return {
    inc: () => ++count,
    get: () => count++,
  };
}

const a = makeCounter();
const b = makeCounter();
a.inc(); a.inc();
b.inc();
console.log(a.get(), b.get());

const fns = [];
for (var i = 0; i < 3; i++) {
  fns.push(() => i);
}
console.log(fns.map((fn) => fn()));
// 3, 3, 3

const fns2 = [];
for (let i = 0; i < 3; i++) {
  fns2.push(() => i);
}
console.log(fns2.map((fn) => fn()));
// 0, 1, 2