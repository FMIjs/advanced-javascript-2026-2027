const fs = require('fs/promises');

// The Model from week 2, now async (the week 3 homework).
// Keeps the items in memory and writes them to a JSON file on every change.
class Model {
  // createItem turns the plain JSON data into an object (for example an Event instance)
  constructor(filePath, createItem = (data) => data) {
    this.filePath = filePath;
    this.createItem = createItem;
    this.items = [];
    this.nextId = 1;
    this.writing = Promise.resolve();
    this.ready = this.load();
  }

  async load() {
    const content = await fs.readFile(this.filePath, { encoding: 'utf-8' });
    this.items = JSON.parse(content).map((data) => this.createItem(data));
    this.nextId = this.items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
  }

  // Writes are chained, so two saves never write the file at the same time.
  save() {
    this.writing = this.writing.then(() => fs.writeFile(this.filePath, JSON.stringify(this.items, null, 2)));
    return this.writing;
  }

  async findAll() {
    await this.ready;
    return this.items;
  }

  async findById(id) {
    await this.ready;
    return this.items.find((item) => item.id === id);
  }

  async create(data) {
    await this.ready;
    const item = this.createItem({ id: this.nextId++, ...data });
    this.items.push(item);
    await this.save();
    return item;
  }
}

module.exports = Model;
