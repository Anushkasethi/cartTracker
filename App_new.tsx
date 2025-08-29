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
} from 'react-native';
import { LocationService, LocationData } from './src/services/LocationService';

const App: React.FC = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentPosition = async () => {
    setLoading(true);
    setError(null);

    try {
      const position = await LocationService.getCurrentPosition();
      setLocation(position);
    } catch (err: any) {
      const errorMessage = err.message || 'Unable to get location';
      setError(errorMessage);
      Alert.alert('Location Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Get location on app start
    getCurrentPosition();
  }, []);

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
              <Text style={styles.buttonText}>Call Go Cart</Text>
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
                  {LocationService.formatCoordinate(location.latitude)}°
                </Text>
              </View>

              <View style={styles.locationItem}>
                <Text style={styles.locationLabel}>Longitude:</Text>
                <Text style={styles.locationValue}>
                  {LocationService.formatCoordinate(location.longitude)}°
                </Text>
              </View>

              {/* <View style={styles.locationItem}>
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
              )} */}

              <View style={styles.locationItem}>
                <Text style={styles.locationLabel}>Timestamp:</Text>
                <Text style={styles.locationValue}>
                  {LocationService.formatTimestamp(location.timestamp)}
                </Text>
              </View>

              <View style={styles.coordinatesContainer}>
                <Text style={styles.coordinatesText}>
                  {LocationService.formatCoordinate(location.latitude)}, {LocationService.formatCoordinate(location.longitude)}
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
