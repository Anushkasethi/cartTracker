import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { LocationData } from '../services/LocationService';

interface LocationOnMapProps {
  location: LocationData;
}

export const MapLocation: React.FC<LocationOnMapProps> = ({ location }) => {
  const latitude = location.latitude;
  const longitude = location.longitude;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.01, // Closer zoom level
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        followsUserLocation={true}
      >
        <Marker 
          coordinate={{ latitude, longitude }} 
          title="Current Location" 
        //   description={`Accuracy: ${location.accuracy.toFixed(1)}m`}
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300, // Fixed height instead of flex: 1
    marginVertical: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
});
