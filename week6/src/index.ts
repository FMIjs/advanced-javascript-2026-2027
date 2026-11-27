// import { createServer } from "http";

import { write, createReadStream, createWriteStream } from "fs";
import { pipeline, Readable, Transform, Writable } from "stream";

// type User = {
//   name: string;
//   age: number;
// };

// interface IUser {
//   name: string;
//   age: number;
// }

// // namespace Window {
// //  interface IUser {
// //    name: string;
// //  }

// //  interface IUser {
// //    age: number;
// //  }

// //  const test: IUser;
// // }

// // type Num<T> = T extends Array<any>["length"] ? T : never;
// // NumToArray<10> -> [any, NumToArray<9>, NumToArray<8>]
// // type NumToArray<T> = T extends 0
// //   ? []
// //   : NumToArray<T> extends [any, ...infer U] // [any, any, any, any] [any] ...infer U -> [any, any, any]
// //     ? [any, ...NumToArray<U['length']>]
// //     : never;

// type NumToArray<
//   T extends number,
//   ACC extends any[] = [],
// > = ACC["length"] extends T ? ACC : NumToArray<T, [...ACC, any]>;

// type Merge<A extends any[], B extends any[]> = [...A, ...B];
// type Add<A extends number, B extends number> = Merge<
//   NumToArray<A>,
//   NumToArray<B>
// >["length"];
// type result = Add<1, 2>;

// type Head<T extends any[]> = T extends [infer Head, ...any] ? Head : never;
// type Tail<T extends any[]> = T extends [any, ...infer U] ? U : never;
// type a = Head<[1, 2, 3]>;
// type b = Tail<[1, 2, 3]>;

// type c = NumToArray<10>;
// // type Add<A, B> = A extends Num<infer U> ? B extends Num<infer I> ? [...Array]

// // type a = Num<2>
// // type b = Num<3>
// // type c = Add<a, b> // Num<5>

// type A = {
//   a: number;
// };

// type B = {
//   a: number | string;
//   b: string;
// };

// function test(obj: A & B) {
//   obj.a; // number | string
// }

// function greet(user: User | string): string {
//   if (typeof user === "string") {
//     return `Hello, ${user}`;
//   }
//   return `Hello, ${user.name} (${user.age})`;
// }

// console.log(greet({ name: "Ivan", age: 21 }));

const pr = Promise.resolve([1, 2, 3]);
const rs = Readable.from([1, 2, 3], { objectMode: true }); // generator

rs.on("data", function (chunk) {
  console.log(chunk);
});

pr.then((data) => {
  console.log(data);
  return JSON.stringify(data);
}).then((data) => console.log(data)); // | > [1,2,3]

const ws = new Writable({
  write(chunk) {
    console.log(chunk); // > 1 |  > 2 | > 3
  },
});

const ts = new Transform({
  transform(chunk, enc, done) {
    try {
      done(null, JSON.stringify(chunk));
    } catch (err) {
      done(err as Error);
    }
  },
});

rs.pipe(ts).pipe(ws);
pipeline(rs, ts, ws);
