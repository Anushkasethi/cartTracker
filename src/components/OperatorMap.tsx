// src/components/OperatorMap.tsx
import React from 'react';
import MapView, { Marker, Callout } from 'react-native-maps';
import { View, Text, TouchableOpacity } from 'react-native';

export const OperatorMap = ({
  myLocation,
  pending,
  accepted,
  onAccept,
}: {
  myLocation: { latitude: number; longitude: number } | null;
  pending: Array<{ id: string; location: { latitude: number; longitude: number } }>;
  accepted: Array<{ id: string; location: { latitude: number; longitude: number } }>;
  onAccept: (id: string) => void;
}) => {
  const region = myLocation ? {
    latitude: myLocation.latitude,
    longitude: myLocation.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  } : {
    latitude: 28.284300028719418, longitude: 77.067064776886228, latitudeDelta: 0.1, longitudeDelta: 0.1 
  };

  return (
    <MapView 
      style={{ height: 380, borderRadius: 12 }} 
      region={region}
      animateToRegion={true}
    >
      {myLocation && <Marker coordinate={myLocation} title="You (Operator)" pinColor="blue" />}

      {pending.map((r) => (
        <Marker key={`p-${r.id}`} coordinate={r.location} pinColor="red">
          <Callout onPress={() => onAccept(r.id)}>
            <View style={{ width: 160 }}>
              <Text style={{ fontWeight: '600' }}>Pending #{r.id.slice(-5)}</Text>
              <TouchableOpacity style={{ marginTop: 6, backgroundColor: '#0ea5e9', padding: 6, borderRadius: 6 }}>
                <Text style={{ color: '#fff', textAlign: 'center' }}>Accept</Text>
              </TouchableOpacity>
            </View>
          </Callout>
        </Marker>
      ))}

      {accepted.map((r) => (
        <Marker key={`a-${r.id}`} coordinate={r.location} pinColor="green" title={`Accepted #${r.id.slice(-5)}`} />
      ))}
    </MapView>
  );
};
