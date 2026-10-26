import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { GEOFENCE_TASK } from './tasks';

// Show notifications even when the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function setupChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('alarm', {
    name: 'Destination alarm',
    importance: Notifications.AndroidImportance.MAX,
    sound: 'default',
    vibrationPattern: [0, 800, 400, 800, 400, 800],
    bypassDnd: true,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

export async function requestAllPermissions() {
  await setupChannel();

  const notif = await Notifications.requestPermissionsAsync();
  if (!notif.granted) return { ok: false, reason: 'Notification permission denied' };

  const fg = await Location.requestForegroundPermissionsAsync();
  if (fg.status !== 'granted') return { ok: false, reason: 'Location permission denied' };

  // On Android 11+, this sends the user to Settings to choose "Allow all the time"
  const bg = await Location.requestBackgroundPermissionsAsync();
  if (bg.status !== 'granted') {
    return { ok: false, reason: 'Please choose "Allow all the time" for location' };
  }
  return { ok: true };
}

export async function startAlarm(latitude, longitude, radius) {
  const perm = await requestAllPermissions();
  if (!perm.ok) return perm;

  await Location.startGeofencingAsync(GEOFENCE_TASK, [
    {
      identifier: 'destination',
      latitude,
      longitude,
      radius, // metres
      notifyOnEnter: true,
      notifyOnExit: false,
    },
  ]);
  return { ok: true };
}

export async function cancelAlarm() {
  const active = await Location.hasStartedGeofencingAsync(GEOFENCE_TASK);
  if (active) await Location.stopGeofencingAsync(GEOFENCE_TASK);
}

export function isAlarmActive() {
  return Location.hasStartedGeofencingAsync(GEOFENCE_TASK);
}