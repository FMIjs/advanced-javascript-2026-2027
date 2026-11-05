# Week 3 Plan

## 1. Quick recap: inheritance and `call` / `apply` / `bind`
- `this` is decided by how a function is called
- `call` / `apply` call the function right away; `bind` returns a new function with `this` fixed
- `User` → `Employee` three ways: objects linked to other objects vs constructor functions vs `class`
- Calling the parent: `User.init.call(this, ...)` / `User.call(this, ...)` / `super(...)`
- Lead-in to arrows: `obj.handleData.bind(obj)` and `const self = this` are both workarounds for losing `this`

## 2. Arrow functions
- Syntax and implicit return
- Lexical `this` (replaces `const self = this` / `bind`)
- No `prototype`, can't be called with `new`, no `arguments`
- When not to use arrows: object methods, prototype methods, constructors

## 3. Array methods
- `map`, `filter`, `find`, `some`, `every`
- `reduce`: totals, grouping and counting, turning an array into an object
- Immutable updates with spread

## 4. Asynchronous code: callbacks → Promises
- Problems with callbacks: nesting, error handling, coordinating several tasks
- Promise states; `then` / `catch` / `finally`; chaining
- Wrapping a callback API in a Promise (`new Promise`, `util.promisify`, `fs/promises`)
- `Promise.all`, `allSettled`, `race`, `any`

## 5. `async` / `await`
- Rewriting Promise chains
- Error handling with `try` / `catch`
- Running tasks one after another vs in parallel

## Homework
- Make `Model` async using `fs/promises`
