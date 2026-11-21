// Card 2: hoisting and the TDZ
// Write down the output BEFORE running it.

var x = 1;

function f() {
  console.log(x); // undefined
  var x = 2;
  console.log(x); // 2
}

f();
console.log(x); // 1

// ---

let y = 1;

function g() {
  console.log(y);
  let y = 2;
}

try {
  g();
} catch (err) {
  console.log(err.name);
}
