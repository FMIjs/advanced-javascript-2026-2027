const fs = require('fs');

// Next time: reduce + arrow functions

class Model {
  constructor(filePath) {
    this.filePath = filePath;
    this.items = this.load();
    this.nextId = this.items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
    this.saveScheduled = false;
  }

  load() {
    try {
      return JSON.parse(fs.readFileSync(this.filePath, { encoding: 'utf-8' }));
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  // All sync changes in the current tick are batched into one write.
  scheduleSave() {
    if (this.saveScheduled) { return; }
    this.saveScheduled = true;
    const self = this;
    process.nextTick(function () {
      self.saveScheduled = false;
      fs.writeFileSync(self.filePath, JSON.stringify(self.items, null, 2));
    });
  }

  findAll() {
    return this.items;
  }

  findById(id) {
    return this.items.find(item => item.id === id);
  }

  create(data) {
    const item = { id: this.nextId++, ...data };
    this.items.push(item);
    this.scheduleSave();
    return item;
  }

  update(id, data) {
    const item = this.findById(id);
    if (!item) { return null; }
    Object.assign(item, data, { id });
    this.scheduleSave();
    return item;
  }

  remove(id) {
    const index = this.items.findIndex(item => item.id === id);
    if (index === -1) { return false; }
    this.items.splice(index, 1);
    this.scheduleSave();
    return true;
  }
}

const users = new Model('./users.json');

const ivan = users.create({ name: 'Ivan', email: 'ivan@example.com' });
const maria = users.create({ name: 'Maria', email: 'maria@example.com' });
users.update(ivan.id, { email: 'ivan@new.com' });
users.remove(maria.id);

console.log(users.findAll()); // file is not written yet - it is written once after this code finishes
