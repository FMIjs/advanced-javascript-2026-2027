// Instructor script: checks that all 11 bugs are fixed.
// Every check gets a fresh server with fresh seed data.
//
//   node verify.js          - checks the solution (this folder)
//   node verify.js ..       - checks the original, buggy app (every check should fail)
//   node verify.js <path>   - checks a student's copy
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const appDir = path.resolve(process.argv[2] || __dirname);
let nextPort = 3100;

function resetData() {
  const dataDir = path.join(appDir, 'data');
  for (const file of fs.readdirSync(path.join(dataDir, 'seed'))) {
    fs.copyFileSync(path.join(dataDir, 'seed', file), path.join(dataDir, file));
  }
}

function startServer() {
  const port = nextPort++;
  const proc = spawn(process.execPath, ['server.js'], {
    cwd: appDir,
    env: { ...process.env, PORT: String(port), REMINDER_STEP_MS: '50' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  proc.exited = false;
  proc.on('exit', () => {
    proc.exited = true;
  });
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('server did not start')), 3000);
    proc.stdout.on('data', (chunk) => {
      if (String(chunk).includes('running')) {
        clearTimeout(timer);
        resolve({ proc, base: `http://localhost:${port}` });
      }
    });
    proc.on('exit', () => reject(new Error('server exited on start')));
  });
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function request(base, method, url, body) {
  const res = await fetch(base + url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (err) {
    json = text;
  }
  return { status: res.status, body: json };
}

async function isAlive(proc, base) {
  await wait(100);
  if (proc.exited) {
    return false;
  }
  try {
    return (await request(base, 'GET', '/events')).status === 200;
  } catch (err) {
    return false;
  }
}

const checks = [
  ['1. a missing event returns 404 and the server survives', async ({ proc, base }) => {
    const res = await request(base, 'GET', '/events/999');
    return res.status === 404 && (await isAlive(proc, base));
  }],
  ['2. GET /events/1 finds the event', async ({ base }) => {
    const res = await request(base, 'GET', '/events/1');
    return res.status === 200 && res.body.name === 'JS Meetup';
  }],
  ['3. a broken JSON body returns 400 and the server survives', async ({ proc, base }) => {
    const res = await request(base, 'POST', '/events', '{"name": "Broken');
    return res.status === 400 && (await isAlive(proc, base));
  }],
  ['4. responses include seatsLeft', async ({ base }) => {
    const list = await request(base, 'GET', '/events');
    return list.body.map((event) => event.seatsLeft).join() === '47,5,0';
  }],
  ['5. tagging one event does not tag others, and the tag is saved', async ({ base }) => {
    await request(base, 'POST', '/events/2/tags', { tag: 'node' });
    const list = (await request(base, 'GET', '/events')).body;
    const saved = JSON.parse(fs.readFileSync(path.join(appDir, 'data', 'events.json'), 'utf-8'));
    return JSON.stringify(list.map((event) => event.tags)) === JSON.stringify([['js', 'meetup'], ['node'], []])
      && JSON.stringify(saved[1].tags) === JSON.stringify(['node']);
  }],
  ['6. /users describes attendees and organizers correctly', async ({ base }) => {
    const res = await request(base, 'GET', '/users');
    return res.body.map((user) => user.description).join(' | ')
      === 'Ivan (attendee) | Maria (attendee) | Georgi (attendee) | Elena (organizer at FMI)';
  }],
  ['7. every event gets its own reminder', async ({ base }) => {
    await wait(300);
    const res = await request(base, 'GET', '/notifications');
    const reminders = res.body.filter((mail) => mail.text.startsWith('Reminder')).map((mail) => mail.text);
    return reminders.join(' | ')
      === 'Reminder: "JS Meetup" starts soon | Reminder: "Node.js Workshop" starts soon | Reminder: "Sold-out Talk" starts soon';
  }],
  ['8. booking returns 201 and sends a confirmation', async ({ base }) => {
    const res = await request(base, 'POST', '/events/2/bookings', { userId: 1 });
    const mails = (await request(base, 'GET', '/notifications')).body;
    return res.status === 201 && res.body.seatsLeft === 4
      && mails.some((mail) => mail.to === 'ivan@example.com' && mail.text.includes('Node.js Workshop'));
  }],
  ['9. a full event rejects bookings with 409', async ({ base }) => {
    const res = await request(base, 'POST', '/events/3/bookings', { userId: 3 });
    const event = (await request(base, 'GET', '/events/3')).body;
    return res.status === 409 && event.bookedCount === 2;
  }],
  ['10. attendees are listed', async ({ base }) => {
    const res = await request(base, 'GET', '/events/1/attendees');
    return Array.isArray(res.body) && res.body.map((user) => user.name).join() === 'Ivan,Maria,Georgi';
  }],
  ['11. 20 people at once can not book more than 5 seats', async ({ base }) => {
    const statuses = await Promise.all(Array.from({ length: 20 }, (_, i) => request(base, 'POST', '/events/2/bookings', { userId: (i % 3) + 1 })
      .then((res) => res.status)));
    const event = (await request(base, 'GET', '/events/2')).body;
    return statuses.filter((status) => status === 201).length === 5
      && statuses.filter((status) => status === 409).length === 15
      && event.bookedCount === 5;
  }],
];

async function main() {
  console.log(`Checking ${appDir}\n`);
  let passed = 0;
  for (const [label, check] of checks) {
    resetData();
    let ok = false;
    let note = '';
    let server;
    try {
      server = await startServer();
      ok = await check(server);
    } catch (err) {
      note = ` (${err.message})`;
    } finally {
      if (server) {
        server.proc.kill();
      }
    }
    passed += ok ? 1 : 0;
    console.log(`${ok ? '✓' : '✗'} ${label}${note}`);
  }
  resetData();
  console.log(`\n${passed} / ${checks.length} fixed`);
}

main();
