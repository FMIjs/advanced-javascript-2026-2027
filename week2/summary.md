# Week 2 Summary

## `this` and borrowing functions
- `this` is decided by **how** a function is called, not where it is defined.
- `fn.call(ctx, a, b)` and `fn.apply(ctx, [a, b])` call `fn` right away with `this = ctx`.
- `fn.bind(ctx, ...args)` returns a **new function** whose `this` is fixed to `ctx`. This is useful for callbacks: `emitter.subscribe('done', obj.handleData.bind(obj))`.

## Prototypes
- Every object has a hidden link to its prototype (`Object.getPrototypeOf(obj)`). When a property isn't found on the object, JavaScript looks it up along the prototype chain.
- Built-ins work the same way: `(5).toFixed(2)` finds `toFixed` on `Number.prototype`. You can wrap ("monkey-patch") those methods, but you shouldn't in real code.
- `Object.create(proto, descriptors)` creates a new object whose prototype is `proto`.
- Writing to a property creates it on the object itself and **shadows** the prototype's version. The prototype's value doesn't change.

## Property descriptors
- `Object.defineProperty(obj, key, { value, writable, enumerable, configurable })` gives control over how a property behaves. Flags you leave out default to `false`.
- Non-enumerable properties are skipped by `for...in`, `Object.keys` and `Object.entries`.

## Inheritance: three ways to model `User` → `Employee`
| Style | Inheriting | Calling the parent ("super") | Creating an object |
|---|---|---|---|
| Objects linked to other objects (`user-employee.js`) | `Object.create(User)` | `User.init.call(this, ...)` | `Object.create(Employee).init(...)` |
| Constructor functions (`user-employee-new.js`) | `Employee.prototype = Object.create(User.prototype)` and restore `constructor` | `User.call(this, ...)` | `new Employee(...)` |
| `class` (`user-employee-class.js`) | `class Employee extends User` | `super(...)`, `super.greet()` | `new Employee(...)` |

- All three build the **same prototype chain**. `class` is shorter syntax for the constructor-function version.
- Class methods are non-enumerable, so `Object.keys` shows only the object's own data.
- Checks: `instanceof` (works with constructors and classes), `Proto.isPrototypeOf(obj)` (works with plain objects).

## `Model` class (`model.js`)
- A small data store kept in a JSON file: `findAll`, `findById`, `create`, `update`, `remove`.
- `process.nextTick` **batches** saving: every change made by the synchronous code that's currently running results in a single file write once that code finishes.
- Previews of next week: an arrow function (`item => item.id === id`), `reduce` (finding the max id) and spread (`{ id, ...data }`).
