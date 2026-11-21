// Card 5: prototypes and shadowing
// Write down the output BEFORE running it.

// const proto2 = { higher: true };
// const proto = Object.create(proto2);
// proto.items = [];
// proto.count = 0;
const proto = { items: [], count: 0 };

const a = Object.create(proto);
const b = Object.create(proto);

/**
 * proto { items }
 *  |
 *  -- a {}
 *  -- b { items }
 */

a.items.push('x');
a.count++; // a.count = a.count + 1; --> same, but longer
b.items = ['y'];
// b.__proto__.items = ['z']
// Object.getPrototypeOf(b).items = ['z'];

console.log(
  a.items, b.items, proto.items,
  a.items === proto.items, b.items === proto.items
);
console.log(b.__proto__.items)
console.log(a.count, b.count, proto.count);
console.log(Object.keys(a), Object.keys(b));
for (const key in a) {
  console.log('a', key, a[key]);
}
for (const key in b) {
  console.log('b', key, b[key]);
}