import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

Geolocation.setRNConfiguration({
  skipPermissionRequests: false,
  authorizationLevel: 'whenInUse',
  enableBackgroundLocationUpdates: false,
  locationProvider: 'auto',
});

interface LocationData {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

const App: React.FC = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to track your cart.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        } else {
          setError('Location permission denied. Please enable location access in settings.');
          return false;
        }
      } catch (err) {
        console.warn(err);
        setError('Error requesting location permission');
        return false;
      }
    }
    return true; // iOS handles permissions automatically
  };

  const getCurrentPosition = async () => {
    setLoading(true);
    setError(null);

    // Request permission first on Android
    if (Platform.OS === 'android') {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setLoading(false);
        return;
      }
    }

    // Try with a shorter timeout first for cached location
    const tryWithCachedLocation = () => {
      return new Promise<void>((resolve, reject) => {
        Geolocation.getCurrentPosition(
          (position) => {
            const { coords, timestamp } = position;
            setLocation({
              latitude: coords.latitude,
              longitude: coords.longitude,
              altitude: coords.altitude,
              accuracy: coords.accuracy,
              altitudeAccuracy: coords.altitudeAccuracy,
              heading: coords.heading,
              speed: coords.speed,
              timestamp,
            });
            setLoading(false);
            setError(null);
            resolve();
          },
          (locationError) => {
            reject(locationError);
          },
          {
            enableHighAccuracy: false, // Use cached/network location first
            timeout: 5000, // Shorter timeout for cached location
            maximumAge: 120000, // Accept location up to 2 minutes old
          }
        );
      });
    };

    // Try with high accuracy if cached fails
    const tryWithHighAccuracy = () => {
      return new Promise<void>((resolve, reject) => {
        Geolocation.getCurrentPosition(
          (position) => {
            const { coords, timestamp } = position;
            setLocation({
              latitude: coords.latitude,
              longitude: coords.longitude,
              altitude: coords.altitude,
              accuracy: coords.accuracy,
              altitudeAccuracy: coords.altitudeAccuracy,
              heading: coords.heading,
              speed: coords.speed,
              timestamp,
            });
            setLoading(false);
            setError(null);
            resolve();
          },
          (gpsLocationError) => {
            reject(gpsLocationError);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000, // Longer timeout for GPS
            maximumAge: 0, // Force fresh location
          }
        );
      });
    };

    try {
      // First try to get cached/network location quickly
      await tryWithCachedLocation();
    } catch (cachedError) {
      console.log('Cached location failed, trying GPS...', cachedError);
      
      try {
        // If cached fails, try with high accuracy GPS
        await tryWithHighAccuracy();
      } catch (gpsError: any) {
        console.error('GPS location also failed:', gpsError);
        
        let errorMessage = 'Unable to get location';
        
        switch (gpsError?.code) {
          case 1:
            errorMessage = 'Location permission denied. Please enable location access in your device settings.';
            break;
          case 2:
            errorMessage = 'Location not available. Please check that location services are enabled and you have a clear view of the sky if outdoors.';
            break;
          case 3:
            errorMessage = 'Location request timed out. Please ensure you have a good GPS signal and try again.';
            break;
          default:
            errorMessage = `Location error: ${gpsError?.message || 'Unknown error'}`;
        }
        
        setError(errorMessage);
        setLoading(false);
        Alert.alert('Location Error', errorMessage);
      }
    }
  };

  useEffect(() => {
    // Get location on app start
    const initLocation = async () => {
      await getCurrentPosition();
    };
    initLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatCoordinate = (coord: number) => {
    return coord.toFixed(6);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={styles.header}>
          <Text style={styles.title}>Cart Tracker</Text>
          <Text style={styles.subtitle}>Location Service</Text>
        </View>

        <View style={styles.content}>
          <TouchableOpacity
            style={styles.button}
            onPress={getCurrentPosition}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Get Current Position</Text>
            )}
          </TouchableOpacity>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={getCurrentPosition}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}

          {!location && !error && !loading && (
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                Make sure location services are enabled on your device and grant permission when prompted.
              </Text>
            </View>
          )}

          {location && (
            <View style={styles.locationContainer}>
              <Text style={styles.sectionTitle}>Current Location</Text>
              
              <View style={styles.locationItem}>
                <Text style={styles.locationLabel}>Latitude:</Text>
                <Text style={styles.locationValue}>
                  {formatCoordinate(location.latitude)}°
                </Text>
              </View>

              <View style={styles.locationItem}>
                <Text style={styles.locationLabel}>Longitude:</Text>
                <Text style={styles.locationValue}>
                  {formatCoordinate(location.longitude)}°
                </Text>
              </View>

              <View style={styles.locationItem}>
                <Text style={styles.locationLabel}>Accuracy:</Text>
                <Text style={styles.locationValue}>
                  {location.accuracy.toFixed(2)} meters
                </Text>
              </View>

              {location.altitude !== null && (
                <View style={styles.locationItem}>
                  <Text style={styles.locationLabel}>Altitude:</Text>
                  <Text style={styles.locationValue}>
                    {location.altitude.toFixed(2)} meters
                  </Text>
                </View>
              )}

              {location.speed !== null && (
                <View style={styles.locationItem}>
                  <Text style={styles.locationLabel}>Speed:</Text>
                  <Text style={styles.locationValue}>
                    {(location.speed * 3.6).toFixed(2)} km/h
                  </Text>
                </View>
              )}

              {location.heading !== null && (
                <View style={styles.locationItem}>
                  <Text style={styles.locationLabel}>Heading:</Text>
                  <Text style={styles.locationValue}>
                    {location.heading.toFixed(2)}°
                  </Text>
                </View>
              )}

              <View style={styles.locationItem}>
                <Text style={styles.locationLabel}>Timestamp:</Text>
                <Text style={styles.locationValue}>
                  {formatTimestamp(location.timestamp)}
                </Text>
              </View>

              <View style={styles.coordinatesContainer}>
                <Text style={styles.coordinatesText}>
                  {formatCoordinate(location.latitude)}, {formatCoordinate(location.longitude)}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    borderColor: '#f44336',
    borderWidth: 1,
    marginBottom: 20,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
  },
  locationContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  locationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  locationLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  locationValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  coordinatesContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  coordinatesText: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#2196F3',
    fontWeight: 'bold',
  },
  retryButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoContainer: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    borderColor: '#2196F3',
    borderWidth: 1,
    marginBottom: 20,
  },
  infoText: {
    color: '#1976d2',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default App;