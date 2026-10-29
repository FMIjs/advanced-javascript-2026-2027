const User = {
  init(name, email) {
    this.name = name;
    this.email = email;
    return this;
  },
  greet() {
    return `Hi, I am ${this.name}`;
  },
  toString() {
    return `${this.name} <${this.email}>`;
  }
};

const Employee = Object.create(User); // !

Employee.init = function (name, email, position, salary) {
  User.init.call(this, name, email); // super(name, email)
  this.position = position;
  this.salary = salary;
  return this;
};

Employee.greet = function () {
  const userGreeting = User.greet.call(this); // super.greet()
  return `${userGreeting} and I work as a ${this.position}`;
};

Employee.raise = function (percent) {
  this.salary += this.salary * (percent / 100);
  return this.salary;
};

function createUser(name, email) {
  return Object.create(User).init(name, email);
}

function createEmployee(name, email, position, salary) {
  return Object.create(Employee).init(name, email, position, salary); // !
}

const user = createUser('Ivan', 'ivan@example.com');
const employee = createEmployee('Maria', 'maria@example.com', 'developer', 3000);

console.log(user.greet());          // Hi, I am Ivan
console.log(employee.greet());      // Hi, I am Maria and I work as a developer
console.log(String(employee));      // Maria <maria@example.com>  (inherited from User)
console.log(employee.raise(10));    // 3300
console.log(employee.toString());

console.log(Object.getPrototypeOf(employee) === Employee); // true
console.log(Object.getPrototypeOf(Employee) === User);     // true
console.log(User.isPrototypeOf(employee));                 // true

console.log(Object.keys(employee)); // [ 'name', 'email', 'position', 'salary' ]
