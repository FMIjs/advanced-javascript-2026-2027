// Card 7: async / await
// Write down the output BEFORE running it.

async function f() {
  console.log('f start');
  await null;
  console.log('f end');
  return 'done';
}

console.log('before');
const result = f();
console.log('after', result instanceof Promise);
result.then((value) => console.log('then', value));
