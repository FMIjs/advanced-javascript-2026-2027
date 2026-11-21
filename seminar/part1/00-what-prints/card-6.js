// Card 6: promise chains
// Write down the output BEFORE running it.

// const genP = () => {
//   return new Promise((resolve, reject) => {
//     reject(new Error('boom'))
//   })
// }
// const boomPromise = new Promise((resolve, reject) => {
//   reject(new Error('boom'))
// })

Promise.reject(new Error('boom')) // genP() // boomPromise
  .then(() => console.log('A'))
  .catch((err) => {
    console.log('B', err.message);
    // throw new Error('didn\'t recover');
    // return Promise.reject(new Error('didn\'t recover'));
    return 'recovered';
  })
  .then((value) => {
    console.log('C', value);
    throw new Error('again');
  })
  .then(() => console.log('D'))
  .finally(() => console.log('D2'))
  .catch((err) => console.log('E', err.message))
  .finally(() => console.log('F'))
  .finally(() => console.log('G'));

