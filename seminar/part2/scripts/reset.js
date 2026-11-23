// Restores the data files from data/seed.
// Run with: node scripts/reset.js
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const seedDir = path.join(dataDir, 'seed');

for (const file of fs.readdirSync(seedDir)) {
  fs.copyFileSync(path.join(seedDir, file), path.join(dataDir, file));
  console.log(`reset data/${file}`);
}
