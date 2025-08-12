import React from 'react';
import { View, Text } from 'react-native';
import { LocationData, LocationService } from '../services/LocationService';
import { cardStyles } from '../styles/componentStyles';

interface LocationDisplayProps {
  location: LocationData;
}

export const LocationDisplay: React.FC<LocationDisplayProps> = ({ location }) => {
  return (
    <View style={cardStyles.container}>
      <Text style={cardStyles.title}>Current Location</Text>
      
      <View style={cardStyles.row}>
        <Text style={cardStyles.label}>Latitude:</Text>
        <Text style={cardStyles.value}>
          {LocationService.formatCoordinate(location.latitude)}°
        </Text>
      </View>

      <View style={cardStyles.row}>
        <Text style={cardStyles.label}>Longitude:</Text>
        <Text style={cardStyles.value}>
          {LocationService.formatCoordinate(location.longitude)}°
        </Text>
      </View>

      {/* <View style={cardStyles.row}>
        <Text style={cardStyles.label}>Accuracy:</Text>
        <Text style={cardStyles.value}>
          {location.accuracy.toFixed(2)} meters
        </Text>
      </View>

      {location.altitude !== null && (
        <View style={cardStyles.row}>
          <Text style={cardStyles.label}>Altitude:</Text>
          <Text style={cardStyles.value}>
            {location.altitude.toFixed(2)} meters
          </Text>
        </View>
      )}

      {location.speed !== null && (
        <View style={cardStyles.row}>
          <Text style={cardStyles.label}>Speed:</Text>
          <Text style={cardStyles.value}>
            {(location.speed * 3.6).toFixed(2)} km/h
          </Text>
        </View>
      )}

      {location.heading !== null && (
        <View style={cardStyles.row}>
          <Text style={cardStyles.label}>Heading:</Text>
          <Text style={cardStyles.value}>
            {location.heading.toFixed(2)}°
          </Text>
        </View>
      )} */}

      <View style={cardStyles.row}>
        <Text style={cardStyles.label}>Timestamp:</Text>
        <Text style={cardStyles.value}>
          {LocationService.formatTimestamp(location.timestamp)}
        </Text>
      </View>

      <View style={cardStyles.highlight}>
        <Text style={cardStyles.highlightText}>
          {LocationService.formatCoordinate(location.latitude)}, {LocationService.formatCoordinate(location.longitude)}
        </Text>
      </View>
    </View>
  );
};
