import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { SchedulableTriggerInputTypes } from 'expo-notifications';

// ─── Permission ───────────────────────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice) {
    console.warn('[Notifications] Not a real device — skipping permission request');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === 'granted') return true;
  if (existingStatus === 'denied') return false;

  // undetermined — request now
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// ─── Agua triggers (7 daily) ──────────────────────────────────────────────────

const AGUA_HOURS = [8, 10, 12, 14, 16, 18, 20] as const;

async function scheduleAguaNotifications(): Promise<void> {
  for (const hour of AGUA_HOURS) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '💧 Hora de tomar agua',
        body: 'Recuerda hidratarte, pequeño héroe',
        sound: true,
      },
      trigger: {
        type: SchedulableTriggerInputTypes.DAILY,
        hour,
        minute: 0,
      },
    });
  }
}

// ─── Metas incompletas trigger (18:00) ────────────────────────────────────────

async function scheduleMetasNotification(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📋 ¿Cómo van tus metas?',
      body: '¿Ya registraste tus metas de hoy? Abre HiC para checar',
      sound: true,
    },
    trigger: {
      type: SchedulableTriggerInputTypes.DAILY,
      hour: 18,
      minute: 0,
    },
  });
}

// ─── Resumen del día trigger (20:00) ──────────────────────────────────────────

async function scheduleResumenNotification(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⭐ Tu resumen del día',
      body: '¿Cómo te fue hoy? Revisa tu progreso en HiC',
      sound: true,
    },
    trigger: {
      type: SchedulableTriggerInputTypes.DAILY,
      hour: 20,
      minute: 0,
    },
  });
}

// ─── Cancel + Reschedule ──────────────────────────────────────────────────────

async function cancelAndReschedule(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await scheduleAguaNotifications();
  await scheduleMetasNotification();
  await scheduleResumenNotification();
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────

export async function scheduleAllNotifications(): Promise<void> {
  try {
    const granted = await requestNotificationPermission();
    if (!granted) {
      console.warn('[Notifications] Permission not granted — skipping schedule');
      return;
    }

    await cancelAndReschedule();
    console.log('[Notifications] All 9 notifications scheduled');
  } catch (error) {
    console.warn('[Notifications] Failed to schedule notifications:', error);
  }
}
