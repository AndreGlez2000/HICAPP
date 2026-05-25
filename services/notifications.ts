import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Device from 'expo-device';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// ─── Permission ───────────────────────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  if (isExpoGo) {
    console.warn('[Notifications] Expo Go detected — skipping notifications');
    return false;
  }
  if (!Device.isDevice) {
    console.warn('[Notifications] Not a real device — skipping permission request');
    return false;
  }

  try {
    const Notifications = require('expo-notifications');
    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    if (existingStatus === 'granted') return true;
    if (existingStatus === 'denied') return false;

    // undetermined — request now
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.warn('[Notifications] Permission error:', error);
    return false;
  }
}

// ─── Agua triggers (7 daily) ──────────────────────────────────────────────────

const AGUA_HOURS = [8, 10, 12, 14, 16, 18, 20] as const;

async function scheduleAguaNotifications(): Promise<void> {
  if (isExpoGo) return;
  try {
    const Notifications = require('expo-notifications');
    for (const hour of AGUA_HOURS) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💧 Hora de tomar agua',
          body: 'Recuerda hidratarte, pequeño héroe',
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute: 0,
        },
      });
    }
  } catch (e) {}
}

// ─── Metas incompletas trigger (18:00) ────────────────────────────────────────

async function scheduleMetasNotification(): Promise<void> {
  if (isExpoGo) return;
  try {
    const Notifications = require('expo-notifications');
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📋 ¿Cómo van tus metas?',
        body: '¿Ya registraste tus metas de hoy? Abre HiC para checar',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 18,
        minute: 0,
      },
    });
  } catch (e) {}
}

// ─── Resumen del día trigger (20:00) ──────────────────────────────────────────

async function scheduleResumenNotification(): Promise<void> {
  if (isExpoGo) return;
  try {
    const Notifications = require('expo-notifications');
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⭐ Tu resumen del día',
        body: '¿Cómo te fue hoy? Revisa tu progreso en HiC',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 20,
        minute: 0,
      },
    });
  } catch (e) {}
}

// ─── Cancel + Reschedule ──────────────────────────────────────────────────────

async function cancelAndReschedule(): Promise<void> {
  if (isExpoGo) return;
  try {
    const Notifications = require('expo-notifications');
    await Notifications.cancelAllScheduledNotificationsAsync();
    await scheduleAguaNotifications();
    await scheduleMetasNotification();
    await scheduleResumenNotification();
  } catch (e) {}
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────

export async function scheduleAllNotifications(): Promise<void> {
  if (isExpoGo) {
    console.warn('[Notifications] Expo Go detected — skipping schedule');
    return;
  }
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
