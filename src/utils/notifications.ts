import { LocalNotifications } from '@capacitor/local-notifications';
import { db } from './db-local';

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
 * Triggers a budget alert notification with deduplication
 */
export async function sendBudgetAlert(category: string, amount: number, limit: number) {
  const today = new Date().toISOString().split('T')[0];
  const notificationId = `budget-${category}-${today}`;

  // Check if already notified today
  const existing = await db.notificationLogs.get(notificationId);
  if (existing) return;

  await requestNotificationPermission();
  await LocalNotifications.schedule({
    notifications: [
      {
        title: 'Budget Exceeded! ⚠️',
        body: `You've spent $${amount} in ${category}, which is over your $${limit} limit.`,
        id: Math.floor(Math.random() * 10000),
        smallIcon: 'ic_stat_logo', // Matches Android resource
        schedule: { at: new Date(Date.now() + 1000) },
        extra: { type: 'budget' }
      }
    ]
  });

  // Log it
  await db.notificationLogs.add({
    id: notificationId,
    type: 'budget',
    timestamp: Date.now()
  });
}

/**
 * Triggers a recurring bill reminder with deduplication
 */
export async function sendRecurringReminder(description: string, amount: number) {
  const today = new Date().toISOString().split('T')[0];
  const notificationId = `recurring-${description}-${today}`;

  const existing = await db.notificationLogs.get(notificationId);
  if (existing) return;

  await requestNotificationPermission();
  await LocalNotifications.schedule({
    notifications: [
      {
        title: 'Upcoming Bill 🗓️',
        body: `Your ${description} ($${amount}) is due tomorrow.`,
        id: Math.floor(Math.random() * 10000),
        smallIcon: 'ic_stat_logo',
        schedule: { at: new Date(Date.now() + 1000) },
        extra: { type: 'recurring' }
      }
    ]
  });

  await db.notificationLogs.add({
    id: notificationId,
    type: 'recurring',
    timestamp: Date.now()
  });
}
