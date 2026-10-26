import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';

export const GEOFENCE_TASK = 'DESTINATION_GEOFENCE';

// Must be defined at the top level, not inside a component
TaskManager.defineTask(GEOFENCE_TASK, async ({ data, error }) => {
  if (error) {
    console.log('Geofence error:', error.message);
    return;
  }

  if (data.eventType === Location.GeofencingEventType.Enter) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Wake up! You are near your destination',
        body: 'Get ready to get off.',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: { channelId: 'alarm', seconds: 1 },
    });

    // One-time alarm: stop watching after it fires
    await Location.stopGeofencingAsync(GEOFENCE_TASK);
  }
});