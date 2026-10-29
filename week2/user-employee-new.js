// const a = new User('Ivan', 'email');

// Object.create({
//   greet: function () {
//     return `Hi, I am ${this.name}`;
//   },
//   toString: function () {
//     return `${this.name} <${this.email}>`;
//   }
// }).init()

const a = [1, 2, 3];
const obj = { a: 1 };

function User(name, email) {
  this.name = name;
  this.email = email;
}

User.prototype.greet = function () {
  return `Hi, I am ${this.name}`;
};

User.prototype.toString = function () {
  return `${this.name} <${this.email}>`;
};

function Employee(name, email, position, salary) {
  User.call(this, name, email); // super(name, email)
  this.position = position;
  this.salary = salary;
}

Employee.prototype = Object.create(User.prototype); // ! extends User
// Employee.prototype.constructor = Employee;
Object.defineProperty(Employee.prototype, 'constructor', {
  value: Employee,
  enumerable: false,
});

Employee.prototype.greet = function () {
  const userGreeting = User.prototype.greet.call(this); // super.greet()
  return `${userGreeting} and I work as a ${this.position}`;
};

Employee.prototype.raise = function (percent) {
  this.salary += this.salary * (percent / 100);
  return this.salary;
};

const user = new User('Ivan', 'ivan@example.com');
const employee = new Employee('Maria', 'maria@example.com', 'developer', 3000);

console.log(user.greet());          // Hi, I am Ivan
console.log(employee.greet());      // Hi, I am Maria and I work as a developer
console.log(String(employee));      // Maria <maria@example.com>  (inherited from User)
console.log(employee.raise(10));    // 3300
console.log(employee.toString());   // Maria <maria@example.com>

console.log(Object.getPrototypeOf(employee) === Employee.prototype);       // true
console.log(Object.getPrototypeOf(Employee.prototype) === User.prototype); // true
console.log(employee instanceof Employee);                                 // true
console.log(employee instanceof User);                                     // true
console.log(employee.constructor === Employee);                            // true

console.log(Object.keys(employee)); // [ 'name', 'email', 'position', 'salary' ]
