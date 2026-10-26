import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import {
    Alert, SafeAreaView,
    StyleSheet, Text,
    TextInput, TouchableOpacity
} from 'react-native';
import { cancelAlarm, isAlarmActive, startAlarm } from './alarm';
import './tasks'; // must be the first import so the task is registered

export default function App() {
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [radius, setRadius] = useState('1500');
  const [active, setActive] = useState(false);

  useEffect(() => {
    isAlarmActive().then(setActive).catch(() => {});
  }, []);

  const useCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Location permission needed');
    const pos = await Location.getCurrentPositionAsync({});
    setLat(String(pos.coords.latitude));
    setLng(String(pos.coords.longitude));
  };

  const onStart = async () => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const r = parseInt(radius, 10);

    if (isNaN(latitude) || isNaN(longitude) || isNaN(r)) {
      return Alert.alert('Enter valid latitude, longitude and radius');
    }
    if (r < 200) {
      return Alert.alert('Radius too small', 'Use at least 200 m for reliable detection.');
    }

    const res = await startAlarm(latitude, longitude, r);
    if (!res.ok) return Alert.alert('Cannot start', res.reason);

    setActive(true);
    Alert.alert('Alarm set', 'You can close the app. You will be alerted near your destination.');
  };

  const onCancel = async () => {
    await cancelAlarm();
    setActive(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>📍 Location Alarm</Text>
      <Text style={styles.hint}>
        Tip: In Google Maps, long-press your destination and copy the coordinates shown.
      </Text>

      <TextInput style={styles.input} placeholder="Latitude (e.g. 18.5204)"
        keyboardType="numeric" value={lat} onChangeText={setLat} />
      <TextInput style={styles.input} placeholder="Longitude (e.g. 73.8567)"
        keyboardType="numeric" value={lng} onChangeText={setLng} />
      <TextInput style={styles.input} placeholder="Radius in metres"
        keyboardType="numeric" value={radius} onChangeText={setRadius} />

      <TouchableOpacity style={styles.secondary} onPress={useCurrentLocation}>
        <Text style={styles.secondaryText}>Use my current location (for testing)</Text>
      </TouchableOpacity>

      {active ? (
        <TouchableOpacity style={[styles.button, styles.cancel]} onPress={onCancel}>
          <Text style={styles.buttonText}>Cancel alarm</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.button} onPress={onStart}>
          <Text style={styles.buttonText}>Set alarm</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.status}>
        Status: {active ? '🟢 Alarm active' : '⚪ No alarm set'}
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 8 },
  hint: { color: '#666', marginBottom: 16 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 12, marginBottom: 12, fontSize: 16,
  },
  button: {
    backgroundColor: '#2563eb', padding: 16, borderRadius: 10,
    alignItems: 'center', marginTop: 12,
  },
  cancel: { backgroundColor: '#dc2626' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  secondary: { padding: 10, alignItems: 'center' },
  secondaryText: { color: '#2563eb' },
  status: { marginTop: 20, fontSize: 16, textAlign: 'center' },
});