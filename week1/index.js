// console.log(typeof anObject);

// // HOISTING
// var aString = 'hello';
// var aNumber = 42;
// var aBigInt = 9007199254740993n;
// var aBoolean = true;
// var anUndefined = undefined;
// var aNull = null;
// var aSymbol = Symbol('hello');
// console.log(test2)

// let test = 123;

// const test2 = { test1: 123 };

// test2 = [12, 23];
// test2.test1 = 321;


// var primitives = [aString, aNumber, aBigInt, aBoolean, anUndefined, aNull, aSymbol];

// for (var value of primitives) {
//   console.log(typeof value, value);
// }

// // typeof null returns 'object' because of a bug kept for backward compatibility.
// console.log(aNull === null);

// var anObject = { name: 'Ivan' };
// var anArray = [1, 2, 3, anObject];
// var aFunction = function () { return 1; };
// var aDate = new Date();
// var aRegExp = /abc/;
// var aMap = new Map([['key1', 'value1'], [anObject, 'value2']]);
// var aSet = new Set([1, 2]);
// var aWeakMap = new WeakMap();
// var aWeakSet = new WeakSet();
// var anError = new Error('oops');
// var aPromise = Promise.resolve(1);
// var aTypedArray = new Uint8Array(2);
// var aStringObject = new String('hello');

// // aStringObject.value = 'hello';

// // aStringObject + aStringObject

// var nonPrimitives = [
//   anObject, anArray, aFunction, aDate, aRegExp, aMap, aSet,
//   aWeakMap, aWeakSet, anError, aPromise, aTypedArray, aStringObject
// ];

// for (var value of nonPrimitives) {
//   console.log(typeof value, Object.prototype.toString.call(value));
// }

// var copy = anObject;
// copy.name = 'Maria';
// console.log(anObject.name);
// console.log({ a: 1 } === { a: 1 });


// var a = 10;



// // context is the value of this variable

// function t() {
//   console.log(this);
// }

// function test2() {

//   {
//     let c = 10;
//   }

//   {
//     let c = 20;
//   }

//   {
//     const c = 20;
//   }

//   // var c = 10;
//   // function test() {
//   //   var b = 200;
//   //   console.log(a, b, c); // > 10, 200
//   // }
//   // console.log(c);
// }



// console.log(b);

// '1' !== 1

// const obj = {
//   add: function (a, b) {
//     if (this !== obj) throw new Error('Invalid context')
//     return a + b;
//   },
//   multiply: function (a, b) {
//     if (this !== obj) throw new Error('Invalid context')
//     console.log(this);
//     return a * b;
//   }
// }

// const arr = [obj.add, obj.multiply];

// console.log(obj.add(1, 2));
// console.log(arr[1](1, 2));


// function one() {
//   setTimeout(function () {
//     console.log('Test');
//   }, 1000);

//   queueMicrotask(function () {
//     console.log('Hello');
//   });

//   setInterval(function() {

//   }, 1000);

//   requestAnimationFrame()

//   console.log(1);
// }

// function two() {
//   one();
// }

// function three() {
//   two();
// }


// three();
// console.log(2);

























// var greet = function (name) {
//   return 'Hello, ' + name;
// };
// console.log(greet('Ivan'));

// var operations = {
//   add: function (a, b) { return a + b; },
//   multiply: function (a, b) { return a * b; }
// };
// var operationList = [operations.add, operations.multiply];
// console.log(operations.add(2, 3), operationList[1](2, 3));

// function applyTwice(fn, value) {
//   return fn(fn(value));
// }
// console.log(applyTwice(function (x) { return x * 2; }, 5));

// function makeMultiplier(factor) {
//   return function (x) {
//     return x * factor;
//   };
// }
// var triple = makeMultiplier(3);
// console.log(triple(4));

// greet.callCount = 0;
// console.log(greet.callCount, greet.name, greet.length);

// console.log([1, 2, 3].map(triple));





for (var i = 0; i < 10; i++) {
  // function newScope(a) {
  //   return function () {
  //     console.log(a);
  //   }
  // }
  // const cb = newScope(i);
  // setTimeout(cb, 1000);

  setTimeout(
    (function (a) {
      return function () {
        console.log(a);
      };
    })(i),
    1000
  );
}


for (let i = 0; i < 10; i++) {
  setTimeout(function () {
    console.log(i);
  });
}

; var lib = (function () {
  var temp = 100;
  //...
  return {
    fn: function () {

    },
    setTemp: function (val) {
      temp = val;
    }
  };
})(); // IIFE


lib.fn();
lib.setTemp(1000);