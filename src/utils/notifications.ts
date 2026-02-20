import { LocalNotifications } from '@capacitor/local-notifications';

/**
 * Requests notification permissions from the user
 */
export async function requestNotificationPermission() {
  const status = await LocalNotifications.checkPermissions();
  if (status.display !== 'granted') {
    await LocalNotifications.requestPermissions();
  }
}

/**
 * Triggers a budget alert notification
 */
export async function sendBudgetAlert(category: string, amount: number, limit: number) {
  await requestNotificationPermission();
  await LocalNotifications.schedule({
    notifications: [
      {
        title: 'Budget Exceeded! ⚠️',
        body: `You've spent $${amount} in ${category}, which is over your $${limit} limit.`,
        id: Math.floor(Math.random() * 10000),
        schedule: { at: new Date(Date.now() + 1000) }, // Send in 1 second
        sound: 'beep.wav',
        extra: { type: 'budget' }
      }
    ]
  });
}

/**
 * Triggers a recurring bill reminder
 */
export async function sendRecurringReminder(description: string, amount: number) {
  await requestNotificationPermission();
  await LocalNotifications.schedule({
    notifications: [
      {
        title: 'Upcoming Bill 🗓️',
        body: `Your ${description} ($${amount}) is due tomorrow.`,
        id: Math.floor(Math.random() * 10000),
        schedule: { at: new Date(Date.now() + 1000) },
        extra: { type: 'recurring' }
      }
    ]
  });
}
