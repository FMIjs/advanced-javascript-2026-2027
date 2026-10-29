// // // var a = +'adsada'; // NaN

// // // console.log(isNaN(a))

// // // a.toFixed()

// // const a = 10;

// const _toFixed = Number.prototype.toFixed;

// // a.toFixed(10);

// // // Uncaught TypeError TypeError: Number.prototype.toFixed 
// // // requires that 'this' be a Number



// Number.prototype.toFixed = function (fractionDigits) {
//   console.log('toFixed was called: ', fractionDigits);
//   return _toFixed.call(this, fractionDigits);
// }

// // console.log(a.toFixed(2))



// function test() {
//   console.log(this);
// }

// test();

// const obj = { test };

// obj.test();

// Function.prototype.test = function () {
//   console.log('test');
// }

// test.call({ 'hello': 'world' }, 1, 3, 4)
// test.apply({ 'hello': 'world' }, [1, 3, 4])
// const newFn = test.bind({ 'hello': 'world' }, 1, 2, 3)
// newFn();

// // (function () { }).test()

// (5).toFixed(10);





const myProto = { a: 1, setA: undefined }
myProto.setA = (function (value) { this.a = value; }).bind(myProto);

var a = { t: 1 };

Object.defineProperty(a, 'test', {
  value: 10,
  enumerable: false
})

Object.defineProperties(a, {
  'test': {
    value: 10,
    enumerable: false
  }
})

// delete a['t'];

for (var prop in a) {
  console.log(prop, a[prop])
}

// Object.entries -> [[prop1, value1], [prop2, value 2], ...]
for (var [key, value] of Object.entries(a)) {
  console.log(key, value)
}

const t = Object.create(myProto, { test: { value: 10 } });
console.log(t.a); // > 1
t.a = 20;
t.setA(20);

console.log(myProto.a); // > 20
console.log(t.a); // > 20




