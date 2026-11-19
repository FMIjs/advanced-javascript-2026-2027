// const fs = require("fs");

// // callback hell example
// fs.readFile("test.txt", "utf8", (err, data) => {
//   if (err) {
//     console.error(err);
//     return;
//   }
//   console.log(data);
//   fs.readFile("test.txt", "utf8", (err, data) => {
//     if (err) {
//       console.error(err);
//       return;
//     }
//     console.log(data);
//     fs.readFile("test.txt", "utf8", (err, data) => {
//       if (err) {
//         console.error(err);
//         return;
//       }
//       console.log(data);
//       fs.readFile("test.txt", "utf8", (err, data) => {
//         if (err) {
//           console.error(err);
//           return;
//         }
//         console.log(data);
//         fs.readFile("test.txt", "utf8", (err, data) => {
//           if (err) {
//             console.error(err);
//             return;
//           }
//           console.log(data);
//         });
//       });
//     });
//   });
// });

// const promise = new Promise((resolve, reject) => {
//   // calculations
//   resolve("Success"); // --> promise transitions to fulfilled state

//   reject(new Error("Failure")); // --> promise transitions to rejected state
// });

// promise
//   .then((data) => {
//     console.log("Promise fulfilled", data);
//   })
//   .catch((err) => {
//     console.error("Promise rejected", err);
//   });

// // promise chain
// promise
//   .then((data) => {
//     return new Promise((resolve, reject) => {
//       resolve("Next success");
//     });
//   })
//   .then((data) => {
//     console.log("Next promise fulfilled", data);
//   })
//   .catch((err) => {
//     console.error("Promise rejected", err);
//   });

// const promise1 = Promise.resolve("First success");
// const promise2 = Promise.resolve("Second success");
// const promise3 = Promise.resolve("Third success");

// Promise.all([promise1, promise2, promise3])
//   .then((data) => {
//     console.log("All promises fulfilled", data);
//   })
//   .catch((err) => {
//     console.error("Promise rejected", err);
//   });

// Promise.allSettled([promise1, promise2, promise3]).then((results) => {
//   console.log("All promises settled", results);
// });

// // home work
// const promisify = (nodeFn) => {};
// const readFileAsync = promisify(fs.readFile);
// readFileAsync("test.txt", "utf8")
//   .then((data) => {
//     console.log("Read file successfully", data);
//   })
//   .catch((err) => {
//     console.error("Failed to read file", err);
//   });

// // async / await

const fakeFetch = (url) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (url) {
        resolve(`Fetched data from ${url}`);
      } else {
        reject(new Error("Invalid URL"));
      }
    }, 1000);
  });
};
const fakeLog = (message) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (message) {
        console.log(message);
        resolve();
      } else {
        reject(new Error("No message provided"));
      }
    }, 500);
  });
};
const fakeStore = (data) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (data) {
        console.log("Stored data:", data);
        resolve();
      } else {
        reject(new Error("No data to store"));
      }
    }, 500);
  });
};

// const handle = () => {
//   // don't use `async`!
//   fakeFetch("https://example.com")
//     .then((data) => {
//       return fakeLog(data).then(() => data);
//     })
//     .then((data) => fakeStore(data))
//     .catch((err) => console.error(err));
// };

// const asyncHandleRequest = async () => {
//   try {
//     const data = await fakeFetch("https://example.com");
//     // await fakeLog(data);
//     // await fakeStore(data);
//     await Promise.all([fakeLog(data), fakeStore(data)]);
//   } catch (err) {
//     console.error(err);
//   }
// };

// const deepHandleRequestPromise = async (url) => {
//   return new Promise((resolve, reject) => {
//     resolve(
//       // --
//       fakeFetch(url).then((d) =>
//         // --
//         fakeLog(d).then(() => fakeStore(d)),
//       ),
//     );
//   });
// };

const midOperationFailHandling = () => {
 return fakeFetch("https://example.com/1")
    .then((data) => fakeStore()) // made a mistake: forgot to pass data
    .catch((err) => {
      console.error("failed fetch#1", err);
      return fakeLog(err.message);
    })
    .then(() => fakeFetch("https://example.com/2"))
    .then((data) => fakeLog(data).then(() => data))
    .then((data) => fakeStore(data))
    .catch((err) => {
      console.error("failed fetch#2");
    });
};

const midOperationFailHandlingAsync = async () => {
  try {
    const data1 = await fakeFetch("https://example.com/1");
    await fakeStore(); // made a mistake: forgot to pass data
  } catch (err) {
    console.error("failed fetch#1", err);
    await fakeLog(err.message);
  }
  try {
    const data2 = await fakeFetch("https://example.com/2");
    await fakeLog(data2);
    await fakeStore(data2);
  } catch (err) {
    console.error("failed fetch#2");
  }
};