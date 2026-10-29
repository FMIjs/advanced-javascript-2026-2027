class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }

  greet() {
    return `Hi, I am ${this.name}`;
  }

  toString() {
    return `${this.name} <${this.email}>`;
  }
}


class Employee extends User {
  constructor(name, email, position, salary) {
    super(name, email);
    this.position = position;
    this.salary = salary;
  }

  greet() {
    const userGreeting = super.greet();
    return `${userGreeting} and I work as a ${this.position}`;
  }

  raise(percent) {
    this.salary += this.salary * (percent / 100);
    return this.salary;
  }
}

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

for (const key in employee) {
  console.log(key); // name, email, position, salary - class methods are not enumerable
}
