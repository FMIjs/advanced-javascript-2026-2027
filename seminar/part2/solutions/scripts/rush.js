// 20 people try to book the 5 seats of event 2 at the same time.
// Run with: node scripts/rush.js   (the server must be running)
const BASE = `http://localhost:${process.env.PORT || 3000}`;
const EVENT_ID = 2;
const PEOPLE = 20;

async function book(userId) {
  const res = await fetch(`${BASE}/events/${EVENT_ID}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  return res.status;
}

async function main() {
  const userIds = Array.from({ length: PEOPLE }, (_, i) => (i % 3) + 1);
  const statuses = await Promise.all(userIds.map(book));

  const counts = statuses.reduce((acc, status) => {
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  console.log('responses by status:', counts);

  const event = await (await fetch(`${BASE}/events/${EVENT_ID}`)).json();
  console.log(`event ${EVENT_ID}: capacity ${event.capacity}, booked ${event.bookedCount}, seatsLeft ${event.seatsLeft}`);
}

main().catch((err) => console.error('rush failed:', err.message));
