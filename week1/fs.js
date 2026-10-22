const fs = require('fs');

function createEventEmitter() {
  return {
    subs: {},
    subscribe: function (eventName, callback) {
      // if (!this.subs[eventName]) this.subs[eventName] = [];
      // this.subs[eventName].push(callback);

      this.subs[eventName] = (this.subs[eventName] || []).concat(callback);

      // Mutable
      // (this.subs[eventName] ??= []).push(callback); 
      // ??= is logical nullish assignment operator

      // Immutable
      // this.subs[eventName] = [...(this.subs[eventName] || []), callback]
      // ... is spread operator
    },
    emit: function (eventName, ...data) { // ... rest operator (collect all arg values into an array)
      (this.subs[eventName] || []).forEach(function (cb) {
        cb(...data); // ... spread operator (spread all the arguments)
      });
    }
  }
}

const obj = {
  data: [],
  handleData: function () {
    this.data.push(value);
    if (this.data.length !== 2) { return; }
    const newData = data[0] + '\n' + data[1];
    console.log(newData);
    // fs.watchFile('./new.js', newData, function (err) {
    //   if (err) { console.error(err); return; }
    //   fs.readFile()
    //   // .. 
    //   // ...
    // })
  },
  handleError: function () {
    console.error(error)
  }
}

fileReaderEmitter = createEventEmitter();

fileReaderEmitter.subscribe('error', obj.handleError.bind(obj));
fileReaderEmitter.subscribe('done', obj.handleData.bind(obj));

// const data = []
// function done(value) {
//   data.push(value);
//   if (data.length !== 2) { return; }
//   const newData = data[0] + '\n' + data[1];

//   fs.watchFile('./new.js', newData, function (err) {
//     if (err) { console.error(err); return; }
//     fs.readFile()
//     // .. 
//     // ...
//   })
// }


function readReady(err, data) {
  if (err) { fileReaderEmitter.emit('error', err); return; }
  fileReaderEmitter.emit('done', data);
}

fs.readFile('./index.js', { encoding: 'utf-8' }, readReady);

fs.readFile('./fs.js', { encoding: 'utf-8' }, readReady);



console.log(1);
// fs.writeFileSync('test.txt', 'HELLO!');
// const content = fs.readFileSync('./index.js', { encoding: 'utf-8' });

// console.log(content);

