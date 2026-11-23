// Sends one reminder per event, a few seconds apart, after the server starts.
const STEP_MS = Number(process.env.REMINDER_STEP_MS) || 1000;

function scheduleReminders(events, mailer) {
  for (var i = 0; i < events.length; i++) {
    var event = events[i];
    setTimeout(() => {
      mailer.send('attendees', `Reminder: "${event.name}" starts soon`);
    }, (i + 1) * STEP_MS);
  }
}

module.exports = { scheduleReminders };
