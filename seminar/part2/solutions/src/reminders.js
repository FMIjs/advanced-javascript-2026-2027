// Sends one reminder per event, a few seconds apart, after the server starts.
const STEP_MS = Number(process.env.REMINDER_STEP_MS) || 1000;

function scheduleReminders(events, mailer) {
  // Bug 7: with `var` there is ONE `event` for the whole loop, and the timers read it
  // when they fire - after the loop has ended, so they all see the last event.
  // `let` / `const` create a new binding for every iteration.
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    setTimeout(() => {
      mailer.send('attendees', `Reminder: "${event.name}" starts soon`);
    }, (i + 1) * STEP_MS);
  }
}

module.exports = { scheduleReminders };
