
console.log(addFunc)
// console.log(add) // Uncaught ReferenceError ReferenceError: Cannot access 'add' before initialization
console.log(varAdd) // undefined
// console.log(globalAdd) // Uncaught ReferenceError ReferenceError: globalAdd is not defined
console.log(addFunc(1, 2));

function addFunc(a, b) {
  return a + b;
}

// add() // ReferenceError: Cannot access 'add' before initialization (const is in the TDZ until this line)
const add = (a, b) => {
  return a + b;
}
var varAdd = (a, b) => {
  return a + b;
}
globalAdd = (a, b) => {
  return a + b;
}
const addShort = (a, b) => a + b;

const constructObj = (a, b) => {
  return { a, b };
}
const constructObjShort = (a, b) => ({ a, b });


// ---

// `this` IN REGULAR FUNCTIONS vs ARROW FUNCTIONS
// Regular function: `this` is decided at CALL time (who is before the dot / call / apply / bind / new)
// Arrow function: has NO own `this` - it takes `this` from the surrounding scope at DEFINITION time (lexical this)

// 1. Methods on an object literal
this.name = 'Global'; // In Node.js, this will be module.exports, in browser it will be window
const user1 = {
  name: 'Ivan',
  sayHi() { // same as `sayHi: function () { ... }`
    console.log('regular:', this.name);
  },
  sayHiArrow: () => {
    // `this` here is NOT user1 - it's the `this` of the outer scope
    // (in a CommonJS module that's `module.exports` -> { name: 'Global' } after the line above user1)
    console.log('arrow:', this.name);
  }
};
user1.sayHi(); // regular: Ivan
user1.sayHiArrow(); // arrow: Global


// 2. Callbacks inside a method - the place where arrows shine
const team = {
  name: 'Team A',
  members: ['Ivan', 'Maria'],

  printRegular: function () {
    this.members.forEach(function (member) {
      // forEach calls the callback as a plain function -> `this` is globalThis (or undefined in strict mode)
      console.log(member + ' is in ' + this.name);
    });
  },

  // Old fix #1: save `this` in a variable
  printSelf: function () {
    const self = this;
    this.members.forEach(function (member) {
      console.log(member + ' is in ' + self.name);
    });
  },

  // Old fix #2: bind the callback
  printBind: function () {
    this.members.forEach(function (member) {
      console.log(member + ' is in ' + this.name);
    }.bind(this));
  },

  // Modern fix: arrow callback takes `this` from printArrow
  printArrow: function () {
    this.members.forEach((member) => {
      console.log(member + ' is in ' + this.name);
    });
  }
};
team.printRegular(); // Ivan is in undefined, Maria is in undefined
team.printSelf(); // Ivan is in Team A, Maria is in Team A
team.printBind(); // Ivan is in Team A, Maria is in Team A
team.printArrow(); // Ivan is in Team A, Maria is in Team A


// 3. Same thing with setTimeout
const counter = {
  count: 0,
  startRegular: function () {
    setTimeout(function () {
      // In Node `this` is the Timeout object, in the browser it's window
      console.log('timeout regular:', this.count);
    }, 0);
  },
  startArrow: function () {
    setTimeout(() => {
      this.count++;
      console.log('timeout arrow:', this.count);
    }, 0);
  }
};
counter.startRegular(); // timeout regular: undefined
counter.startArrow(); // timeout arrow: 1


// 4. call / apply / bind can NOT change an arrow's `this`
function regularGetName() { return this && this.name; }
const arrowGetName = () => this && this.name;

const ivan = { name: 'Ivan' };
console.log(regularGetName.call(ivan)); // Ivan
console.log(arrowGetName.call(ivan)); // Global - `ivan` is ignored, `this` is still module.exports
console.log(regularGetName.bind(ivan)()); // Ivan
console.log(arrowGetName.bind(ivan)()); // Global


// 5. Losing `this` when a method is passed around (extracted)
const person = {
  name: 'Maria',
  greet: function () { return 'Hi, ' + this.name; }
};
const greet = person.greet; // just a reference to the function, `person` is forgotten
console.log(greet()); // Hi, undefined
console.log(greet.bind(person)()); // Hi, Maria

// Same problem as in week2: emitter.subscribe('done', obj.handleData.bind(obj))
// Arrow class fields solve it - the arrow is created per instance, inside the constructor,
// so its `this` is always the instance
class Button {
  constructor(label) {
    this.label = label;
  }

  handleClickRegular() { // lives on Button.prototype, `this` depends on the call
    return 'clicked ' + (this && this.label);
  }

  handleClickArrow = () => { // own property of every instance, `this` is fixed
    return 'clicked ' + this.label;
  }
}
const btn = new Button('Save');
const onClickRegular = btn.handleClickRegular;
const onClickArrow = btn.handleClickArrow;
console.log(onClickRegular()); // clicked undefined (class bodies are strict -> this is undefined)
console.log(onClickArrow()); // clicked Save
console.log(Object.hasOwn(btn, 'handleClickArrow')); // true  -> one copy per instance (more memory)
console.log(Object.hasOwn(btn, 'handleClickRegular')); // false -> shared via the prototype


// 6. Arrow functions can NOT be constructors (no own `this` to create, no `prototype`)
function PersonFn(name) { this.name = name; }
const PersonArrow = (name) => { this.name = name; };

console.log(new PersonFn('Ivan')); // PersonFn { name: 'Ivan' }
console.log(PersonArrow.prototype); // undefined
try {
  new PersonArrow('Ivan');
} catch (e) {
  console.log(e.message); // PersonArrow is not a constructor
}


// 7. Don't use arrows for prototype methods
PersonFn.prototype.getNameRegular = function () { return this.name; };
PersonFn.prototype.getNameArrow = () => this.name; // `this` is the module scope, not the instance

const p = new PersonFn('Georgi');
console.log(p.getNameRegular()); // Georgi
console.log(p.getNameArrow()); // Global - module.exports.name, not 'Georgi'


// 8. Nested: an arrow takes `this` from the closest REGULAR function around it
const outer = {
  name: 'outer',
  regular: function () {
    const arrow1 = () => {
      const arrow2 = () => this.name; // goes up through arrow1 to `regular`
      return arrow2();
    };
    return arrow1();
  }
};
console.log(outer.regular()); // outer
const other = { name: 'other', regular: outer.regular };
console.log(other.regular()); // other - `regular`'s `this` changed, so the arrows follow it


// Summary:
// - Use regular functions (or method shorthand) for object/prototype/class methods
// - Use arrow functions for callbacks inside methods (forEach, map, setTimeout, promises, event handlers)
// - Arrow `this` can't be changed with call/apply/bind and arrows can't be used with `new`
