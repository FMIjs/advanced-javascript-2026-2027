// Card 1: event loop
// Write down the output BEFORE running it.

console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve().then(() => console.log('3'));

process.nextTick(() => console.log('4'));

queueMicrotask(() => {
  console.log('5')
  process.nextTick(() => console.log('5 2'));
});

console.log('6');
