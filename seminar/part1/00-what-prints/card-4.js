// Card 4: `this`
// Write down the output BEFORE running it.
name = 'test'
const user = {
  name: 'Ivan',
  regular() {
    return this.name;
  },
  arrow: () => this.name,
  later() {
    setTimeout(function () {
      console.log('later:', this === user);
    }, 0);
    setTimeout(() => {
      console.log('later arrow:', this === user);
    }, 0);
  },
};

const regular = user.regular;

console.log(user.regular()); // Ivan
console.log(user.arrow()); // test
console.log(regular()); // test
console.log(regular.call({ name: 'Maria' })); // Maria
user.later(); // later: false | later arrow: true
